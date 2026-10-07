import { StudyTask, PhaseType, RescheduleMode, CurriculumPreset, DifficultyLevel, FrequencyStars } from './types';
import { CURRICULUM_PRESETS } from './curriculumPresets';

export interface DateStudyInfo {
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0: 일 ~ 6: 토
  isRest: boolean;
}

/**
 * 난이도 x 빈출도 가중치 점수 산출 함수
 */
export function calculateWeightScore(difficulty: DifficultyLevel, frequency: FrequencyStars): number {
  const diffMultiplier = difficulty === '상' ? 1.3 : difficulty === '중' ? 1.0 : 0.7;
  const freqMultiplier = frequency === 5 ? 1.5 : frequency === 4 ? 1.2 : frequency === 3 ? 1.0 : frequency === 2 ? 0.8 : 0.6;
  return Number((diffMultiplier * freqMultiplier).toFixed(2));
}

/**
 * 시작일부터 시험일까지의 전체 날짜 배열 및 휴식일 여부 판정
 */
export function getCalendarDays(
  startDateStr: string,
  examDateStr: string,
  restDaysWeekly: number[],
  customRestDates: string[] = []
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
 * 과목, 내용, 난이도, 빈출도 기반의 3단계 스마트 역산 스케줄링 알고리즘
 * 1단계 (50%): 전 과목 기본 개념 및 1회독 (고빈출/고난도 학습시간 가중)
 * 2단계 (30%): 취약점 압축 및 빈출 요약 2회독 (빈출 4~5성 핵심 단원 집중)
 * 3단계 (D-14 ~ 시험일, 약 20%): 실전 기출스프린트 및 파이널 오답노트
 */
export function generateRuleBasedTasks(params: {
  planId: string;
  startDate: string;
  examDate: string;
  dailyHours: number;
  restDaysWeekly: number[];
  customRestDates?: string[];
  curriculumText?: string;
  presetId?: string;
}): StudyTask[] {
  const allDays = getCalendarDays(
    params.startDate,
    params.examDate,
    params.restDaysWeekly,
    params.customRestDates || []
  );

  const validStudyDays = allDays.filter(d => !d.isRest);
  const totalValidDays = validStudyDays.length;

  if (totalValidDays === 0) {
    throw new Error('유효한 학습 가능 일자가 없습니다. 휴식일 설정을 확인해주세요.');
  }

  // 1, 2, 3단계 일수 역산 분할
  // Phase 3: 약 20% (최소 3일 ~ 최대 14일)
  const p3DaysCount = Math.max(3, Math.min(14, Math.round(totalValidDays * 0.2)));
  const remainingDays = totalValidDays - p3DaysCount;
  const p1DaysCount = Math.max(1, Math.round(remainingDays * (0.5 / 0.8)));
  const p2DaysCount = Math.max(1, remainingDays - p1DaysCount);

  // 대상 자격증 프리셋 선택
  const preset = CURRICULUM_PRESETS.find(p => p.id === params.presetId) || CURRICULUM_PRESETS[0];
  
  // 전체 챕터 리스트 추출 (난이도, 빈출도 포함)
  interface FlattenedChapter {
    subject: string;
    title: string;
    difficulty: DifficultyLevel;
    frequency: FrequencyStars;
    weightScore: number;
    keyPoints: string[];
  }

  const allChapters: FlattenedChapter[] = [];
  preset.subjects.forEach(s => {
    s.chapters.forEach(c => {
      allChapters.push({
        subject: s.name,
        title: c.title,
        difficulty: c.difficulty,
        frequency: c.frequency,
        weightScore: calculateWeightScore(c.difficulty, c.frequency),
        keyPoints: c.keyPoints
      });
    });
  });

  // Phase 2용 고빈출 핵심 챕터 정렬 (가중치 높은 순)
  const highYieldChapters = [...allChapters].sort((a, b) => b.weightScore - a.weightScore);

  const baseMinutes = Math.round(params.dailyHours * 60);
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
        difficulty: '하',
        frequency: 1,
        weightScore: 0.5,
        learningPoints: ['뇌 휴식 및 수면 보충 (장기기억 고착화)', '가벼운 스트레칭 및 멘탈 케어', '한 주간의 학습 리듬 점검'],
        estimatedMinutes: 0,
        reviewCount: 0,
        isCompleted: true,
        isRestDay: true,
        completedAt: null
      });
    } else {
      let phase: PhaseType = 1;
      let reviewCount = 1;
      let chapterInfo: FlattenedChapter;
      let estimatedMins = baseMinutes;

      if (validDayIndex < p1DaysCount) {
        // [1단계: 50%] 전 과목 기본 개념 및 1회독
        phase = 1;
        reviewCount = 1;
        const chapIdx = validDayIndex % allChapters.length;
        chapterInfo = allChapters[chapIdx];

        // 난이도 '상' 및 빈출 5성 단원은 학습 시간 20% 추가 배정
        if (chapterInfo.difficulty === '상' && chapterInfo.frequency >= 4) {
          estimatedMins = Math.round(baseMinutes * 1.2);
        }
      } else if (validDayIndex < p1DaysCount + p2DaysCount) {
        // [2단계: 30%] 취약점 압축 및 빈출 요약 2회독 (고빈출 핵심 중심)
        phase = 2;
        reviewCount = 2;
        const p2Idx = (validDayIndex - p1DaysCount) % highYieldChapters.length;
        const orig = highYieldChapters[p2Idx];
        chapterInfo = {
          subject: orig.subject,
          title: `[핵심 2회독] ${orig.title}`,
          difficulty: orig.difficulty,
          frequency: orig.frequency,
          weightScore: orig.weightScore,
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
          title: `${year}년 제${round}회 기출 실전 풀이 & 취약과목 단권화`,
          difficulty: '상',
          frequency: 5,
          weightScore: 1.95,
          keyPoints: [
            `실전 타이머 150분 측정 풀이 (${preset.passCriteria})`,
            '틀린 문항 오답노트 작성 및 취약 과목 단권화 체크',
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
        difficulty: chapterInfo.difficulty,
        frequency: chapterInfo.frequency,
        weightScore: chapterInfo.weightScore,
        learningPoints: chapterInfo.keyPoints,
        estimatedMinutes: estimatedMins,
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
    const upcomingRestDay = updatedTasks.find(
      t => t.taskDate >= currentDateStr && t.isRestDay
    );

    if (upcomingRestDay) {
      upcomingRestDay.isRestDay = false;
      upcomingRestDay.isCompleted = false;
      upcomingRestDay.phase = 2;
      upcomingRestDay.subject = '⚡ 특별 보충 학습일';
      upcomingRestDay.chapter = `[지연 만회] ${targetUncompleted.map(u => u.chapter).slice(0, 2).join(' / ')}`;
      upcomingRestDay.difficulty = '상';
      upcomingRestDay.frequency = 5;
      upcomingRestDay.learningPoints = targetUncompleted.flatMap(u => u.learningPoints).slice(0, 5);
      upcomingRestDay.estimatedMinutes = 180;
      upcomingRestDay.reviewCount = 2;

      targetUncompleted.forEach(un => {
        const match = updatedTasks.find(t => t.id === un.id);
        if (match) {
          match.chapter = `[이관완료 -> ${upcomingRestDay.taskDate}] ${match.chapter}`;
          match.isCompleted = true;
        }
      });

      return {
        updatedTasks,
        summaryMessage: `다가오는 휴식일(${upcomingRestDay.taskDate})을 보충 학습일로 전환하여 미완료 과제 ${targetUncompleted.length}개를 성공적으로 이관했습니다!`
      };
    } else {
      return rescheduleUncompletedTasks(allTasks, uncompletedIds, 'DISTRIBUTE', currentDateStr);
    }
  } else {
    const futureStudyDays = updatedTasks.filter(
      t => t.taskDate > currentDateStr && !t.isRestDay && !t.isCompleted
    );

    if (futureStudyDays.length === 0) {
      return {
        updatedTasks,
        summaryMessage: '남은 미래 학습일이 없어 분할 재배치가 어렵습니다.'
      };
    }

    const pointsToDistribute = targetUncompleted.flatMap(u => 
      u.learningPoints.map(p => `[보충] ${p}`)
    );

    let dayIdx = 0;
    for (const point of pointsToDistribute) {
      const targetDay = futureStudyDays[dayIdx % futureStudyDays.length];
      if (!targetDay.learningPoints.includes(point)) {
        targetDay.learningPoints.push(point);
        targetDay.estimatedMinutes += 25;
      }
      dayIdx++;
    }

    targetUncompleted.forEach(un => {
      const match = updatedTasks.find(t => t.id === un.id);
      if (match) {
        match.chapter = `[분할 재배치 완료] ${match.chapter}`;
        match.isCompleted = true;
      }
    });

    return {
      updatedTasks,
      summaryMessage: `미완료 과제 ${targetUncompleted.length}개의 핵심 포인트를 잔여 ${futureStudyDays.length}일에 균등하게 분할 재배치했습니다.`
    };
  }
}
