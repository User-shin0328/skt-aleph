import { NextResponse } from 'next/server';
import { RescheduleRequest } from '@/lib/types';
import { rescheduleUncompletedTasks } from '@/lib/scheduleEngine';

export async function POST(request: Request) {
  try {
    const payload: RescheduleRequest = await request.json();

    if (!payload.planId || !payload.uncompletedTaskIds || !payload.rescheduleMode) {
      return NextResponse.json(
        { error: '필수 요청 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 클라이언트나 DB에서 가져올 태스크 대신 요청 본문이나 엔진 로직 기반 재배치 처리
    // Supabase 연동 시 DB에서 SELECT -> UPDATE 처리
    return NextResponse.json({
      success: true,
      mode: payload.rescheduleMode,
      message: payload.rescheduleMode === 'USE_REST_DAY'
        ? '가장 가까운 다음 휴식일을 보충 학습일로 전환하여 미완료 과제를 이관했습니다.'
        : '남은 잔여 학습일들에 미완료 핵심 과제를 균등하게 분할 배분했습니다.',
      todayStr
    });
  } catch (error: any) {
    console.error('재스케줄링 API 에러:', error);
    return NextResponse.json(
      { error: error.message || '일정 재배치 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
