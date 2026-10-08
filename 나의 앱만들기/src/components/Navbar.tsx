'use client';

import React, { useState } from 'react';
import { useStudyScheduleStore } from '@/store/useStudyScheduleStore';

export const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    currentPlan, 
    setIsOnboardingOpen, 
    setIsRescheduleOpen, 
    getOverdueTasks,
    resetToMockData,
    searchAndCreateSchedule,
    saveCurrentSchedule
  } = useStudyScheduleStore();

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    searchAndCreateSchedule(searchQuery.trim());
    setSearchQuery('');
  };

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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar whitespace-nowrap">
        
        {/* 좌측: 현재 자격증명 & D-Day 뱃지 (단 한 줄 심플 구성) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-lg">🎯</span>
          <h1 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white tracking-tight whitespace-nowrap">
            {currentPlan?.title || '자격증 스케줄'}
          </h1>
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border flex items-center gap-1 shadow-xs shrink-0 ${
            isDDayUrgent 
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse'
              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            <span>{dDayText}</span>
          </div>
          <span className="hidden xl:inline text-[11px] text-zinc-400 font-mono">
            {currentPlan?.startDate} ~ {currentPlan?.examDate}
          </span>
        </div>

        {/* 우측: 액션 버튼 및 자격증 검색 (글자 겹침 방지 한 줄 정렬) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 자격증 검색 인풋 */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="자격증 검색..."
              className="w-28 sm:w-40 px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="ml-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold shrink-0"
            >
              검색
            </button>
          </div>

          {overdueCount > 0 && (
            <button
              onClick={() => setIsRescheduleOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold font-mono transition-all flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap"
              title="지연된 일정 재조정"
            >
              <span>⚡</span>
              <span>재배치</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-700 text-[10px]">{overdueCount}</span>
            </button>
          )}

          <button
            onClick={saveCurrentSchedule}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-tight transition-all shadow-xs flex items-center gap-1 shrink-0 whitespace-nowrap"
            title="현재 스케줄을 브라우저에 안전하게 보관"
          >
            <span>💾</span>
            <span>저장</span>
          </button>

          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold tracking-tight transition-all shadow-xs flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <span>✨</span>
            <span>새 스케줄</span>
          </button>

          <button
            onClick={resetToMockData}
            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors text-xs shrink-0"
            title="4주 모의 데이터로 초기화"
          >
            🔄
          </button>
        </div>

      </div>
    </header>
  );
};
