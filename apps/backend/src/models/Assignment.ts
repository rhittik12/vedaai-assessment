import { Schema, model, type InferSchemaType } from 'mongoose';

import { GeneratedPaperSchema } from './GeneratedPaper';

export interface IAssignment {
  id: string;
  fileUrl?: string;
  fileName?: string;
  fileMimeType?: string;
  fileBuffer?: Buffer;
  dueDate: string;
  questionTypes: Array<{
    type:
      | 'Multiple Choice Questions'
      | 'Short Questions'
      | 'Diagram/Graph-Based Questions'
      | 'Numerical Problems'
      | 'Long Answer Questions';
    count: number;
    marks: number;
  }>;
  additionalInfo?: string;
  totalQuestions: number;
  totalMarks: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  result?: InferSchemaType<typeof GeneratedPaperSchema>;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentQuestionTypeSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'Multiple Choice Questions',
        'Short Questions',
        'Diagram/Graph-Based Questions',
        'Numerical Problems',
        'Long Answer Questions'
      ]
    },
    count: { type: Number, required: true },
    marks: { type: Number, required: true }
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    id: { type: String, required: true, unique: true },
    fileUrl: { type: String },
    fileName: { type: String },
    fileMimeType: { type: String, select: false },
    fileBuffer: { type: Buffer, select: false },
    dueDate: { type: String, required: true },
    questionTypes: { type: [AssignmentQuestionTypeSchema], required: true },
    additionalInfo: { type: String },
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    jobId: { type: String },
    result: { type: GeneratedPaperSchema, required: false }
  },
  {
    timestamps: true
  }
);

export const Assignment = model<IAssignment>('Assignment', AssignmentSchema);
export type AssignmentDocument = InferSchemaType<typeof AssignmentSchema>;
