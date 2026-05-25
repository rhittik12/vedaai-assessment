import OpenAI from 'openai';
import { type Job, Worker } from 'bullmq';
import type { Server as SocketIOServer } from 'socket.io';

import { loadBackendEnv } from '../config/loadEnv';
import { getRedisClient } from '../config/redis';
import { Assignment } from '../models';
import type { IGeneratedPaper } from '../models/GeneratedPaper';

loadBackendEnv();

type AssignmentQuestionType = {
  type:
    | 'Multiple Choice Questions'
    | 'Short Questions'
    | 'Diagram/Graph-Based Questions'
    | 'Numerical Problems'
    | 'Long Answer Questions';
  count: number;
  marks: number;
};

type AssignmentGenerationJobData = {
  assignmentId: string;
  dueDate: string;
  questionTypes: AssignmentQuestionType[];
  additionalInfo?: string;
  totalQuestions: number;
  totalMarks: number;
  fileName?: string;
};

type SourceAttachment =
  | {
      type: 'input_file';
      detail: 'low' | 'high';
      file_data: string;
      filename?: string;
    }
  | {
      type: 'input_image';
      detail: 'low' | 'high' | 'auto' | 'original';
      image_url: string;
    };

const sectionTitles: Record<AssignmentQuestionType['type'], string> = {
  'Multiple Choice Questions': 'Section A',
  'Short Questions': 'Section B',
  'Diagram/Graph-Based Questions': 'Section C',
  'Numerical Problems': 'Section D',
  'Long Answer Questions': 'Section E'
};

function createHttpError(message: string): Error {
  return new Error(message);
}

function stripMarkdownFences(rawText: string): string {
  const trimmedText = rawText.trim();

  if (!trimmedText.startsWith('```')) {
    return trimmedText;
  }

  return trimmedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

function parseGeneratedPaper(rawText: string): IGeneratedPaper {
  const sanitizedText = stripMarkdownFences(rawText);
  const firstBraceIndex = sanitizedText.indexOf('{');
  const lastBraceIndex = sanitizedText.lastIndexOf('}');

  if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex < firstBraceIndex) {
    throw createHttpError('AI response did not contain valid JSON');
  }

  const candidateJson = sanitizedText.slice(firstBraceIndex, lastBraceIndex + 1);
  let parsedValue: IGeneratedPaper;
  try {
    parsedValue = JSON.parse(candidateJson) as IGeneratedPaper;
  } catch (err: any) {
    throw createHttpError(`AI response contained invalid JSON: ${err?.message || String(err)}`);
  }

  if (
    typeof parsedValue !== 'object' ||
    parsedValue === null ||
    typeof parsedValue.schoolName !== 'string' ||
    typeof parsedValue.subject !== 'string' ||
    typeof parsedValue.className !== 'string' ||
    typeof parsedValue.timeAllowed !== 'string' ||
    typeof parsedValue.maxMarks !== 'number' ||
    !Array.isArray(parsedValue.sections) ||
    !Array.isArray(parsedValue.answerKey)
  ) {
    throw createHttpError('AI response JSON did not match the required schema');
  }

  return parsedValue;
}

function buildSectionsSummary(questionTypes: AssignmentQuestionType[]): string {
  return questionTypes
    .map((questionType, index) => {
      const sectionTitle = sectionTitles[questionType.type];
      return `${index + 1}. ${sectionTitle} - ${questionType.type}: ${questionType.count} questions, ${questionType.marks} marks each`;
    })
    .join('\n');
}

function buildPrompt(jobData: AssignmentGenerationJobData): string {
  const questionTypesSummary = buildSectionsSummary(jobData.questionTypes);
  const additionalInfoSection = jobData.additionalInfo?.trim()
    ? jobData.additionalInfo.trim()
    : 'No additional instructions provided.';

  return [
    'You are an expert teacher creating a question paper for a school exam.',
    'Generate a complete paper from the assignment requirements below and the attached source file.',
    'The uploaded file is the authoritative reference. Do not invent unrelated topics, chapters, or section content.',
    'Use the source file to keep the paper grounded in the same subject matter, section categories, and visible structure.',
    '',
    'Requirements:',
    `- Assignment ID: ${jobData.assignmentId}`,
    `- Due date: ${jobData.dueDate}`,
    `- Total questions: ${jobData.totalQuestions}`,
    `- Total marks: ${jobData.totalMarks}`,
    `- Additional info: ${additionalInfoSection}`,
    `- Source file name: ${jobData.fileName ?? 'unknown'}`,
    '',
    'Question type breakdown grouped into sections:',
    questionTypesSummary,
    '',
    'Rules:',
    '- Use the uploaded file to determine the actual subject focus, chapters, and category emphasis before writing questions.',
    '- If the source file contains diagram, graph, table, or image-based prompts, keep those as diagram/graph-based questions instead of replacing them with generic text questions.',
    '- Preserve the source paper’s section style and topic coverage as closely as possible while still generating fresh questions.',
    '- Use Section A for Multiple Choice Questions, Section B for Short Questions, Section C for Diagram/Graph-Based Questions, Section D for Numerical Problems, and Section E for Long Answer Questions.',
    '- Vary difficulty across the paper so that approximately 30% of questions are Easy, 40% are Moderate, and 30% are Challenging.',
    '- Keep question wording clear, academic, and appropriate for the assigned class level.',
    '- Include an answer key with the full answer for every question.',
    '- Return ONLY valid JSON. Do not wrap the response in markdown fences or add commentary.',
    '',
    'Return JSON that matches exactly this schema:',
    '{',
    '  "schoolName": "Delhi Public School",',
    '  "subject": "General",',
    '  "className": "Class 10",',
    '  "timeAllowed": "45 minutes",',
    `  "maxMarks": ${jobData.totalMarks},`,
    '  "sections": [',
    '    {',
    '      "title": "Section A",',
    '      "instruction": "Attempt all questions. Each question carries X marks",',
    '      "questions": [',
    '        {',
    '          "number": 1,',
    '          "text": "question text here",',
    '          "difficulty": "Easy",',
    '          "marks": 1,',
    '          "type": "Multiple Choice Questions",',
    '          "answer": "answer text"',
    '        }',
    '      ]',
    '    }',
    '  ],',
    '  "answerKey": [{ "questionNumber": 1, "answer": "full answer" }]',
    '}'
  ].join('\n');
}

