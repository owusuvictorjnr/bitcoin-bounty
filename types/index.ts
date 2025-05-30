import { FieldValue, Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'company' | 'developer';
  btcAddress?: string; // For developers
  companyName?: string; // For companies
  createdAt: Timestamp;
}

export interface Bounty {
  id: string; // Firestore document ID
  companyId: string; // UID of the company user
  companyName?: string; // Denormalized for display
  title: string;
  description: string;
  skills: string[];
  bountyAmountBTC: number;
  status: 'OPEN' | 'REVIEWING' | 'CLOSED' | 'PAID'; 
  createdAt: Timestamp;
  deadline?: Timestamp;
  winnerId?: string; // Developer UID
  winningSubmissionId?: string;
}

export interface Submission {
  id: string; // Firestore document ID
  bountyId: string;
  developerId: string; // UID of the developer user
  developerName?: string; // Denormalized
  githubRepoUrl: string; 
  deployedUrl?: string; 
  commitHash?: string; //  commit hash for proof
  solutionHash: string; //  commit hash for proof 
  hostedSolutionUrl?: string;
  comments?: string;
  submittedAt: Timestamp;
  status: 'PENDING_REVIEW' | 'REJECTED' | 'WINNER'; 
}

export type AuditEvent =
  | 'USER_CREATED'
  | 'BOUNTY_POSTED' 
  | 'SUBMISSION_RECEIVED' 
  | 'WINNER_SELECTED' 
  | 'BOUNTY_PAYMENT_MARKED_PAID'; 

export interface AuditLogEntry {
  id: string; // Firestore document ID
  timestamp: Timestamp | FieldValue;
  eventType: AuditEvent;
  actorUserId: string;
  actorDisplayName?: string;
  targetBountyId?: string;
  targetBountyTitle?: string;
  targetSubmissionId?: string;
  targetUserId?: string; // winner
  details?: string | object; //  { btcAmount: 0.001 }
}