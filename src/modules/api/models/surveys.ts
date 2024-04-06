import { TaskType } from './tasks';

export type CreateSurveyResponse = {
  id: string;
};

type DateString = string;
export type SurveyStatus = 'CREATED' | 'PUBLISHED' | 'COMPLETED' | 'STOPPED';

export type Survey = {
  id: string;
  type: TaskType;
  status: SurveyStatus;
  title?: string;
  description?: string;
  createdAt?: string;
  publishedAt?: string | null;
  schedule?: string;
  startTime?: DateString;
  endTime?: DateString;
  validTime?: number;
  taks?: Record<string, unknown>;
};

