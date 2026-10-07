// ==============================================================================
// CertiFlow Core Type Definitions
// ==============================================================================

export type PhaseType = 1 | 2 | 3; // 1: 개념정독, 2: 핵심회독, 3: 기출스프린트

export interface Profile {
  id: string; // auth.users.id
  email: string;
  createdAt: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  examDate: string;  // YYYY-MM-DD
  dailyStudyHours: number;
  restDaysWeekly: number[]; // 0(일) ~ 6(토)
  customRestDates: string[]; // ['2026-10-09', ...]
  curriculumSource?: string;
  createdAt: string;
}

export interface StudyTask {
  id: string;
  planId: string;
  taskDate: string; // YYYY-MM-DD
  phase: PhaseType;
  subject: string;
  chapter: string;
  learningPoints: string[];
  estimatedMinutes: number;
  reviewCount: number;
  isCompleted: boolean;
  isRestDay: boolean;
  completedAt?: string | null;
}

export interface GenerateScheduleRequest {
  examTitle: string;
  startDate: string;
  examDate: string;
  dailyHours: number;
  restDaysWeekly: number[];
  customRestDates: string[];
  curriculumText: string;
}

export interface GenerateScheduleResponse {
  plan: Omit<StudyPlan, 'id' | 'userId' | 'createdAt'>;
  tasks: Array<{
    date: string;
    phase: PhaseType;
    subject: string;
    chapter: string;
    learningPoints: string[];
    estimatedMinutes: number;
    reviewCount: number;
    isRestDay: boolean;
  }>;
}

export type RescheduleMode = 'DISTRIBUTE' | 'USE_REST_DAY';

export interface RescheduleRequest {
  planId: string;
  uncompletedTaskIds: string[];
  rescheduleMode: RescheduleMode;
}

export interface RescheduleResponse {
  success: boolean;
  message: string;
  mode: RescheduleMode;
  updatedTasks: StudyTask[];
}

export interface CurriculumPreset {
  id: string;
  title: string;
  description: string;
  defaultDailyHours: number;
  subjects: Array<{
    name: string;
    color: string; // Tailwind color token or hex
    chapters: Array<{
      title: string;
      keyPoints: string[];
    }>;
  }>;
}
