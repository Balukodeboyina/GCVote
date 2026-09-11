import { QuestionType, QuestionSettings } from '@pulsevote/shared';

export interface EditorOption {
  id?: string;
  text: string;
  isCorrect?: boolean;
  orderIndex: number;
}

export interface EditorQuestion {
  id: string;
  presentationId: string;
  type: QuestionType;
  questionText: string;
  position: number;
  settings: QuestionSettings;
  options: EditorOption[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PresentationMetadata {
  id: string;
  title: string;
  description: string | null;
}
