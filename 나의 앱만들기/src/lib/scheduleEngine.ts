import { StudyTask, PhaseType, RescheduleMode, CurriculumPreset } from './types';
import { CURRICULUM_PRESETS } from './curriculumPresets';

export interface DateStudyInfo {
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0: 일 ~ 6: 토
  isRest: boolean;
}

/**
 * 시작일부터 시험일까지의 전체 날짜 배열 및 휴식일 여부 판정
 */
export function getCalendarDays(
  startDateStr: string,
  examDateStr: string,
  restDaysWeekly: number[],
  customRestDates: string[]
): DateStudyInfo[] {
  const result: DateStudyInfo[] = [];
  const current = new Date(startDateStr);
  const end = new Date(examDateStr);

  const customRestSet = new Set(customRestDates);

  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = current.getDay();

    const isWeeklyRest = restDaysWeekly.includes(dayOfWeek);
    const isCustomRest = customRestSet.has(dateStr);
    const isRest = isWeeklyRest || isCustomRest;

    result.push({
      dateStr,
      dayOfWeek,
      isRest
    });

    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * 3단계 역산 배치 알고리즘 (핵심 비즈니스 로직)
 * 1단계 (50%): 전 과목 기본 개념 및 1회독
 * 2단계 (30%): 취약점 압축 및 빈출 요약 2회독
 * 3단계 (D-14 ~ 시험일, 약 20%): 실전 기출문제 풀이 및 파이널 오답노트
 */
export function generateRuleBasedTasks(params: {
  planId: string;
  startDate: string;
  examDate: string;
  dailyHours: number;
  restDaysWeekly: number[];
  customRestDates: string[];
  curriculumText?: string;
  presetId?: string;
}): StudyTask[] {
  const allDays = getCalendarDays(
    params.startDate,
    params.examDate,
    params.restDaysWeekly,
    params.customRestDates
  );

  const validStudyDays = allDays.filter(d => !d.isRest);
  const totalValidDays = validStudyDays.length;

  if (totalValidDays === 0) {
    throw new Error('유효한 학습 가능 일자가 없습니다. 휴식일 설정을 확인해주세요.');
  }

  // 1, 2, 3단계 일수 역산 분할
  // Phase 3: 약 20% (또는 최소 3일 ~ 최대 14일)
  const p3DaysCount = Math.max(3, Math.min(14, Math.round(totalValidDays * 0.2)));
  // 남은 일수 중 Phase 1: 5/8 (약 62.5% of remaining -> 전체의 50%), Phase 2: 3/8 (약 37.5% of remaining -> 전체의 30%)
  const remainingDays = totalValidDays - p3DaysCount;
  const p1DaysCount = Math.max(1, Math.round(remainingDays * (0.5 / 0.8)));
  const p2DaysCount = Math.max(1, remainingDays - p1DaysCount);

  // 사용할 과목/챕터 리스트 추출
  const preset = CURRICULUM_PRESETS.find(p => p.id === params.presetId) || CURRICULUM_PRESETS[0];
  const allChapters: Array<{ subject: string; title: string; keyPoints: string[] }> = [];

  preset.subjects.forEach(s => {
    s.chapters.forEach(c => {
      allChapters.push({
        subject: s.name,
        title: c.title,
        keyPoints: c.keyPoints
      });
    });
  });

  const estimatedMinutes = Math.round(params.dailyHours * 60);
  const tasks: StudyTask[] = [];

  let validDayIndex = 0;

  for (const day of allDays) {
    if (day.isRest) {
      // 휴식일 태스크 등록
      tasks.push({
        id: `task-rest-${day.dateStr}`,
        planId: params.planId,
        taskDate: day.dateStr,
        phase: 1,
        subject: '정기 휴식일',
        chapter: '재충전 및 컨디션 관리',
        learningPoints: ['뇌 휴식 및 수면 보충', '가벼운 스트레칭 및 산책', '한 주간의 학습 리듬 점검'],
        estimatedMinutes: 0,
        reviewCount: 0,
        isCompleted: true,
        isRestDay: true,
        completedAt: null
      });
    } else {
      let phase: PhaseType = 1;
      let reviewCount = 1;
      let chapterInfo: { subject: string; title: string; keyPoints: string[] };

      if (validDayIndex < p1DaysCount) {
        // [1단계: 50%] 전 과목 기본 개념 및 1회독
        phase = 1;
        reviewCount = 1;
        const chapIdx = validDayIndex % allChapters.length;
        chapterInfo = allChapters[chapIdx];
      } else if (validDayIndex < p1DaysCount + p2DaysCount) {
        // [2단계: 30%] 취약점 압축 및 빈출 요약 2회독
        phase = 2;
        reviewCount = 2;
        const p2Idx = (validDayIndex - p1DaysCount) % allChapters.length;
        const orig = allChapters[p2Idx];
        chapterInfo = {
          subject: orig.subject,
          title: `[핵심회독] ${orig.title}`,
          keyPoints: orig.keyPoints.map(kp => `🔥 빈출 압축: ${kp}`)
        };
      } else {
        // [3단계: 20%] 실전 기출문제 풀이 및 파이널 오답노트
        phase = 3;
        reviewCount = 3;
        const p3Idx = validDayIndex - (p1DaysCount + p2DaysCount);
        const year = 2026 - (p3Idx % 4);
        const round = ((p3Idx % 3) + 1);
        chapterInfo = {
          subject: '전 범위 실전모의',
          title: `${year}년 제${round}회 기출 실전 풀이 & 오답노트`,
          keyPoints: [
            '실전 타이머 150분 측정 풀이 (합격 기준 60점)',
            '틀린 문항 오답노트 작성 및 취약 과목 단권화',
            '신경향 출제 포인트 키워드 암기 체크'
          ]
        };
      }

      tasks.push({
        id: `task-${day.dateStr}-${validDayIndex}`,
        planId: params.planId,
        taskDate: day.dateStr,
        phase,
        subject: chapterInfo.subject,
        chapter: chapterInfo.title,
        learningPoints: chapterInfo.keyPoints,
        estimatedMinutes,
        reviewCount,
        isCompleted: false,
        isRestDay: false,
        completedAt: null
      });

      validDayIndex++;
    }
  }

  return tasks;
}

/**
 * 지연 일정 스마트 재배치 (Reschedule Algorithm)
 * 1. DISTRIBUTE: 남은 미래 학습일의 태스크에 미완료 분량을 균등 분할 배분
 * 2. USE_REST_DAY: 가장 가까운 다음 휴식일을 보충 학습일로 전환하고 미완료 태스크 이관
 */
export function rescheduleUncompletedTasks(
  allTasks: StudyTask[],
  uncompletedIds: string[],
  mode: RescheduleMode,
  currentDateStr: string
): { updatedTasks: StudyTask[]; summaryMessage: string } {
  const targetUncompleted = allTasks.filter(t => uncompletedIds.includes(t.id));
  if (targetUncompleted.length === 0) {
    return { updatedTasks: allTasks, summaryMessage: '재배치할 미완료 과제가 없습니다.' };
  }

  const updatedTasks = allTasks.map(t => ({ ...t }));

  if (mode === 'USE_REST_DAY') {
    // 오늘 이후 가장 가까운 휴식일 탐색
    const upcomingRestDay = updatedTasks.find(
      t => t.taskDate >= currentDateStr && t.isRestDay
    );

    if (upcomingRestDay) {
      // 휴식일을 보충 학습일로 전환
      upcomingRestDay.isRestDay = false;
      upcomingRestDay.isCompleted = false;
      upcomingRestDay.phase = 2;
      upcomingRestDay.subject = '⚡ 특별 보충 학습일';
      upcomingRestDay.chapter = `[지연 만회] ${targetUncompleted.map(u => u.chapter).slice(0, 2).join(' / ')}`;
      upcomingRestDay.learningPoints = targetUncompleted.flatMap(u => u.learningPoints).slice(0, 5);
      upcomingRestDay.estimatedMinutes = 180;
      upcomingRestDay.reviewCount = 2;

      // 기존 미완료 태스크는 이관 처리(완료 플래그 대신 재배치 상태 표시)
      targetUncompleted.forEach(un => {
        const match = updatedTasks.find(t => t.id === un.id);
        if (match) {
          match.chapter = `[이관완료 -> ${upcomingRestDay.taskDate}] ${match.chapter}`;
          match.isCompleted = true; // 이전 일정 완료 처리
        }
      });

      return {
        updatedTasks,
        summaryMessage: `다가오는 휴식일(${upcomingRestDay.taskDate})을 보충 학습일로 전환하여 미완료 태스크 ${targetUncompleted.length}개를 성공적으로 이관했습니다!`
      };
    } else {
      // 휴식일이 없는 경우 분할 모드로 폴백
      return rescheduleUncompletedTasks(allTasks, uncompletedIds, 'DISTRIBUTE', currentDateStr);
    }
  } else {
    // DISTRIBUTE: 오늘 이후 남은 정상 학습일 목록
    const futureStudyDays = updatedTasks.filter(
      t => t.taskDate > currentDateStr && !t.isRestDay && !t.isCompleted
    );

    if (futureStudyDays.length === 0) {
      return {
        updatedTasks,
        summaryMessage: '남은 미래 학습일이 없어 분기 재배치가 어렵습니다. 시험 일정을 조정해주세요.'
      };
    }

    // 미완료 키포인트들을 수집하여 미래 학습일에 균등 분배
    const pointsToDistribute = targetUncompleted.flatMap(u => 
      u.learningPoints.map(p => `[보충] ${p}`)
    );

    let dayIdx = 0;
    for (const point of pointsToDistribute) {
      const targetDay = futureStudyDays[dayIdx % futureStudyDays.length];
      if (!targetDay.learningPoints.includes(point)) {
        targetDay.learningPoints.push(point);
        targetDay.estimatedMinutes += 25; // 25분 추가
      }
      dayIdx++;
    }

    // 원래 미완료 태스크 이관 마킹
    targetUncompleted.forEach(un => {
      const match = updatedTasks.find(t => t.id === un.id);
      if (match) {
        match.chapter = `[분할 재배치 완료] ${match.chapter}`;
        match.isCompleted = true;
      }
    });

    return {
      updatedTasks,
      summaryMessage: `미완료 태스크 ${targetUncompleted.length}개의 핵심 포인트를 잔여 ${futureStudyDays.length}일 동안 균등하게 분할 재배치했습니다.`
    };
  }
}
