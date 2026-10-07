'use client';

import React, { useState } from 'react';
import { useStudyScheduleStore } from '@/store/useStudyScheduleStore';
import { getSubjectColor } from '@/lib/curriculumPresets';
import { StudyTask } from '@/lib/types';

export const DayTaskPanel: React.FC = () => {
  const { 
    selectedDate, 
    tasks, 
    toggleTaskComplete, 
    incrementReviewCount, 
    currentPlan, 
    getOverdueTasks,
    setIsRescheduleOpen 
  } = useStudyScheduleStore();

  // 아코디언 열림 상태 (태스크 ID 기준)
  const [openAccordionIds, setOpenAccordionIds] = useState<Record<string, boolean>>({});

  const toggleAccordion = (id: string) => {
    setOpenAccordionIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 선택된 날짜의 태스크 필터링
  const dayTasks = tasks.filter(t => t.taskDate === selectedDate);
  const studyTasks = dayTasks.filter(t => !t.isRestDay);
  const isRestDay = dayTasks.some(t => t.isRestDay);

  // 당일 진도율 계산
  const completedCount = studyTasks.filter(t => t.isCompleted).length;
  const progressPercent = studyTasks.length > 0 
    ? Math.round((completedCount / studyTasks.length) * 100) 
    : (isRestDay ? 100 : 0);

  // D-Day 계산
  let dDayText = '';
  if (currentPlan?.examDate) {
    const curr = new Date(selectedDate);
    const exam = new Date(currentPlan.examDate);
    curr.setHours(0,0,0,0);
    exam.setHours(0,0,0,0);
    const diff = Math.ceil((exam.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
    dDayText = diff > 0 ? `시험까지 D-${diff}` : (diff === 0 ? 'D-Day 시험일' : `시험 완료 D+${Math.abs(diff)}`);
  }

  // 지연 태스크 여부 확인
  const overdueTasks = getOverdueTasks();
  const hasOverdue = overdueTasks.length > 0;

  // 요일 포맷팅
  const dayOfWeekStr = (() => {
    const d = new Date(selectedDate);
    const names = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return names[d.getDay()] || '';
  })();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 flex flex-col h-full sticky top-20">
      
      {/* 1. 상단 미완료 일정 감지 알림 배너 */}
      {hasOverdue && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <div className="text-xs">
              <p className="font-bold text-amber-800 dark:text-amber-200">
                완료하지 못한 {overdueTasks.length}개의 공부가 밀려있습니다!
              </p>
              <p className="text-amber-600 dark:text-amber-400 font-mono text-[11px]">
                휴식일 또는 남은 일정에 지연 분량을 자동 재배치하세요.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRescheduleOpen(true)}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-mono text-xs font-bold transition-all shadow-sm"
          >
            스마트 재조정 ➔
          </button>
        </div>
      )}

      {/* 2. 헤더: 선택 날짜, D-Day, 진도율 */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white">
                {selectedDate}
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {dayOfWeekStr}
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold mt-1">
              🎯 {dDayText}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
              {progressPercent}%
            </span>
            <span className="block text-[11px] font-mono text-zinc-400">
              {completedCount} / {studyTasks.length} 완료
            </span>
          </div>
        </div>

        {/* 진도율 프로그레스 바 */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-3">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. 태스크 카드 리스트 영역 */}
      <div className="flex-grow overflow-y-auto space-y-3 pr-1">
        {isRestDay ? (
          /* 휴식일 안내 카드 */
          <div className="p-6 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/40 text-center space-y-3">
            <span className="text-4xl block">☕</span>
            <h4 className="font-extrabold text-base text-zinc-800 dark:text-zinc-200">
              오늘은 정기 휴식일입니다
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-mono">
              수험 기간 동안 뇌가 기억을 장기기억으로 고착화하기 위해 충분한 휴식이 필수적입니다. 가벼운 스트레칭과 숙면을 취하세요.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                컨디션 회복 충전 중 🔋
              </span>
            </div>
          </div>
        ) : studyTasks.length === 0 ? (
          /* 일정이 없는 날 */
          <div className="p-8 text-center text-zinc-400 font-mono text-xs">
            해당 일자에 등록된 학습 일정이 없습니다.
          </div>
        ) : (
          studyTasks.map((task) => {
            const subjectColor = getSubjectColor(task.subject);
            const isAccordionOpen = !!openAccordionIds[task.id];

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  task.isCompleted
                    ? 'bg-zinc-50/60 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 opacity-80'
                    : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 shadow-sm hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                {/* 상단: 체크박스, 과목 뱃지, 단계 뱃지 */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-grow">
                    
                    {/* 커스텀 체크박스 (낙관적 토글) */}
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        task.isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                          : 'border-zinc-300 dark:border-zinc-600 hover:border-emerald-500 bg-white dark:bg-zinc-900'
                      }`}
                      aria-label="과제 완료 토글"
                    >
                      {task.isCompleted && <span className="text-xs font-bold">✓</span>}
                    </button>

                    <div className="flex-grow">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="text-[11px] font-mono px-2 py-0.5 rounded-full font-bold text-white shadow-xs"
                          style={{ backgroundColor: subjectColor }}
                        >
                          {task.subject}
                        </span>
                        
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          task.phase === 1
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : task.phase === 2
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}>
                          {task.phase === 1 ? '1단계 개념정독' : task.phase === 2 ? '2단계 핵심회독' : '3단계 기출스프린트'}
                        </span>

                        {/* 난이도 뱃지 */}
                        {task.difficulty && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                            task.difficulty === '상'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : task.difficulty === '중'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          }`}>
                            난이도 {task.difficulty} {task.difficulty === '상' ? '🔥' : task.difficulty === '중' ? '⚡' : '🌱'}
                          </span>
                        )}

                        {/* 빈출도 뱃지 */}
                        {task.frequency && (
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            title={`빈출도: ${task.frequency}성 / 5성`}
                          >
                            빈출 {'★'.repeat(task.frequency)}
                          </span>
                        )}

                        <span className="text-[11px] font-mono text-zinc-400">
                          ⏱️ {task.estimatedMinutes}분
                        </span>

                        {task.weightScore && (
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400" title="난이도×빈출도 가중치 점수">
                            가중치 {task.weightScore}pt
                          </span>
                        )}
                      </div>

                      <h4 className={`text-sm font-bold text-zinc-900 dark:text-white transition-all ${
                        task.isCompleted ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                      }`}>
                        {task.chapter}
                      </h4>
                    </div>
                  </div>

                  {/* 회독수 뱃지 및 +1회독 버튼 */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-700">
                      {task.reviewCount}회독
                    </span>
                    <button
                      onClick={() => incrementReviewCount(task.id)}
                      className="px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 text-[10px] font-mono font-bold border border-blue-200 dark:border-blue-800 transition-colors"
                      title="계획 외 복습 시 회독수 1회 추가"
                    >
                      +1회독
                    </button>
                  </div>
                </div>

                {/* 학습 포인트 아코디언 토글 */}
                {task.learningPoints && task.learningPoints.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => toggleAccordion(task.id)}
                      className="w-full flex items-center justify-between text-xs font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 py-1 transition-colors"
                    >
                      <span className="font-semibold flex items-center gap-1">
                        <span>💡 핵심 암기 포인트</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {task.learningPoints.length}
                        </span>
                      </span>
                      <span>{isAccordionOpen ? '▲ 접기' : '▼ 펼치기'}</span>
                    </button>

                    {isAccordionOpen && (
                      <ul className="mt-2 space-y-1.5 pl-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 border-l-2 border-blue-400 dark:border-blue-600 animate-fade-in">
                        {task.learningPoints.map((point, pIdx) => (
                          <li key={pIdx} className="leading-relaxed flex items-start gap-1.5">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* 하단 Supabase RLS 연동 안내 */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Supabase RLS & LocalStorage 동기화</span>
        </span>
        <span>CertiFlow v1.0</span>
      </div>

    </div>
  );
};
