import { NextResponse } from 'next/server';
import { GenerateScheduleRequest } from '@/lib/types';
import { generateRuleBasedTasks, getCalendarDays } from '@/lib/scheduleEngine';

export async function POST(request: Request) {
  try {
    const payload: GenerateScheduleRequest = await request.json();

    if (!payload.examTitle || !payload.startDate || !payload.examDate) {
      return NextResponse.json(
        { error: '필수 입력 항목(시험명, 시작일, 시험일)이 누락되었습니다.' },
        { status: 400 }
      );
    }

    const openAiApiKey = process.env.OPENAI_API_KEY;

    // OpenAI API 호출 가능한 경우 시도
    if (openAiApiKey) {
      try {
        const allDays = getCalendarDays(
          payload.startDate,
          payload.examDate,
          payload.restDaysWeekly || [0, 6],
          payload.customRestDates || []
        );

        const validStudyDays = allDays.filter(d => !d.isRest);
        const totalValidDays = validStudyDays.length;

        const p3DaysCount = Math.max(3, Math.min(14, Math.round(totalValidDays * 0.2)));
        const remainingDays = totalValidDays - p3DaysCount;
        const p1DaysCount = Math.max(1, Math.round(remainingDays * (0.5 / 0.8)));
        const p2DaysCount = Math.max(1, remainingDays - p1DaysCount);

        const prompt = `
당신은 자격증 수험생을 위한 최고의 수험 전략 아키텍트입니다.
사용자가 제공한 시험 정보와 커리큘럼을 기반으로 전체 수험 기간을 3단계로 엄격히 역산 배치한 스케줄 JSON을 생성해주세요.

[시험 정보]
- 시험명: ${payload.examTitle}
- 전체 기간: ${payload.startDate} ~ ${payload.examDate}
- 일일 공부시간: ${payload.dailyHours}시간 (${payload.dailyHours * 60}분)
- 총 유효 학습일수: ${totalValidDays}일
- 1단계(전과목 기본개념 1회독): 앞부분 약 ${p1DaysCount}일 배정 (phase: 1, reviewCount: 1)
- 2단계(취약점 압축 요약 2회독): 중간 약 ${p2DaysCount}일 배정 (phase: 2, reviewCount: 2)
- 3단계(실전 기출 및 파이널 오답노트): 마지막 약 ${p3DaysCount}일 배정 (phase: 3, reviewCount: 3)
- 커리큘럼 원문:
${payload.curriculumText || '표준 국가직무능력표준(NCS) 기반 핵심 과목'}

[휴식일 포함 전체 일자 정보]
${JSON.stringify(allDays.map(d => ({ date: d.dateStr, isRest: d.isRest })))}

반드시 아래 JSON 스키마 형식으로만 출력하십시오:
{
  "tasks": [
    {
      "date": "YYYY-MM-DD",
      "phase": 1,
      "subject": "과목명",
      "chapter": "단원 또는 주제",
      "learningPoints": ["핵심 암기 키워드 1", "핵심 암기 키워드 2"],
      "estimatedMinutes": ${payload.dailyHours * 60},
      "reviewCount": 1,
      "isRestDay": false
    }
  ]
}
`;

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: 'You are an expert exam scheduling AI that outputs strict valid JSON.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
          }),
        });

        if (openAiRes.ok) {
          const aiJson = await openAiRes.json();
          const parsed = JSON.parse(aiJson.choices[0].message.content);
          if (parsed && Array.isArray(parsed.tasks)) {
            return NextResponse.json({ tasks: parsed.tasks, source: 'openai' });
          }
        }
      } catch (aiErr) {
        console.warn('OpenAI 호출 실패, 내장 규칙 엔진으로 자동 전환합니다:', aiErr);
      }
    }

    // OpenAI API Key가 없거나 실패한 경우: 고정밀 3단계 역산 엔진 Fallback
    const fallbackTasks = generateRuleBasedTasks({
      planId: 'plan-auto-gen',
      startDate: payload.startDate,
      examDate: payload.examDate,
      dailyHours: payload.dailyHours || 3.0,
      restDaysWeekly: payload.restDaysWeekly || [0, 6],
      customRestDates: payload.customRestDates || [],
      curriculumText: payload.curriculumText,
      presetId: 'eip',
    });

    const responseFormat = fallbackTasks.map(t => ({
      date: t.taskDate,
      phase: t.phase,
      subject: t.subject,
      chapter: t.chapter,
      learningPoints: t.learningPoints,
      estimatedMinutes: t.estimatedMinutes,
      reviewCount: t.reviewCount,
      isRestDay: t.isRestDay,
    }));

    return NextResponse.json({
      tasks: responseFormat,
      source: 'rule-engine',
    });
  } catch (error: any) {
    console.error('스케줄 생성 API 에러:', error);
    return NextResponse.json(
      { error: error.message || '스케줄 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
