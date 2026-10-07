'use client';

import React, { useState } from 'react';
import { useStudyScheduleStore } from '@/store/useStudyScheduleStore';
import { getSubjectColor } from '@/lib/curriculumPresets';
import { StudyTask } from '@/lib/types';

export const StudyCalendar: React.FC = () => {
  const { tasks, selectedDate, setSelectedDate, currentPlan } = useStudyScheduleStore();

  // 캘린더 기준 월 상태 (초기값: 현재 선택된 날짜의 연/월)
  const [currentYear, setCurrentYear] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return d.getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return d.getMonth(); // 0 ~ 11
  });

  // 월 이동 핸들러
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(y => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(y => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleTodayMonth = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDate(todayStr);
  };

  // 해당 월의 날짜 그리드 계산
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0(일) ~ 6(토)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // 날짜별 태스크 맵핑
  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, StudyTask[]>();
    tasks.forEach(t => {
      const arr = map.get(t.taskDate) || [];
      arr.push(t);
      map.set(t.taskDate, arr);
    });
    return map;
  }, [tasks]);

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const weekNames = ['일', '월', '화', '수', '목', '금', '토'];

  // 그리드 셀 생성
  const gridCells = [];

  // 이전 달 여백 날짜
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYearVal = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYearVal}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    gridCells.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
    });
  }

  // 이번 달 날짜
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    gridCells.push({
      dateStr,
      dayNum,
      isCurrentMonth: true,
    });
  }

  // 다음 달 여백 날짜 채우기 (총 35 또는 42칸 맞추기)
  const remainingCells = (7 - (gridCells.length % 7)) % 7;
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYearVal = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextYearVal}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    gridCells.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
    });
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* 캘린더 헤더 컨트롤러 */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-extrabold font-mono text-zinc-900 dark:text-white">
            {currentYear}년 {currentMonth + 1}월
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono font-medium">
            3단계 역산 로드맵
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTodayMonth}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            오늘
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors text-sm"
            aria-label="이전 달"
          >
            ◀
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors text-sm"
            aria-label="다음 달"
          >
            ▶
          </button>
        </div>
      </div>

      {/* 단계별 범례 (Legend) */}
      <div className="px-4 py-2 bg-zinc-50/70 dark:bg-zinc-950/40 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500 overflow-x-auto gap-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>1단계: 기본개념(1회독)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>2단계: 핵심압축(2회독)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>3단계: 기출파이널(3회독)</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-zinc-200 dark:bg-zinc-800 diagonal-stripes"></span>
            <span>휴식일</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>완료</span>
          </span>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800 text-center text-xs font-bold font-mono py-2 bg-zinc-50 dark:bg-zinc-900/50">
        {weekNames.map((w, idx) => (
          <div key={w} className={idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-zinc-500'}>
            {w}
          </div>
        ))}
      </div>

      {/* 월간 날짜 그리드 */}
      <div className="grid grid-cols-7 auto-rows-fr flex-grow divide-x divide-y divide-zinc-100 dark:divide-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800">
        {gridCells.map((cell) => {
          const dayTasks = tasksByDate.get(cell.dateStr) || [];
          const isSelected = selectedDate === cell.dateStr;
          const isToday = todayStr === cell.dateStr;

          const hasRest = dayTasks.some(t => t.isRestDay);
          const studyTasks = dayTasks.filter(t => !t.isRestDay);
          const isAllCompleted = studyTasks.length > 0 && studyTasks.every(t => t.isCompleted);
          const hasUncompleted = studyTasks.some(t => !t.isCompleted);
          const isOverdue = hasUncompleted && cell.dateStr < todayStr;

          // 시험일 여부
          const isExamDate = currentPlan?.examDate === cell.dateStr;

          return (
            <div
              key={cell.dateStr}
              onClick={() => setSelectedDate(cell.dateStr)}
              className={`min-h-[92px] sm:min-h-[110px] p-1.5 sm:p-2 cursor-pointer transition-all flex flex-col justify-between relative group ${
                !cell.isCurrentMonth ? 'bg-zinc-50/40 dark:bg-zinc-950/20 text-zinc-300 dark:text-zinc-700' : ''
              } ${
                hasRest ? 'diagonal-stripes bg-zinc-50/60 dark:bg-zinc-950/50' : ''
              } ${
                isSelected 
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/30 dark:bg-blue-950/20 z-10' 
                  : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40'
              } ${
                isAllCompleted ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
              }`}
            >
              {/* 셀 상단 날짜 및 상태 인디케이터 */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isSelected
                      ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold'
                      : cell.isCurrentMonth
                      ? 'text-zinc-700 dark:text-zinc-300'
                      : 'text-zinc-400 dark:text-zinc-600'
                  }`}
                >
                  {cell.dayNum}
                </span>

                <div className="flex items-center gap-1">
                  {isExamDate && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-extrabold bg-rose-600 text-white animate-pulse">
                      시험!
                    </span>
                  )}
                  {isAllCompleted && (
                    <span className="text-emerald-500 text-xs font-bold" title="당일 전 과제 완료">
                      ✓
                    </span>
                  )}
                  {isOverdue && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" title="미완료 지연 과제 존재" />
                  )}
                </div>
              </div>

              {/* 태스크 뱃지 렌더링 */}
              <div className="space-y-1 my-1 flex-grow overflow-hidden">
                {hasRest ? (
                  <div className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 py-1 text-center font-medium opacity-80">
                    ☕ 휴식일
                  </div>
                ) : (
                  studyTasks.slice(0, 2).map((t) => {
                    const subjectColor = getSubjectColor(t.subject);
                    return (
                      <div
                        key={t.id}
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded truncate border transition-all flex items-center justify-between ${
                          t.isCompleted 
                            ? 'line-through opacity-50 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700' 
                            : 'text-zinc-800 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-700/80 shadow-xs'
                        }`}
                        style={{
                          borderLeftWidth: '3px',
                          borderLeftColor: subjectColor,
                          backgroundColor: !t.isCompleted ? `${subjectColor}15` : undefined
                        }}
                        title={`${t.subject} - ${t.chapter}${t.difficulty ? ` (난이도: ${t.difficulty}, 빈출: ${t.frequency}성)` : ''}`}
                      >
                        <span className="truncate flex items-center gap-0.5">
                          {t.difficulty === '상' && <span className="text-[9px]" title="고난도 단원">🔥</span>}
                          <span>{t.subject}</span>
                        </span>
                        <span className="text-[9px] font-bold opacity-75 ml-1 shrink-0">
                          {t.phase === 1 ? '[1회]' : t.phase === 2 ? '[2회]' : '[기출]'}
                        </span>
                      </div>
                    );
                  })
                )}

                {studyTasks.length > 2 && (
                  <div className="text-[9px] font-mono text-zinc-400 text-right pr-1">
                    +{studyTasks.length - 2}개 더보기
                  </div>
                )}
              </div>

              {/* 하단 단계(Phase) 미니 바 */}
              {!hasRest && studyTasks.length > 0 && (
                <div className="flex items-center gap-1 pt-1 border-t border-zinc-100 dark:border-zinc-800/40">
                  <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                    studyTasks[0].phase === 1 
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300'
                      : studyTasks[0].phase === 2
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300'
                  }`}>
                    {studyTasks[0].phase === 1 ? 'Phase 1 개념' : studyTasks[0].phase === 2 ? 'Phase 2 회독' : 'Phase 3 기출'}
                  </span>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