function buildSourceAttachment(assignment: {
  fileName?: string;
  fileMimeType?: string | null;
  fileBuffer?: Buffer | null;
}): SourceAttachment[] {
  const fileBuffer = assignment.fileBuffer;
  const fileMimeType = assignment.fileMimeType?.trim();

  if (!fileBuffer || !fileMimeType) {
    return [];
  }

  const base64Data = fileBuffer.toString('base64');

  if (fileMimeType.startsWith('image/')) {
    return [
      {
        type: 'input_image',
        detail: 'high',
        image_url: `data:${fileMimeType};base64,${base64Data}`
      }
    ];
  }

  if (fileMimeType === 'application/pdf') {
    return [
      {
        type: 'input_file',
        detail: 'high',
        file_data: base64Data,
        filename: assignment.fileName
      }
    ];
  }

  return [];
}

async function generatePaperWithOpenAI(
  jobData: AssignmentGenerationJobData,
  assignment: { fileName?: string; fileMimeType?: string | null; fileBuffer?: Buffer | null }
): Promise<IGeneratedPaper> {
  // Implementation uses OpenAI (not Claude/Anthropic)
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw createHttpError('OPENAI_API_KEY is not set');
  }

  const client = new OpenAI({ apiKey });
  const prompt = buildPrompt(jobData);
  const sourceAttachment = buildSourceAttachment(assignment);
  const inputContent = [{ type: 'input_text', text: prompt }, ...sourceAttachment];

  try {
    const respResp = await client.responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'user',
          content: inputContent
        }
      ],
      max_output_tokens: 3000,
      temperature: 0.2
    } as any);

    const textFromResponse =
      (typeof (respResp as any)?.output_text === 'string' && (respResp as any).output_text.trim()) ||
      (Array.isArray((respResp as any)?.output) &&
        (respResp as any).output
          .flatMap((out: any) => {
            if (typeof out?.content === 'string') {
              return [out.content];
            }

            if (Array.isArray(out?.content)) {
              return out.content
                .map((contentItem: any) => contentItem?.text)
                .filter((text: unknown): text is string => typeof text === 'string');
            }

            return [];
          })
          .join('\n')) ||
      '';

    if (!textFromResponse.trim()) {
      throw createHttpError('OpenAI response did not contain text output');
    }

    return parseGeneratedPaper(textFromResponse);
  } catch (err: any) {
    const msg = err?.message || String(err);
    throw createHttpError(`OpenAI generation error: ${msg}`);
  }
}

export function createGenerationWorker(io: SocketIOServer) {
  return new Worker(
    'assignment-generation',
    async (job: Job<AssignmentGenerationJobData>) => {
      const { assignmentId } = job.data;

      try {
        const assignment = await Assignment.findOneAndUpdate(
          { id: assignmentId },
          { status: 'processing', jobId: String(job.id) },
          { new: true }
        ).select('+fileMimeType +fileBuffer');

        if (!assignment) {
          throw createHttpError(`Assignment ${assignmentId} not found`);
        }

        io.emit('job:processing', { assignmentId });

        const generatedPaper = {
          ...(await generatePaperWithOpenAI(job.data, assignment)),
          assignmentId
        };

        assignment.result = generatedPaper;
        assignment.status = 'completed';
        assignment.jobId = String(job.id);
        await assignment.save();

        io.emit('job:completed', {
          assignmentId,
          result: generatedPaper
        });

        return generatedPaper;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown generation error';

        await Assignment.findOneAndUpdate(
          { id: assignmentId },
          {
            status: 'failed'
          }
        );

        io.emit('job:failed', {
          assignmentId,
          error: errorMessage
        });

        throw error;
      }
    },
    {
      connection: getRedisClient(),
      concurrency: 1
    }
  );
}
