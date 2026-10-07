import { StudyPlan, StudyTask } from './types';
import { generateRuleBasedTasks } from './scheduleEngine';

/**
 * 오늘을 기준으로 4주(28일) 뒤 시험을 목표로 하는 실감나는 모의 데이터 생성
 */
export function getInitialMockData(): { mockPlan: StudyPlan; mockTasks: StudyTask[] } {
  const today = new Date();
  
  // 시작일: 약 7일 전 (어제/과거 미완료 과제를 시연하기 위함)
  const start = new Date(today);
  start.setDate(today.getDate() - 7);
  
  // 시험일: 오늘로부터 21일 뒤 (총 4주 플랜)
  const exam = new Date(today);
  exam.setDate(today.getDate() + 21);

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const startDateStr = formatDate(start);
  const examDateStr = formatDate(exam);
  const todayStr = formatDate(today);

  const mockPlan: StudyPlan = {
    id: 'mock-plan-eip-2026',
    userId: 'demo-user-id',
    title: '정보처리기사 필기 한달 단기완성 (EIP Master)',
    startDate: startDateStr,
    examDate: examDateStr,
    dailyStudyHours: 3.0,
    restDaysWeekly: [0, 6], // 일, 토 정기 휴식
    customRestDates: [],
    curriculumSource: '정보처리기사 5대 과목 국가직무능력표준(NCS) 기반 정밀 커리큘럼',
    createdAt: new Date().toISOString()
  };

  const tasks = generateRuleBasedTasks({
    planId: mockPlan.id,
    startDate: startDateStr,
    examDate: examDateStr,
    dailyHours: 3.0,
    restDaysWeekly: [0, 6],
    customRestDates: [],
    presetId: 'eip'
  });

  // 현실감 있는 인터랙션을 위해 과거 날짜 태스크의 일부를 완료 처리,
  // 어제 날짜에 미완료 과제 1개를 두어 지연 알림 배너를 즉시 시연할 수 있게 설정
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  tasks.forEach(t => {
    if (t.isRestDay) {
      t.isCompleted = true;
      return;
    }

    if (t.taskDate < yesterdayStr) {
      // 그저께 이전은 모두 완료 처리
      t.isCompleted = true;
      t.completedAt = `${t.taskDate}T21:30:00Z`;
    } else if (t.taskDate === yesterdayStr) {
      // 어제 과제는 미완료 상태 유지 -> 대시보드 지연 감지 트리거!
      t.isCompleted = false;
      t.completedAt = null;
    } else if (t.taskDate === todayStr) {
      // 오늘은 진행 중
      t.isCompleted = false;
      t.completedAt = null;
    } else {
      // 미래 과제
      t.isCompleted = false;
      t.completedAt = null;
    }
  });

  return { mockPlan, mockTasks: tasks };
}
