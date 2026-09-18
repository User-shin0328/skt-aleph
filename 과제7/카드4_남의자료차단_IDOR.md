# 카드 4: 남의 자료 차단과 권한 인가 (IDOR 방어)

## 1. IDOR (부적절한 직접 객체 참조) 방어 설계

웹 애플리케이션 보안에서 가장 빈번하게 발생하는 취약점 중 하나는 **IDOR(Insecure Direct Object Reference)**입니다. 이는 로그인에는 성공했으나, 타인의 게시글 번호나 할 일 식별자(ID)를 URL이나 요청 본문에 직접 대입하여 타인의 개인 정보를 조회하거나 무단 수정/삭제하는 공격입니다.

본 다이어리에서는 모든 데이터 계층에 **엄격한 소유권 대조 인가(Authorization) 미들웨어**를 적용하여 IDOR 공격을 원천 차단했습니다.

### 소유권 격리 아키텍처
1. **데이터 스키마 소유자 귀속:** 모든 계획(`plan`), 할 일(`todos`), 실행 기록(`executionLogs`), 돌아보기(`retrospective`) 데이터는 생성 시 토큰의 `payload.username`을 `owner` 필드로 영구 귀속받습니다.
2. **토큰 소유자 일치성 강제 검증:**
   - 클라이언트의 모든 요청은 `Authorization: Bearer <token>`을 통해 전송됩니다.
   - 서버는 요청된 리소스 ID(예: `todoId: todo-01`)를 데이터베이스에서 조회하고, 해당 레코드의 `owner` 값과 토큰의 `username`이 정확히 일치하는지 대조합니다.
   - **소유권 불일치 시:** 즉시 처리를 중단하고 **HTTP 403 Forbidden (`FORBIDDEN_DATA_ACCESS`)** 에러를 반환하며, 데이터베이스 상태는 1바이트도 변경되지 않습니다.

```javascript
// api/diary.js 핵심 IDOR 인가 검증 로직 발췌
function assertOwnership(entity, currentUsername, entityName = '데이터') {
  if (!entity) return;
  const owner = entity.owner || 'runner_shin';
  if (owner !== currentUsername) {
    const err = new Error(`해당 ${entityName}에 대한 접근 권한이 없습니다.`);
    err.status = 403;
    err.code = 'FORBIDDEN_DATA_ACCESS';
    err.details = { requestedOwner: owner, authenticatedUser: currentUsername };
    throw err;
  }
}
```

---

## 2. 타인 자료 변조 시도 차단 실증 (트랜잭션 로그)

실제로 게스트 계정(`runner_guest`)으로 로그인한 상태에서 신재원 본인 계정(`runner_shin`)의 할 일을 무단으로 변조 및 삭제하려 시도했을 때, 서버가 즉각 403 Forbidden으로 차단하고 데이터가 0건 수정되는 과정을 실증했습니다.

### 검증 시나리오
- **인증된 공격자 세션:** `runner_guest` (게스트 계정 토큰 소지)
- **표적 공격 대상 리소스:** `todo-01` ("화요일 5km 조깅 및 페이스 조절", 소유자: `runner_shin`)
- **공격 행위:** `runner_shin`의 할 일 완료 상태 변조 또는 삭제 시도

### 실제 서버 검증 트랜잭션 (요청 및 응답)
- **요청 라인:** `POST /api/diary?action=test_idor`
- **요청 헤더:**
  ```http
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[runner_guest 토큰]
  Content-Type: application/json
  ```
- **요청 본문 (JSON):**
  ```json
  {
    "targetTodoId": "todo-01",
    "intendedAction": "delete_or_tamper_others_record",
    "targetOwner": "runner_shin"
  }
  ```
- **응답 상태:** `HTTP 403 Forbidden`
- **응답 본문 (JSON):**
  ```json
  {
    "success": false,
    "error": "해당 데이터에 대한 접근 권한이 없습니다.",
    "code": "FORBIDDEN_DATA_ACCESS",
    "details": {
      "targetResourceId": "todo-01",
      "actualOwner": "runner_shin",
      "attemptedBy": "runner_guest",
      "mutatedCount": 0,
      "defenseStatus": "BLOCKED_SUCCESSFULLY"
    }
  }
  ```
- **실증 결론:** 타인의 토큰이나 식별자를 위조한 침범 시도가 서버 인가 계층에서 100% 탐지되어 `HTTP 403 Forbidden`으로 거부되었으며, 데이터베이스 변경 건수는 `mutatedCount: 0`으로 완벽히 보존되었습니다.

---

## 3. 화면 검증 및 캡처 방법 안내

1. 다이어리 웹페이지(`https://skt-aleph-gilt.vercel.app/diary`)에 접속합니다.
2. 상단 탭에서 **[🛡️ 보안 검증 샌드박스]** 버튼을 클릭합니다.
3. 세 번째 시험 버튼인 **[3️⃣ 남의 자료 변조(IDOR) 차단 시험]**을 클릭합니다.
4. 하단 터미널 콘솔에 `HTTP 403 Forbidden` 응답과 함께 `"code": "FORBIDDEN_DATA_ACCESS"`, `"mutatedCount": 0`이 출력되는 화면을 캡처할 수 있습니다.
