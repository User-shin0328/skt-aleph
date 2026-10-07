'use client';

import React from 'react';
import { useStudyScheduleStore } from '@/store/useStudyScheduleStore';

export const Navbar: React.FC = () => {
  const { 
    currentPlan, 
    setIsOnboardingOpen, 
    setIsRescheduleOpen, 
    getOverdueTasks,
    resetToMockData 
  } = useStudyScheduleStore();

  const overdueCount = getOverdueTasks().length;

  // D-Day 계산
  let dDayText = 'D-Day 설정 필요';
  let isDDayUrgent = false;
  if (currentPlan?.examDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(currentPlan.examDate);
    exam.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      dDayText = `D-${diffDays}`;
      isDDayUrgent = diffDays <= 14;
    } else if (diffDays === 0) {
      dDayText = 'D-DAY (시험 당일!)';
      isDDayUrgent = true;
    } else {
      dDayText = `D+${Math.abs(diffDays)} (시험 종료)`;
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* 로고 & 타이틀 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold text-lg tracking-wider">
            CF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight">CertiFlow</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-semibold border border-blue-200 dark:border-blue-800">
                AI SaaS
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[200px] sm:max-w-sm">
              {currentPlan?.title || '수험생 맞춤형 3단계 역산 스케줄러'}
            </p>
          </div>
        </div>

        {/* 중앙 D-Day 뱃지 */}
        <div className="hidden md:flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-bold font-mono border flex items-center gap-1.5 shadow-sm ${
            isDDayUrgent 
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse'
              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>{currentPlan?.title.split(' ')[0] || '자격증'} {dDayText}</span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {currentPlan?.startDate} ~ {currentPlan?.examDate}
          </span>
        </div>

        {/* 우측 액션 버튼 그룹 */}
        <div className="flex items-center gap-2">
          {overdueCount > 0 && (
            <button
              onClick={() => setIsRescheduleOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-sm shadow-amber-500/20"
              title="지연된 일정 재조정"
            >
              <span>⚡</span>
              <span className="hidden sm:inline">지연 재배치</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-700 text-[10px]">{overdueCount}</span>
            </button>
          )}

          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold tracking-tight transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5"
          >
            <span>✨</span>
            <span>새 스케줄 생성</span>
          </button>

          <button
            onClick={resetToMockData}
            className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors text-xs"
            title="4주 모의 데이터로 초기화"
          >
            🔄
          </button>
        </div>

      </div>
    </header>
  );
};
