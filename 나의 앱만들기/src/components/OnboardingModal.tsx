'use client';

import React, { useState } from 'react';
import { useStudyScheduleStore } from '@/store/useStudyScheduleStore';
import { CURRICULUM_PRESETS } from '@/lib/curriculumPresets';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, generateSchedule, isLoading } = useStudyScheduleStore();

  const today = new Date();
  const defaultStartStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const defaultExam = new Date(today);
  defaultExam.setDate(today.getDate() + 35); // 5주 뒤 기본
  const defaultExamStr = `${defaultExam.getFullYear()}-${String(defaultExam.getMonth() + 1).padStart(2, '0')}-${String(defaultExam.getDate()).padStart(2, '0')}`;

  const [selectedPresetId, setSelectedPresetId] = useState('eip');
  const [examTitle, setExamTitle] = useState('정보처리기사 (EIP)');
  const [startDate, setStartDate] = useState(defaultStartStr);
  const [examDate, setExamDate] = useState(defaultExamStr);
  const [dailyHours, setDailyHours] = useState(3.0);
  const [restDaysWeekly, setRestDaysWeekly] = useState<number[]>([0, 6]); // 일, 토
  const [curriculumText, setCurriculumText] = useState('');

  // 프리셋 변경 핸들러
  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = CURRICULUM_PRESETS.find(item => item.id === presetId);
    if (p) {
      setExamTitle(p.title);
      setDailyHours(p.defaultDailyHours);
      const text = p.subjects.map(s => 
        `[과목: ${s.name}]\n` + s.chapters.map(c => `- ${c.title}: ${c.keyPoints.join(', ')}`).join('\n')
      ).join('\n\n');
      setCurriculumText(text);
    }
  };

  // 요일 토글
  const toggleRestDay = (dayIndex: number) => {
    if (restDaysWeekly.includes(dayIndex)) {
      setRestDaysWeekly(restDaysWeekly.filter(d => d !== dayIndex));
    } else {
      setRestDaysWeekly([...restDaysWeekly, dayIndex].sort());
    }
  };

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateSchedule({
      examTitle,
      startDate,
      examDate,
      dailyHours,
      restDaysWeekly,
      customRestDates: [],
      curriculumText,
    }, selectedPresetId);
  };

  if (!isOnboardingOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8">
        
        {/* 닫기 버튼 */}
        <button
          onClick={() => setIsOnboardingOpen(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg p-1"
        >
          ✕
        </button>

        {/* 타이틀 */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              ✨
            </span>
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
              AI 자격증 시험 스케줄 생성
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
            남은 수험 기간을 50% 개념정독, 30% 핵심회독, 20% 기출스프린트로 완벽 역산 배치합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 프리셋 선택 버튼 그룹 */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              자격증 프리셋 선택:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CURRICULUM_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPresetId === p.id
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  <p className="font-bold text-xs truncate">{p.title.split(' ')[0]}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 시험 명칭 */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              목표 자격증 명칭:
            </label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 날짜 설정 (시작일 / 시험일) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                학습 시작일:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                시험 목표일 (D-Day):
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* 일일 공부시간 슬라이더 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                하루 가능 공부 시간:
              </label>
              <span className="text-xs font-mono font-extrabold text-blue-600 dark:text-blue-400">
                {dailyHours}시간 ({Math.round(dailyHours * 60)}분)
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* 주간 정기 휴식일 선택 */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              정기 휴식 요일 (선택된 요일은 캘린더에 빗금 휴식일 처리):
            </label>
            <div className="flex gap-1.5">
              {dayNames.map((name, idx) => {
                const isSelected = restDaysWeekly.includes(idx);
                return (
                  <button
                    type="button"
                    key={name}
                    onClick={() => toggleRestDay(idx)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                      isSelected
                        ? 'bg-zinc-800 dark:bg-zinc-700 text-white border-zinc-900 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 커리큘럼 텍스트 */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              목차 및 과목 원문 (직접 수정 가능):
            </label>
            <textarea
              rows={3}
              value={curriculumText}
              onChange={(e) => setCurriculumText(e.target.value)}
              placeholder="예: 1과목 소프트웨어 설계... 2과목 소프트웨어 개발..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 제출 버튼 */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-mono font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>AI 역산 스케줄 편성 중...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>스마트 3단계 스케줄 생성 완료</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
