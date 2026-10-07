# CertiFlow (수험생 맞춤형 자격증 시험 스케줄링 SaaS)

> **수험생의 남은 기간을 정밀 분석하여 50% 개념정독, 30% 핵심회독, 20% 기출스프린트로 완벽 역산 배치하는 AI 자격증 수험 플래너**

---

## 🌟 프로젝트 개요 및 핵심 아키텍처

- **목적**: 자격증 시험(정보처리기사, SQLD, 네트워크관리사 등)을 준비하는 수험생을 위해, 시험일까지의 잔여 일수와 휴식일을 고려하여 최적의 3단계 역산 학습 계획을 수립하고, 학습 지연 발생 시 스마트 재배치 알고리즘을 통해 수험 완주를 돕는 All-in-One SaaS 웹 애플리케이션입니다.
- **Tech Stack**:
  - **Frontend**: Next.js 14+ (App Router, TypeScript, React 18)
  - **Styling**: Tailwind CSS, Pretendard / JetBrains Mono 폰트
  - **Calendar UI**: 경량 커스텀 반응형 그리드 캘린더 (과목별 컬러 뱃지, 회독 태그, 빗금 휴식일, 완료 체크)
  - **State Management**: Zustand (with LocalStorage persist as optimistic fallback)
  - **Backend**: Next.js Route Handlers (`/api/generate-schedule`, `/api/reschedule`)
  - **Database & Auth**: Supabase PostgreSQL (Row Level Security 및 Auth 연동 트리거)
  - **AI Engine**: OpenAI API (`gpt-4o-mini` with JSON Schema Structured Outputs) & 고성능 로컬 Fallback 엔진

---

## 🗄️ 데이터베이스 스키마 및 마이그레이션 (Supabase)

Supabase 프로젝트 대시보드의 **SQL Editor**에 [`supabase/migrations/20261001_init_schema.sql`](file:///c:/Users/User/Desktop/sktaleph/나의%20앱만들기/supabase/migrations/20261001_init_schema.sql) 파일의 내용을 그대로 복사하여 실행하시면 모든 테이블과 보안 정책이 생성됩니다.

### 테이블 구성
1. `profiles`: `id (uuid, PK, references auth.users)`, `email`, `created_at`
2. `study_plans`:
   - `id (uuid, PK)`
   - `user_id (uuid, references profiles(id) on delete cascade)`
   - `title (text)`: 시험 명칭
   - `start_date (date)`, `exam_date (date)`
   - `daily_study_hours (numeric)`: 일일 학습시간
   - `rest_days_weekly (integer[])`: 주간 정기 휴식일 (0: 일 ~ 6: 토)
   - `custom_rest_dates (date[])`: 개별 지정 휴양일
   - `curriculum_source (text)`: 커리큘럼 원문
3. `study_tasks`:
   - `id (uuid, PK)`
   - `plan_id (uuid, references study_plans(id) on delete cascade)`
   - `task_date (date)`
   - `phase (integer)`: 1(개념정독), 2(핵심회독), 3(기출스프린트)
   - `subject (text)`: 과목명
   - `chapter (text)`: 단원명
   - `learning_points (text[])`: 핵심 암기 키워드 리스트
   - `estimated_minutes (integer)`: 소요 예상시간
   - `review_count (integer)`: 회독수 카운트
   - `is_completed (boolean)`: 완료 여부
   - `is_rest_day (boolean)`: 휴식일 여부
   - `completed_at (timestamptz)`: 완료 시각
4. **보안 (Row Level Security)**:
   - 모든 테이블에 RLS 활성화 및 `auth.uid() = user_id` 기반 CRUD 정책 부여
   - 회원가입 시 `profiles` 자동 생성 트리거(`on_auth_user_created`) 내장

---

## 🧠 핵심 비즈니스 로직 & 알고리즘

### 1. 3단계 역산 배치 알고리즘 (`/api/generate-schedule`)
1. **순수 유효 학습일 계산**: 전체 수험 기간 중 주간 휴식일(`restDaysWeekly`) 및 지정 휴일(`customRestDates`)을 제외한 순수 공부 가능 일수 산출
2. **역산 단계 분할**:
   - **1단계 (50%)**: 전 과목 기본 개념 및 1회독 (`phase: 1, reviewCount: 1`)
   - **2단계 (30%)**: 취약점 압축 및 빈출 요약 2회독 (`phase: 2, reviewCount: 2`)
   - **3단계 (D-14 ~ 시험일, 약 20%)**: 실전 기출문제 풀이 및 파이널 오답노트 (`phase: 3, reviewCount: 3`)

### 2. 지연 일정 스마트 재배치 (`/api/reschedule`)
수험생이 지난 일정을 완료하지 못했을 때 2가지 전략 선택 제공:
- **`USE_REST_DAY` (권장)**: 다가오는 가장 가까운 휴식일을 '보충 학습일'로 전환하여 밀린 과제를 집중 이관
- **`DISTRIBUTE`**: 잔여 미래 학습일에 미완료 과제의 핵심 포인트를 일일 +25분씩 균등 분할 배분

---

## 🚀 로컬 실행 방법 (Next.js 개발 환경)

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 환경 변수 설정
cp .env.local.example .env.local
# .env.local에 Supabase URL/Key 및 OpenAI API Key 입력 (미입력 시에도 로컬 Mock 데이터로 100% 동작)

# 3. 개발 서버 실행
npm run dev
# 브라우저에서 http://localhost:3000 접속
```

---

## 💻 브라우저 즉시 체험 (Node.js 미설치 환경 대응)

Node.js 환경이 없거나 빠른 시연 및 검증이 필요한 경우, 같은 폴더에 생성된 [`index.html`](file:///c:/Users/User/Desktop/sktaleph/나의%20앱만들기/index.html) 파일을 크롬 또는 엣지 브라우저에서 더블클릭하여 바로 여시면 **동일한 UI/UX 인터랙션(캘린더, 우측 패널, 모달, 재배치, 로컬스토리지)**을 즉시 체험하실 수 있습니다!
