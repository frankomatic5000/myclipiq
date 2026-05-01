// MyClipIQ TypeScript Types

export interface Customer {
  id: string;
  name: string;
  email: string;
  instagram?: string;
  phone?: string;
  contentType: 'podcast' | 'external' | 'teleprompter' | 'mentorship';
  isManagedByUs: boolean;
  packageType: 'basic' | 'pro' | 'enterprise';
  monthlyPosts: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  rawVideoUrl?: string;
  status: ProjectStatus;
  createdAt: string;
  editingStartedAt?: string;
  analysisCompletedAt?: string;
  sentForReviewAt?: string;
  approvedAt?: string;
  postedAt?: string;
  archivedAt?: string;
}

export type ProjectStatus = 
  | 'intake' 
  | 'editing' 
  | 'analysis' 
  | 'review' 
  | 'approved' 
  | 'posted' 
  | 'archived';

export interface EditedVideo {
  id: string;
  projectId: string;
  version: number;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  fileSize: number;
  hook?: string;
  caption?: string;
  hashtags?: string[];
  viralScore?: number;
  language: 'pt' | 'en';
  status: 'pending' | 'review' | 'approved' | 'rejected';
  reviewerNotes?: string;
  createdAt: string;
}

export interface AIAnalysis {
  projectId: string;
  videoId: string;
  transcription: string;
  language: string;
  hooks: Hook[];
  captions: {
    portuguese?: string;
    english?: string;
  };
  hashtags: {
    primary: string[];
    secondary: string[];
    trending: string[];
  };
  viralScore: number;
  predictedViews?: number;
  predictedEngagement?: number;
  optimalPosting?: {
    day: string;
    time: string;
    timezone: string;
  };
  createdAt: string;
}

export interface Hook {
  text: string;
  score: number;
  type: 'emotional' | 'suspense' | 'transformation' | 'question' | 'controversial';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'project_created' | 'analysis_complete' | 'review_requested' | 'approved' | 'posted';
  message: string;
  read: boolean;
  createdAt: string;
}
