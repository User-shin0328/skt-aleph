import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StudyPlan, StudyTask, RescheduleMode, GenerateScheduleRequest } from '../lib/types';
import { getInitialMockData } from '../lib/mockData';
import { rescheduleUncompletedTasks, generateRuleBasedTasks } from '../lib/scheduleEngine';

interface StudyScheduleState {
  currentPlan: StudyPlan | null;
  tasks: StudyTask[];
  selectedDate: string; // YYYY-MM-DD
  isOnboardingOpen: boolean;
  isRescheduleOpen: boolean;
  isLoading: boolean;
  feedbackMessage: string | null;

  // Actions
  setSelectedDate: (date: string) => void;
  setIsOnboardingOpen: (open: boolean) => void;
  setIsRescheduleOpen: (open: boolean) => void;
  setFeedbackMessage: (msg: string | null) => void;
  
  toggleTaskComplete: (taskId: string) => void;
  incrementReviewCount: (taskId: string) => void;
  getOverdueTasks: () => StudyTask[];

  generateSchedule: (payload: GenerateScheduleRequest, presetId?: string) => Promise<void>;
  rescheduleTasks: (mode: RescheduleMode) => Promise<void>;
  resetToMockData: () => void;
}

export const useStudyScheduleStore = create<StudyScheduleState>()(
  persist(
    (set, get) => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const { mockPlan, mockTasks } = getInitialMockData();

      return {
        currentPlan: mockPlan,
        tasks: mockTasks,
        selectedDate: todayStr,
        isOnboardingOpen: false,
        isRescheduleOpen: false,
        isLoading: false,
        feedbackMessage: null,

        setSelectedDate: (date: string) => set({ selectedDate: date }),
        setIsOnboardingOpen: (open: boolean) => set({ isOnboardingOpen: open }),
        setIsRescheduleOpen: (open: boolean) => set({ isRescheduleOpen: open }),
        setFeedbackMessage: (msg: string | null) => set({ feedbackMessage: msg }),

        // 낙관적 업데이트 (Optimistic Update)
        toggleTaskComplete: (taskId: string) => {
          const nowIso = new Date().toISOString();
          set(state => {
            const updated = state.tasks.map(t => {
              if (t.id === taskId) {
                const nextState = !t.isCompleted;
                return {
                  ...t,
                  isCompleted: nextState,
                  completedAt: nextState ? nowIso : null
                };
              }
              return t;
            });
            return { tasks: updated };
          });
        },

        // 회독 추가 (+1)
        incrementReviewCount: (taskId: string) => {
          set(state => ({
            tasks: state.tasks.map(t => 
              t.id === taskId ? { ...t, reviewCount: t.reviewCount + 1 } : t
            )
          }));
        },

        // 미완료 지연 태스크 감지 (오늘 이전 날짜의 미완료 학습)
        getOverdueTasks: () => {
          const { tasks, selectedDate } = get();
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          
          return tasks.filter(t => 
            t.taskDate < todayStr && !t.isRestDay && !t.isCompleted
          );
        },

        // AI 스케줄 생성
        generateSchedule: async (payload: GenerateScheduleRequest, presetId?: string) => {
          set({ isLoading: true, feedbackMessage: 'AI가 수험생 맞춤 3단계 역산 스케줄을 분석 중입니다...' });

          try {
            // API Route 호출 시도
            const res = await fetch('/api/generate-schedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              const data = await res.json();
              const newPlan: StudyPlan = {
                id: `plan-${Date.now()}`,
                userId: 'user-current',
                title: payload.examTitle,
                startDate: payload.startDate,
                examDate: payload.examDate,
                dailyStudyHours: payload.dailyHours,
                restDaysWeekly: payload.restDaysWeekly,
                customRestDates: payload.customRestDates,
                curriculumSource: payload.curriculumText,
                createdAt: new Date().toISOString()
              };

              const newTasks: StudyTask[] = data.tasks.map((t: any, idx: number) => ({
                id: `task-${Date.now()}-${idx}`,
                planId: newPlan.id,
                taskDate: t.date,
                phase: t.phase,
                subject: t.subject,
                chapter: t.chapter,
                learningPoints: t.learningPoints || [],
                estimatedMinutes: t.estimatedMinutes || Math.round(payload.dailyHours * 60),
                reviewCount: t.reviewCount || 1,
                isCompleted: false,
                isRestDay: t.isRestDay || false,
                completedAt: null
              }));

              set({
                currentPlan: newPlan,
                tasks: newTasks,
                selectedDate: payload.startDate,
                isOnboardingOpen: false,
                isLoading: false,
                feedbackMessage: '🎉 AI 수험생 맞춤 커리큘럼이 성공적으로 생성되었습니다!'
              });
              return;
            }
          } catch (e) {
            console.warn('API 호출 실패 혹은 오프라인 환경 - 로컬 고성능 규칙 엔진으로 생성합니다.');
          }

          // Fallback: 로컬 고성능 3단계 역산 스케줄링 엔진
          const newPlanId = `plan-rule-${Date.now()}`;
          const newPlan: StudyPlan = {
            id: newPlanId,
            userId: 'user-current',
            title: payload.examTitle,
            startDate: payload.startDate,
            examDate: payload.examDate,
            dailyStudyHours: payload.dailyHours,
            restDaysWeekly: payload.restDaysWeekly,
            customRestDates: payload.customRestDates,
            curriculumSource: payload.curriculumText,
            createdAt: new Date().toISOString()
          };

          const newTasks = generateRuleBasedTasks({
            planId: newPlanId,
            startDate: payload.startDate,
            examDate: payload.examDate,
            dailyHours: payload.dailyHours,
            restDaysWeekly: payload.restDaysWeekly,
            customRestDates: payload.customRestDates,
            curriculumText: payload.curriculumText,
            presetId: presetId || 'eip'
          });

          set({
            currentPlan: newPlan,
            tasks: newTasks,
            selectedDate: payload.startDate,
            isOnboardingOpen: false,
            isLoading: false,
            feedbackMessage: '🎉 3단계 역산 배치 알고리즘으로 스케줄이 완벽히 편성되었습니다!'
          });
        },

        // 지연 일정 스마트 재배치
        rescheduleTasks: async (mode: RescheduleMode) => {
          const { currentPlan, tasks, getOverdueTasks } = get();
          const overdue = getOverdueTasks();
          if (overdue.length === 0 || !currentPlan) return;

          set({ isLoading: true });

          try {
            const res = await fetch('/api/reschedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                planId: currentPlan.id,
                uncompletedTaskIds: overdue.map(o => o.id),
                rescheduleMode: mode
              })
            });

            if (res.ok) {
              const data = await res.json();
              if (data.updatedTasks) {
                set({
                  tasks: data.updatedTasks,
                  isRescheduleOpen: false,
                  isLoading: false,
                  feedbackMessage: data.message
                });
                return;
              }
            }
          } catch (e) {
            console.warn('API 호출 실패 - 로컬 재배치 엔진으로 즉시 실행합니다.');
          }

          // Fallback 로컬 재배치 실행
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          const result = rescheduleUncompletedTasks(
            tasks,
            overdue.map(o => o.id),
            mode,
            todayStr
          );

          set({
            tasks: result.updatedTasks,
            isRescheduleOpen: false,
            isLoading: false,
            feedbackMessage: result.summaryMessage
          });
        },

        // 모의 데이터 리셋
        resetToMockData: () => {
          const { mockPlan, mockTasks } = getInitialMockData();
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          set({
            currentPlan: mockPlan,
            tasks: mockTasks,
            selectedDate: todayStr,
            feedbackMessage: '정보처리기사 4주 분량의 실감형 모의 데이터로 초기화되었습니다.'
          });
        }
      };
    },
    {
      name: 'certiflow-schedule-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
