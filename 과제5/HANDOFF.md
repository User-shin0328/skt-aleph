# 7칸 인수인계 문서 (HANDOFF.md)

- **인계 일시**: 2026-09-18 09:48 KST
- **인계자**: AI 도구 A [블라인드]
- **인수자**: AI 도구 B [블라인드]
- **저장소 버전 ID**: `452eb2a1d29fa756306c4b22c7eb1df0b89b889b`

---

### 1. 목표 (Goal)
과제 4 날씨&환율 정보판(`board.html`)에 **실시간 환율 변환 계산기** 기능을 완성하여, 사전에 확정한 10개 고정 검사(`T05-TEST-01` ~ `T05-TEST-10`)를 100% 통과시키는 것.

### 2. 현재 상태 (Current State)
- 계산기 기본 UI 컨테이너(`#fxCalculatorSection`) 마크업 배치 완료.
- 원화(KRW)를 입력받아 미국(USD), 일본(JPY 100엔 공식), 중국(CNY)으로 환산하는 기본 수식 함수(`calculateExchange`) 작성 완료.
- 정상적인 양수 금액(10만, 100만 원) 입력 시 3개국 통화 환산값이 정상 출력됨 (검사 5건 통과).

### 3. 실행 명령 (Execution Commands)
- 소스 코드 확인: `c:\Users\User\Desktop\sktaleph\board.html`
- 로컬 브라우저 실행: `http://localhost:3000/board.html`
- 라이브 배포 주소: `https://skt-aleph-gilt.vercel.app/board`

### 4. 통과 검사 (Passed Tests)
- `T05-TEST-01`: 기본 UI 렌더링 검사 (PASS)
- `T05-TEST-02`: 원화 1,000,000원 입력 시 USD 환산 정확도 (PASS)
- `T05-TEST-03`: 원화 100,000원 입력 시 JPY (100엔 공식) 환산 정확도 (PASS)
- `T05-TEST-04`: 원화 100,000원 입력 시 CNY 환산 정확도 (PASS)
- `T05-TEST-05`: 빠른 금액 100만 원 버튼 클릭 시 즉시 환산 (PASS)

### 5. 남은 문제 (Remaining Issues / Failed Tests)
- `T05-TEST-06`: 0원 입력 시 `NaN` 또는 빈 문자열 처리 미비.
- `T05-TEST-07`: 음수(-50,000 등) 입력 시 경고 메시지 라벨이 붉은색으로 바뀌지 않고 음수가 그대로 계산되는 결함.
- `T05-TEST-08`: 숫자가 아닌 문자('abc' 등) 입력 시 `NaN`이 노출되며 사용자 에러 피드백 부재.
- `T05-TEST-09`: 초기화 버튼 클릭 시 입력창 및 환산 결과를 `0.00`으로 되돌리는 `resetCalculator()` 함수 미구현.
- `T05-TEST-10`: 네트워크 오프라인 또는 API 로딩 전일 때 `localStorage` 캐시 환율 데이터를 읽어와 계산하는 폴백 로직 누락.

### 6. 다음 행동 (Next Action)
1. `board.html`의 `calculateExchange(krwAmount, fxRec)` 함수 내에 `0`, `음수`, `문자열` 유효성 검사 로직을 보강하고 `#calcInputValidMsg`에 상태 메시지 표시.
2. `resetCalculator()` 함수를 구현하여 `[초기화]` 버튼 클릭 시 입력값을 `0`으로 리셋하고 `0.00` 출력.
3. `onCalcInputChange`에서 `currentFxRecord`가 없을 경우 `localStorage.getItem(FX_CACHE_KEY)`를 읽어와 오프라인 상태에서도 계산을 지원하도록 보완.

### 7. 건드리지 말 것 (Scope Restrictions)
- 기존 서울 실시간 기온 카드(`#board-metric-card`) 및 일별 기록 테이블(`#liveDailyTableBody`) 코드와 구조는 절대 변경하지 말 것.
- Open-Meteo 및 open.er-api.com API 호출 URL 및 비밀키 0건 노출 원칙을 엄격히 준수할 것.
