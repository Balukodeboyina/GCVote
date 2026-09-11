/**
 * PulseVote WebSocket Event Names and Protocol Payloads
 */

import { AggregateResults, SessionState, VoteSubmission } from './types.js';

export const WS_EVENTS = {
  // Connection & Handshake
  PING: 'pulse:ping',
  PONG: 'pulse:pong',

  // Room Management
  JOIN_SESSION: 'session:join',
  LEAVE_SESSION: 'session:leave',
  SESSION_UPDATED: 'session:updated',
  SESSION_ENDED: 'session:ended',
  PARTICIPANT_COUNT_UPDATED: 'session:participant_count',

  // Slide & Navigation
  CHANGE_SLIDE: 'slide:change',
  SLIDE_CHANGED: 'slide:changed',

  // Responses & Voting
  SUBMIT_VOTE: 'vote:submit',
  VOTE_ACKNOWLEDGED: 'vote:ack',
  VOTE_ERROR: 'vote:error',
  RESULTS_UPDATED: 'results:updated',

  // Controls (Presenter)
  LOCK_RESPONSES: 'control:lock_responses',
  UNLOCK_RESPONSES: 'control:unlock_responses',
  RESPONSES_LOCKED_STATE: 'control:responses_locked_state',
} as const;

export interface JoinSessionPayload {
  sessionCode: string;
  participantId?: string;
  role: 'PRESENTER' | 'PARTICIPANT';
}

export interface JoinSessionResult {
  success: boolean;
  message?: string;
  session?: SessionState;
  participantId?: string;
}

export interface SlideChangePayload {
  sessionId: string;
  targetSlideIndex: number;
}

export interface VoteAckPayload {
  success: boolean;
  questionId: string;
  timestamp: string;
  message?: string;
}
