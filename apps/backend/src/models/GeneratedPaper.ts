import { Schema } from 'mongoose';

export interface IGeneratedPaper {
  assignmentId: string;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  sections: Array<{
    title: string;
    instruction: string;
    questions: Array<{
      number: number;
      text: string;
      difficulty: 'Easy' | 'Moderate' | 'Challenging';
      marks: number;
      type: string;
      answer?: string;
    }>;
  }>;
  answerKey: Array<{
    questionNumber: number;
    answer: string;
  }>;
}

const QuestionSchema = new Schema(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Challenging'],
      required: true
    },
    marks: { type: Number, required: true },
    type: { type: String, required: true },
    answer: { type: String }
  },
  { _id: false }
);

const SectionSchema = new Schema(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true }
  },
  { _id: false }
);

const AnswerKeySchema = new Schema(
  {
    questionNumber: { type: Number, required: true },
    answer: { type: String, required: true }
  },
  { _id: false }
);

export const GeneratedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: { type: String, required: true },
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    sections: { type: [SectionSchema], required: true },
    answerKey: { type: [AnswerKeySchema], required: true }
  },
  { _id: false }
);
