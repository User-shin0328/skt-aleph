-- ==============================================================================
-- CertiFlow: 자격증 수험생 맞춤형 AI 스케줄링 SaaS Database Schema
-- Supabase SQL Editor에서 전체 복사하여 원클릭 실행할 수 있는 DDL 스크립트입니다.
-- ==============================================================================

-- 0. 확장 기능 활성화 (UUID 생성용)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. profiles 테이블 (auth.users 연동 프로필)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.profiles IS '수험생 회원 프로필 (Supabase Auth 연동)';

-- ==============================================================================
-- 2. study_plans 테이블 (자격증 시험 마스터 학습 계획)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  exam_date DATE NOT NULL,
  daily_study_hours NUMERIC(4, 1) NOT NULL DEFAULT 3.0,
  rest_days_weekly INTEGER[] NOT NULL DEFAULT '{0, 6}', -- 0: 일, 6: 토
  custom_rest_dates DATE[] DEFAULT '{}',
  curriculum_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  
  -- 유효성 검사: 시험일은 시작일보다 미래여야 함
  CONSTRAINT check_dates_validity CHECK (exam_date >= start_date)
);

COMMENT ON TABLE public.study_plans IS '자격증 시험 플랜 (목표일, 일일 학습량, 휴식일 규칙)';

-- ==============================================================================
-- 3. study_tasks 테이블 (일자별 세부 학습 과제)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.study_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
  task_date DATE NOT NULL,
  phase INTEGER NOT NULL CHECK (phase IN (1, 2, 3)), -- 1: 개념정독, 2: 핵심회독, 3: 기출스프린트
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  learning_points TEXT[] NOT NULL DEFAULT '{}',
  estimated_minutes INTEGER NOT NULL DEFAULT 180,
  review_count INTEGER NOT NULL DEFAULT 1,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_rest_day BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.study_tasks IS '일자별 분할 학습 태스크 (3단계 역산 배치 및 회독 관리)';

-- ==============================================================================
-- 4. 성능 최적화를 위한 인덱스 생성
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_plan_id ON public.study_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_date ON public.study_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_study_tasks_completed ON public.study_tasks(is_completed);

-- ==============================================================================
-- 5. Row Level Security (RLS) 보안 설정
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;

-- 5-1. profiles RLS 정책 (자신의 프로필만 조회/수정)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5-2. study_plans RLS 정책 (자신의 플랜만 CRUD)
DROP POLICY IF EXISTS "Users can view own study plans" ON public.study_plans;
CREATE POLICY "Users can view own study plans"
  ON public.study_plans FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own study plans" ON public.study_plans;
CREATE POLICY "Users can insert own study plans"
  ON public.study_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own study plans" ON public.study_plans;
CREATE POLICY "Users can update own study plans"
  ON public.study_plans FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own study plans" ON public.study_plans;
CREATE POLICY "Users can delete own study plans"
  ON public.study_plans FOR DELETE
  USING (auth.uid() = user_id);

-- 5-3. study_tasks RLS 정책 (자신의 플랜에 속한 태스크만 CRUD)
DROP POLICY IF EXISTS "Users can view tasks in own plans" ON public.study_tasks;
CREATE POLICY "Users can view tasks in own plans"
  ON public.study_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.study_plans
      WHERE public.study_plans.id = public.study_tasks.plan_id
        AND public.study_plans.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert tasks into own plans" ON public.study_tasks;
CREATE POLICY "Users can insert tasks into own plans"
  ON public.study_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.study_plans
      WHERE public.study_plans.id = public.study_tasks.plan_id
        AND public.study_plans.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update tasks in own plans" ON public.study_tasks;
CREATE POLICY "Users can update tasks in own plans"
  ON public.study_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.study_plans
      WHERE public.study_plans.id = public.study_tasks.plan_id
        AND public.study_plans.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete tasks in own plans" ON public.study_tasks;
CREATE POLICY "Users can delete tasks in own plans"
  ON public.study_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.study_plans
      WHERE public.study_plans.id = public.study_tasks.plan_id
        AND public.study_plans.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 6. 편리한 Supabase Auth 회원가입 트리거 (신규 가입 시 profiles 자동 생성)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (new.id, new.email, now())
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 7. 완료 상태 변경 시 completed_at 자동 갱신 트리거
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    NEW.completed_at = now();
  ELSIF NEW.is_completed = false THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_task_completion_changed ON public.study_tasks;
CREATE TRIGGER on_task_completion_changed
  BEFORE UPDATE OF is_completed ON public.study_tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_completion();
