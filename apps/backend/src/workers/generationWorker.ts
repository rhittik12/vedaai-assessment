import OpenAI from 'openai';
import { type Job, Worker } from 'bullmq';
import type { Server as SocketIOServer } from 'socket.io';

import { getRedisClient } from '../config/redis';
import { Assignment } from '../models';
import type { IGeneratedPaper } from '../models/GeneratedPaper';

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
  const parsedValue = JSON.parse(candidateJson) as IGeneratedPaper;

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
    'Generate a complete paper from the assignment requirements below.',
    '',
    'Requirements:',
    `- Assignment ID: ${jobData.assignmentId}`,
    `- Due date: ${jobData.dueDate}`,
    `- Total questions: ${jobData.totalQuestions}`,
    `- Total marks: ${jobData.totalMarks}`,
    `- Additional info: ${additionalInfoSection}`,
    '',
    'Question type breakdown grouped into sections:',
    questionTypesSummary,
    '',
    'Rules:',
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

async function generatePaperWithClaude(jobData: AssignmentGenerationJobData): Promise<IGeneratedPaper> {
  // OpenAI implementation
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw createHttpError('OPENAI_API_KEY is not set');
  }

  const client = new OpenAI({ apiKey });
  const prompt = buildPrompt(jobData);

  try {
    // Try Chat Completions (chat API)
    const chatResp = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
      temperature: 0.7
    } as any);

    const textFromChat =
      (Array.isArray((chatResp as any)?.choices) && (chatResp as any).choices[0]?.message?.content) ||
      (chatResp as any)?.choices?.[0]?.delta?.content ||
      '';

    if (typeof textFromChat === 'string' && textFromChat.trim()) {
      return parseGeneratedPaper(textFromChat);
    }

    // Fallback to Responses API
    const respResp = await client.responses.create({
      model: 'gpt-4',
      input: prompt,
      max_output_tokens: 3000,
      temperature: 0.7
    } as any);

    let candidate = '';
    if (Array.isArray((respResp as any)?.output)) {
      for (const out of (respResp as any).output) {
        if (typeof out?.content === 'string') {
          candidate += out.content + '\n';
        } else if (Array.isArray(out?.content)) {
          for (const c of out.content) {
            if (typeof c?.text === 'string') candidate += c.text + '\n';
          }
        }
      }
    }

    if (!candidate.trim()) {
      throw createHttpError('OpenAI response did not contain text output');
    }

    return parseGeneratedPaper(candidate);
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
        );

        if (!assignment) {
          throw createHttpError(`Assignment ${assignmentId} not found`);
        }

        io.emit('job:processing', { assignmentId });

        const generatedPaper = await generatePaperWithClaude(job.data);

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
