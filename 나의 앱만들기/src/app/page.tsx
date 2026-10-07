'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { StudyCalendar } from '@/components/StudyCalendar';
import { DayTaskPanel } from '@/components/DayTaskPanel';
import { OnboardingModal } from '@/components/OnboardingModal';
import { RescheduleDialog } from '@/components/RescheduleDialog';
import { useStudyScheduleStore } from '@/store/useStudyScheduleStore';

export default function DashboardPage() {
  const { feedbackMessage, setFeedbackMessage } = useStudyScheduleStore();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
      {/* 상단 네비게이션 헤더 */}
      <Navbar />

      {/* 실시간 알림 토스트 (스케줄 생성 및 재조정 완료 알림) */}
      {feedbackMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full animate-fade-in">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🔔</span>
              <span>{feedbackMessage}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 메인 2-패널 대시보드 레이아웃 (Desktop Grid 7:5 Split) */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* 좌측: 대형 인터랙티브 캘린더 (7 컬럼) */}
          <section className="lg:col-span-7 h-full">
            <StudyCalendar />
          </section>

          {/* 우측: 선택된 날짜의 상세 학습 패널 (5 컬럼, Sticky) */}
          <section className="lg:col-span-5 h-full">
            <DayTaskPanel />
          </section>

        </div>
      </main>

      {/* 하단 푸터 */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-4 text-center text-xs font-mono text-zinc-500 bg-white/50 dark:bg-zinc-950/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 CertiFlow. 수험생 맞춤형 자격증 시험 스케줄링 SaaS</p>
          <div className="flex items-center gap-3">
            <span>CertiFlow AI Scheduler</span>
          </div>
        </div>
      </footer>

      {/* 팝업 모달들 */}
      <OnboardingModal />
      <RescheduleDialog />

    </div>
  );
}
