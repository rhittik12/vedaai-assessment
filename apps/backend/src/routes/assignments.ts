import { Router, type NextFunction, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { getAssignmentGenerationQueue } from '../config/bullmq';
import { upload } from '../middleware/multer';
import { Assignment } from '../models';

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

function createHttpError(message: string, status: number) {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
}

function parseQuestionTypes(rawValue: unknown): AssignmentQuestionType[] {
  if (typeof rawValue !== 'string') {
    throw createHttpError('questionTypes must be a JSON string', 400);
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    throw createHttpError('questionTypes must contain valid JSON', 400);
  }

  if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
    throw createHttpError('questionTypes must be a non-empty array', 400);
  }

  const allowedTypes = new Set<AssignmentQuestionType['type']>([
    'Multiple Choice Questions',
    'Short Questions',
    'Diagram/Graph-Based Questions',
    'Numerical Problems',
    'Long Answer Questions'
  ]);

  return parsedValue.map((entry) => {
    if (typeof entry !== 'object' || entry === null) {
      throw createHttpError('Each question type must be an object', 400);
    }

    const candidate = entry as Partial<AssignmentQuestionType>;
      const type = candidate.type;
      const count = candidate.count;
      const marks = candidate.marks;

      if (!type || !allowedTypes.has(type)) {
      throw createHttpError('Invalid question type value', 400);
    }

      if (typeof count !== 'number' || !Number.isFinite(count) || count <= 0) {
      throw createHttpError('questionTypes count must be a positive number', 400);
    }

      if (typeof marks !== 'number' || !Number.isFinite(marks) || marks <= 0) {
      throw createHttpError('questionTypes marks must be a positive number', 400);
    }

    return {
        type,
        count,
        marks
    };
  });
}

const router = Router();

router.post('/', upload.single('file'), async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { dueDate, questionTypes: rawQuestionTypes, additionalInfo } = request.body as {
      dueDate?: string;
      questionTypes?: string;
      additionalInfo?: string;
    };

    if (!dueDate) {
      throw createHttpError('dueDate is required', 400);
    }

    const questionTypes = parseQuestionTypes(rawQuestionTypes);
    const totalQuestions = questionTypes.reduce((sum, entry) => sum + entry.count, 0);
    const totalMarks = questionTypes.reduce((sum, entry) => sum + entry.count * entry.marks, 0);
    const assignmentId = uuidv4();

    const assignment = await Assignment.create({
      id: assignmentId,
      dueDate,
      questionTypes,
      additionalInfo,
      totalQuestions,
      totalMarks,
      status: 'pending',
      fileName: request.file?.originalname
    });

    const queue = getAssignmentGenerationQueue();
    const job = await queue.add('generate-assignment', {
      assignmentId
    });

    assignment.jobId = String(job.id);
    await assignment.save();

    response.status(201).json({
      assignmentId,
      jobId: String(job.id),
      status: assignment.status
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (_request: Request, response: Response, next: NextFunction) => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .select('id fileUrl fileName dueDate status totalQuestions totalMarks jobId createdAt updatedAt');

    response.json(assignments);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findOne({ id: request.params.id });

    if (!assignment) {
      throw createHttpError('Assignment not found', 404);
    }

    response.json(assignment);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (request: Request, response: Response, next: NextFunction) => {
  try {
    const result = await Assignment.deleteOne({ id: request.params.id });

    if (result.deletedCount === 0) {
      throw createHttpError('Assignment not found', 404);
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
