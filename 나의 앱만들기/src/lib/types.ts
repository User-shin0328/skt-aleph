// ==============================================================================
// CertiFlow Core Type Definitions
// ==============================================================================

export type PhaseType = 1 | 2 | 3; // 1: 개념정독, 2: 핵심회독, 3: 기출스프린트

export type DifficultyLevel = '상' | '중' | '하';
export type FrequencyStars = 1 | 2 | 3 | 4 | 5;

export interface Profile {
  id: string; // auth.users.id
  email: string;
  createdAt: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  targetCertId?: string; // 'eip' | 'sec' | 'elec'
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
  difficulty: DifficultyLevel; // 난이도
  frequency: FrequencyStars;   // 빈출도 (1~5)
  weightScore?: number;        // 난이도 x 빈출도 가중치 점수
  learningPoints: string[];
  estimatedMinutes: number;
  reviewCount: number;
  isCompleted: boolean;
  isRestDay: boolean;
  completedAt?: string | null;
}

export interface GenerateScheduleRequest {
  examTitle: string;
  targetCertId?: string;
  startDate: string;
  examDate: string;
  dailyHours: number;
  restDaysWeekly: number[];
  customRestDates: string[];
  curriculumText?: string;
}

export interface GenerateScheduleResponse {
  plan: Omit<StudyPlan, 'id' | 'userId' | 'createdAt'>;
  tasks: Array<{
    date: string;
    phase: PhaseType;
    subject: string;
    chapter: string;
    difficulty: DifficultyLevel;
    frequency: FrequencyStars;
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

export interface CurriculumChapter {
  title: string;
  difficulty: DifficultyLevel;
  frequency: FrequencyStars;
  keyPoints: string[];
}

export interface CurriculumPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  passCriteria: string; // 합격 기준 (예: 100점 만점 과목당 40점 이상, 전과목 평균 60점)
  defaultDailyHours: number;
  subjects: Array<{
    name: string;
    color: string; // Tailwind color token or hex
    chapters: CurriculumChapter[];
  }>;
}
