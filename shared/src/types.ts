/**
 * PulseVote Shared Domain Models and Enums
 */

export type Role = 'PRESENTER' | 'PARTICIPANT' | 'ADMIN';

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'WORD_CLOUD'
  | 'OPEN_ENDED'
  | 'RATING'
  | 'QUIZ';

export type SessionStatus = 'WAITING' | 'ACTIVE' | 'PAUSED' | 'ENDED';

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect?: boolean;
  orderIndex: number;
}

export interface QuestionSummary {
  id: string;
  slideId: string;
  type: QuestionType;
  title: string;
  description?: string;
  options: QuestionOption[];
  timeLimitSeconds?: number;
  points?: number;
}

export interface SlideSummary {
  id: string;
  presentationId: string;
  orderIndex: number;
  title: string;
  question?: QuestionSummary;
}

export interface PresentationSummary {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  slidesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionState {
  id: string;
  presentationId: string;
  code: string; // 6-digit session join code
  status: SessionStatus;
  currentSlideIndex: number;
  activeQuestionId?: string;
  participantCount: number;
  acceptingResponses: boolean;
  createdAt: string;
}

export interface VoteSubmission {
  sessionId: string;
  questionId: string;
  participantId: string;
  optionIds?: string[];
  textResponse?: string;
  ratingValue?: number;
}

export interface AggregateResultItem {
  optionId: string;
  text: string;
  count: number;
  percentage: number;
}

export interface AggregateResults {
  questionId: string;
  totalVotes: number;
  items: AggregateResultItem[];
}

export interface SystemHealth {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  connections: {
    activeSessions: number;
    activeSockets: number;
  };
}
