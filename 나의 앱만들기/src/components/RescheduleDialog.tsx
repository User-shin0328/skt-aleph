'use client';

import React, { useState } from 'react';
import { useStudyScheduleStore } from '@/store/useStudyScheduleStore';
import { RescheduleMode } from '@/lib/types';

export const RescheduleDialog: React.FC = () => {
  const { 
    isRescheduleOpen, 
    setIsRescheduleOpen, 
    getOverdueTasks, 
    rescheduleTasks, 
    isLoading 
  } = useStudyScheduleStore();

  const [mode, setMode] = useState<RescheduleMode>('USE_REST_DAY');

  const overdue = getOverdueTasks();

  const handleApply = async () => {
    await rescheduleTasks(mode);
  };

  if (!isRescheduleOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        
        {/* 닫기 버튼 */}
        <button
          onClick={() => setIsRescheduleOpen(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg p-1"
        >
          ✕
        </button>

        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            ⚡
          </span>
          <div>
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
              지연된 공부 스마트 재배치
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              미완료 과제 {overdue.length}개를 분석하여 시험 일정에 지장 없도록 최적 재편성합니다.
            </p>
          </div>
        </div>

        {/* 미완료 과제 요약 목록 */}
        <div className="mb-5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-h-36 overflow-y-auto space-y-1.5 text-xs font-mono">
          <span className="text-zinc-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
            재배치 대상 미완료 목록 ({overdue.length}건):
          </span>
          {overdue.length === 0 ? (
            <p className="text-zinc-400 italic">지연된 과제가 없습니다.</p>
          ) : (
            overdue.map(t => (
              <div key={t.id} className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                <span className="truncate max-w-[280px]">[{t.taskDate}] {t.subject} - {t.chapter}</span>
                <span className="text-[10px] text-amber-500 font-bold">미완료</span>
              </div>
            ))
          )}
        </div>

        {/* 2가지 재배치 알고리즘 라디오 선택 */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 block">
            재배치 방식 선택:
          </label>

          {/* 옵션 1: 휴식일 활용 (USE_REST_DAY) */}
          <div
            onClick={() => setMode('USE_REST_DAY')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              mode === 'USE_REST_DAY'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
            }`}
          >
            <input
              type="radio"
              name="rescheduleMode"
              checked={mode === 'USE_REST_DAY'}
              onChange={() => setMode('USE_REST_DAY')}
              className="mt-1 accent-blue-600"
            />
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>☕ 다가오는 휴식일을 '보충 학습일'로 전환 (권장)</span>
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-mono mt-0.5">
                가장 가까운 주말/휴식일을 특별 보충 학습일로 지정하여 밀린 핵심 분량을 한 번에 몰입해 완벽 소화합니다.
              </p>
            </div>
          </div>

          {/* 옵션 2: 잔여일 균등 분할 배분 (DISTRIBUTE) */}
          <div
            onClick={() => setMode('DISTRIBUTE')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              mode === 'DISTRIBUTE'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
            }`}
          >
            <input
              type="radio"
              name="rescheduleMode"
              checked={mode === 'DISTRIBUTE'}
              onChange={() => setMode('DISTRIBUTE')}
              className="mt-1 accent-blue-600"
            />
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>🏃 잔여 학습일들에 균등 분할 배분 (일일 +25분)</span>
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-mono mt-0.5">
                휴식일을 유지하면서 남은 정상 학습일에 미완료 키포인트를 골고루 나누어 일일 공부시간을 조금씩 늘립니다.
              </p>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsRescheduleOpen(false)}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-600 dark:text-zinc-300 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isLoading || overdue.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-mono font-bold shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <span>재배치 적용 중...</span>
            ) : (
              <>
                <span>⚡</span>
                <span>스케줄 재조정 적용</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
