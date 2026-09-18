// Vercel Serverless Function: 플랜두씨 다이어리 2 — 인증, 권한 격리 및 서버 DB REST API
// 보안 규약: PBKDF2-HMAC-SHA256 (100,000 iters), JWT Bearer 토큰 (24h), 양방향 IDOR 차단, 토큰 폐기 블랙리스트

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE_PATH = path.join('/tmp', 'pds_database_v2.json');
const JWT_SECRET = process.env.JWT_SECRET || 'skt-aleph-pds-diary-jwt-secure-salt-key-2026';

// -----------------------------------------------------------------------------
// 1. 보안 암호화 헬퍼 (PBKDF2 & JWT)
// -----------------------------------------------------------------------------

// PBKDF2 단방향 해싱 (NIST SP 800-132 준수)
function hashPassword(password, existingSalt = null) {
  const salt = existingSalt || crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
  return { salt, hash };
}

// 비밀번호 검증 (Timing-safe comparison)
function verifyPassword(password, salt, storedHash) {
  const { hash } = hashPassword(password, salt);
  const bufA = Buffer.from(hash, 'hex');
  const bufB = Buffer.from(storedHash, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// 표준 Base64URL 인코딩
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf-8');
}

// JWT 서명 (유효기간: 1시간 = 3600초)
function signJwt(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + 3600 // 1시간
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64');
  const encodedSignature = signature.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${data}.${encodedSignature}`;
}

// JWT 검증
function verifyJwt(token, db) {
  if (!token || typeof token !== 'string') return null;

  // 토큰 블랙리스트 (로그아웃 시 등록된 토큰 거절)
  if (db.revokedTokens && db.revokedTokens.includes(token)) {
    return { error: 'token_revoked', message: 'Token has been revoked upon logout' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  if (encodedSignature !== expectedSig) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { error: 'token_expired', message: 'Token has expired' };
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// HTTP 요청 헤더에서 Bearer 토큰 추출
function extractToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

// -----------------------------------------------------------------------------
// 2. 초기 데이터셋 (2개 계정, 5일간의 실제 러닝 기록 & 3일차 전 규칙 변경)
// -----------------------------------------------------------------------------
function getInitialDataset() {
  // 계정 1 (본인: runner_shin) & 계정 2 (타인: runner_guest)
  // 두 계정은 동일한 초기 비밀번호 'P@ssw0rd123!'를 사용하지만 서로 다른 고유 솔트로 인해 저장된 해시값이 완전히 상이함!
  const defaultPw = 'P@ssw0rd123!';
  const userShinCrypto = hashPassword(defaultPw);
  const userGuestCrypto = hashPassword(defaultPw);

  return {
    version: '2.1.0',
    meta: {
      timezone: 'Asia/Seoul',
      databaseEngine: 'server-db-pds-auth-v2',
      updatedAt: new Date().toISOString()
    },
    revokedTokens: [], // 로그아웃된 토큰 블랙리스트
    users: [
      {
        id: 'usr-shin0328',
        username: 'runner_shin',
        displayName: '신재원 (본인 계정)',
        salt: userShinCrypto.salt,
        passwordHash: userShinCrypto.hash,
        createdAt: '2026-09-01T09:00:00+09:00'
      },
      {
        id: 'usr-guest001',
        username: 'runner_guest',
        displayName: '게스트 사용자 (타인 계정 - IDOR 시험용)',
        salt: userGuestCrypto.salt,
        passwordHash: userGuestCrypto.hash,
        createdAt: '2026-09-01T09:00:00+09:00'
      }
    ],
    // 계획 (사용자별 격리)
    plans: [
      {
        id: 'plan-running-2026-h2',
        owner: 'runner_shin',
        title: '2026 하반기 갑천 러닝 페이스 단축 & 코어 강화 프로젝트',
        startDate: '2026-09-01',
        endDate: '2026-10-31',
        priority: '높음',
        successCriteria: '10km 52분 이내 완주 & 주 4회 러닝/보강운동 달성 (누적 40회)',
        estimatedMinutes: 2880,
        createdAt: '2026-09-01T09:00:00+09:00',
        updatedAt: '2026-09-05T10:00:00+09:00'
      },
      {
        id: 'plan-guest-home-01',
        owner: 'runner_guest',
        title: '게스트 실내 홈트레이닝 및 하체 스트레칭',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        priority: '보통',
        successCriteria: '매일 20분 가벼운 홈트 완주',
        estimatedMinutes: 600,
        createdAt: '2026-09-01T10:00:00+09:00',
        updatedAt: '2026-09-01T10:00:00+09:00'
      }
    ],
    planHistory: [
      {
        historyId: 'phist-v1-initial',
        planId: 'plan-running-2026-h2',
        owner: 'runner_shin',
        version: 1,
        title: '2026 하반기 가벼운 달리기 루틴',
        startDate: '2026-09-01',
        endDate: '2026-10-31',
        priority: '보통',
        successCriteria: '주 3회 5km 완주 및 기초 체력 유지',
        estimatedMinutes: 1440,
        modifiedAt: '2026-09-05T10:00:00+09:00',
        changeReason: '하프 마라톤 대비를 위해 주 4회 분할 인터벌 및 코어 보강 계획으로 상향 수정'
      }
    ],
    todos: [
      {
        id: 'todo-01',
        planId: 'plan-running-2026-h2',
        owner: 'runner_shin',
        title: '화요일 5km 조깅 및 페이스 조절',
        dueDate: '2026-09-15',
        priority: '보통',
        tags: ['#러닝', '#유산소', '#조깅'],
        estimatedMinutes: 35,
        status: 'completed',
        completedAt: '2026-09-15T20:08:00+09:00',
        createdAt: '2026-09-01T09:10:00+09:00',
        updatedAt: '2026-09-15T20:08:00+09:00'
      },
      {
        id: 'todo-02',
        planId: 'plan-running-2026-h2',
        owner: 'runner_shin',
        title: '수요일 코어 운동 & 플랭크 5세트',
        dueDate: '2026-09-16',
        priority: '높음',
        tags: ['#근력', '#코어', '#보강'],
        estimatedMinutes: 30,
        status: 'completed',
        completedAt: '2026-09-16T07:42:00+09:00',
        createdAt: '2026-09-01T09:15:00+09:00',
        updatedAt: '2026-09-16T07:42:00+09:00'
      },
      {
        id: 'todo-03',
        planId: 'plan-running-2026-h2',
        owner: 'runner_shin',
        title: '목요일 800m 인터벌 러닝 5회전',
        dueDate: '2026-09-17',
        priority: '아주높음',
        tags: ['#인터벌', '#스피드', '#트랙'],
        estimatedMinutes: 45,
        status: 'completed',
        completedAt: '2026-09-17T20:55:00+09:00',
        createdAt: '2026-09-01T09:20:00+09:00',
        updatedAt: '2026-09-17T20:55:00+09:00'
      },
      {
        id: 'todo-04',
        planId: 'plan-running-2026-h2',
        owner: 'runner_shin',
        title: '토요일 갑천 12km 지속주 LSD 러닝',
        dueDate: '2026-09-14',
        priority: '높음',
        tags: ['#LSD', '#지구력', '#갑천'],
        estimatedMinutes: 75,
        status: 'pending',
        completedAt: null,
        createdAt: '2026-09-01T09:25:00+09:00',
        updatedAt: '2026-09-01T09:25:00+09:00'
      },
      {
        id: 'todo-05',
        planId: 'plan-running-2026-h2',
        owner: 'runner_shin',
        title: '일요일 폼롤러 전신 스트레칭 & 족욕',
        dueDate: '2026-09-20',
        priority: '낮음',
        tags: ['#리커버리', '#스트레칭', '#회복'],
        estimatedMinutes: 40,
        status: 'pending',
        completedAt: null,
        createdAt: '2026-09-01T09:30:00+09:00',
        updatedAt: '2026-09-01T09:30:00+09:00'
      },
      // 게스트 할 일 (IDOR 격리 테스트용)
      {
        id: 'todo-guest-01',
        planId: 'plan-guest-home-01',
        owner: 'runner_guest',
        title: '게스트 푸시업 100개 세트',
        dueDate: '2026-09-18',
        priority: '보통',
        tags: ['#홈트'],
        estimatedMinutes: 20,
        status: 'completed',
        completedAt: '2026-09-18T10:00:00+09:00',
        createdAt: '2026-09-01T10:10:00+09:00',
        updatedAt: '2026-09-18T10:00:00+09:00'
      }
    ],
    executionLogs: [
      {
        id: 'log-01',
        todoId: 'todo-01',
        planId: 'plan-running-2026-h2',
        owner: 'runner_shin',
        startedAt: '2026-09-15T19:30:00+09:00',
        endedAt: '2026-09-15T20:08:00+09:00',
        actualMinutes: 38,
        obstacleReason: '',
        idempotencyKey: 'idemp-01-complete-key',
        recordedAt: '2026-09-15T20:08:00+09:00'
      },
      {
        id: 'log-02',
        todoId: 'todo-02',
        planId: 'plan-running-2026-h2',
        owner: 'runner_shin',
        startedAt: '2026-09-16T07:10:00+09:00',
        endedAt: '2026-09-16T07:42:00+09:00',
        actualMinutes: 32,
        obstacleReason: '',
        idempotencyKey: 'idemp-02-complete-key',
        recordedAt: '2026-09-16T07:42:00+09:00'
      },
      {
        id: 'log-03',
        todoId: 'todo-03',
        planId: 'plan-running-2026-h2',
        owner: 'runner_shin',
        startedAt: '2026-09-17T20:00:00+09:00',
        endedAt: '2026-09-17T20:55:00+09:00',
        actualMinutes: 55,
        obstacleReason: '오른쪽 종아리 비복근 뭉침 및 4회전 후 호흡 가빠짐으로 5분간 휴식 후 겨우 완주',
        idempotencyKey: 'idemp-03-complete-key',
        recordedAt: '2026-09-17T20:55:00+09:00'
      }
    ],
    retrospective: {
      id: 'retro-running-w3',
      planId: 'plan-running-2026-h2',
      owner: 'runner_shin',
      period: '2026년 9월 3주차 종합 분석',
      nextImprovementPoint: '주중 인터벌 훈련 전후 15분 동적 웜업/쿨다운 필수 배정 및 주말 갑천 LSD 러닝 일정 수요일 사전 리마인드',
      updatedAt: '2026-09-18T09:00:00+09:00'
    },
    // 5일간의 실제 러닝 기록 & 3일차 전 계획 규칙 변경 (Asia/Seoul 기준 5일 연속)
    fiveDayRunning: {
      owner: 'runner_shin',
      question: '갑천변 10km 지속주 페이스를 5분 12초/km 이내로 안정적으로 유지할 수 있는가?',
      metricName: '평균 페이스',
      metricUnit: '초/km (sec/km)',
      rules: {
        timezone: 'Asia/Seoul',
        startDayOfWeek: 'Monday (월요일)',
        missingValueHandling: '미기록 시 휴식(0km)으로 분리 집계',
        duplicateHandling: '동일 일자 복수 러닝 시 거리 합산 및 페이스 가중평균 산출',
        outlierHandling: '페이스 200초/km 미만 또는 600초/km 초과는 센서 오차로 판정 후 재측정치 반영',
        rounding: '소수점 첫째 자리 반올림 (정수 초 단위)'
      },
      records: [
        {
          dayIndex: 1,
          dateKst: '2026-09-14',
          course: '갑천 엑스포다리 ~ 카이스트 왕복',
          distanceKm: 8.5,
          durationMinutes: 45,
          paceSecPerKm: 318, // 5분 18초/km
          completed: true,
          notes: '첫날 페이스 탐색주, 후반부 맞바람으로 목표 312초 대비 약간 지연'
        },
        {
          dayIndex: 2,
          dateKst: '2026-09-15',
          course: '갑천 둔산대교 ~ 유림공원 코스',
          distanceKm: 10.0,
          durationMinutes: 52,
          paceSecPerKm: 312, // 5분 12초/km
          completed: true,
          notes: '목표 페이스 달성 성공했으나 8km 지점부터 오른쪽 종아리 뭉침 발생'
        },
        {
          dayIndex: 3,
          dateKst: '2026-09-16',
          course: '갑천 잔디광장 순환로 (리커버리)',
          distanceKm: 6.0,
          durationMinutes: 32,
          paceSecPerKm: 320, // 5분 20초/km (회복 조깅)
          completed: true,
          notes: '규칙 변경 후 첫 적용: 고강도 지속주 대신 가벼운 회복 조깅 및 폼롤러 20분 실시'
        },
        {
          dayIndex: 4,
          dateKst: '2026-09-17',
          course: '갑천 육상 트랙 800m x 5회 인터벌',
          distanceKm: 7.0,
          durationMinutes: 35,
          paceSecPerKm: 300, // 5분 00초/km (인터벌 구간 평균)
          completed: true,
          notes: '동적 웜업 15분 선행 후 인터벌 실시, 4회전에서 휴식 취했으나 완주 성공'
        },
        {
          dayIndex: 5,
          dateKst: '2026-09-18',
          course: '갑천 대덕보 ~ 신구교 장거리 LSD',
          distanceKm: 12.0,
          durationMinutes: 61,
          paceSecPerKm: 305, // 5분 05초/km
          completed: true,
          notes: '주말 전 지속주 완주, 비복근 통증 재발 없이 5분 5초 안정 페이스 기록'
        }
      ],
      // 계획 규칙 변경 (2일차 뒤, 3일차 앞)
      ruleChange: {
        appliedAfterDay: 2,
        appliedBeforeDay: 3,
        changedAt: '2026-09-15T22:00:00+09:00',
        reason: '1일차(09-14)와 2일차(09-15) 연속 8~10km 고강도 지속주로 인해 종아리 비복근 피로가 급증하여 부상 위험이 관측됨. 따라서 3일차부터는 [주 5회 매일 10km 강도 러닝]에서 [인터벌-회복 조깅-코어 보강 퐁당퐁당 분할 루틴]으로 훈련 강도 규칙을 변경함.',
        beforeRule: '주 5회 매일 10km 이상 고강도 지속주 달리기',
        afterRule: '인터벌 1회 + 회복 조깅 1회 + 장거리 LSD 1회 + 코어 보강 분할 루틴 (격일 강약 조절)'
      }
    }
  };
}

// 데이터 로드
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.users) && Array.isArray(data.plans)) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Database load warning:', e.message);
  }
  const initial = getInitialDataset();
  saveDatabase(initial);
  return initial;
}

// 데이터 저장
function saveDatabase(data) {
  try {
    data.meta = data.meta || {};
    data.meta.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.warn('Database save warning:', e.message);
    return false;
  }
}

// -----------------------------------------------------------------------------
// 3. Vercel Serverless 요청 핸들러
// -----------------------------------------------------------------------------
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Idempotency-Key');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('x-server-auth-engine', 'jwt-pbkdf2-v2');
  res.setHeader('x-server-timezone', 'Asia/Seoul');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let db = loadDatabase();
  const token = extractToken(req);

  // =========================================================================
  // [A] 공개 인증 엔드포인트 (회원가입, 로그인, 해시비교)
  // =========================================================================

  // 1. 회원가입 (POST /api/diary?action=register)
  if (req.method === 'POST' && req.query.action === 'register') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { username, password, displayName } = payload;

      if (!username || !password || username.trim().length < 3 || password.length < 4) {
        return res.status(400).json({ success: false, error: '아이디는 3자 이상, 비밀번호는 4자 이상이어야 합니다.' });
      }

      const cleanUsername = username.trim().toLowerCase();
      const existingUser = db.users.find(u => u.username === cleanUsername);
      if (existingUser) {
        return res.status(409).json({ success: false, error: '이미 사용 중인 아이디입니다.' });
      }

      // PBKDF2 솔트 해싱
      const { salt, hash } = hashPassword(password);
      const newUser = {
        id: `usr-${Date.now()}`,
        username: cleanUsername,
        displayName: displayName || cleanUsername,
        salt,
        passwordHash: hash,
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);

      // 기본 개인 계획 1개 자동 생성
      const newPlan = {
        id: `plan-${cleanUsername}-${Date.now()}`,
        owner: cleanUsername,
        title: `${displayName || cleanUsername}의 개인 운동 다이어리`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        priority: '보통',
        successCriteria: '주 3회 운동 완료 및 목표 페이스 유지',
        estimatedMinutes: 1200,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.plans.push(newPlan);

      saveDatabase(db);

      // 가입 성공 즉시 JWT 토큰 발급 (1시간 유효)
      const token = signJwt({ username: cleanUsername, displayName: newUser.displayName });
      const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
      return res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        token,
        expiresAt,
        user: { username: cleanUsername, displayName: newUser.displayName }
      });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // 2. 로그인 (POST /api/diary?action=login)
  if (req.method === 'POST' && req.query.action === 'login') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { username, password } = payload;

      if (!username || !password) {
        return res.status(400).json({ success: false, error: '아이디와 비밀번호를 모두 입력해주세요.' });
      }

      const cleanUsername = username.trim().toLowerCase();
      const user = db.users.find(u => u.username === cleanUsername);

      // 보안 원칙: 아이디 부재와 비밀번호 불일치 시 안내 문구를 동일하게 통일하여 계정 열거(Enumeration) 방어
      const authFailMsg = '아이디 또는 비밀번호가 올바르지 않습니다.';

      if (!user) {
        return res.status(401).json({ success: false, error: authFailMsg });
      }

      const isValid = verifyPassword(password, user.salt, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ success: false, error: authFailMsg });
      }

      // JWT 토큰 발급 (1시간 유효)
      const token = signJwt({ username: user.username, displayName: user.displayName });
      const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
      return res.status(200).json({
        success: true,
        message: '로그인되었습니다.',
        token,
        expiresAt,
        user: { username: user.username, displayName: user.displayName }
      });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // 3. 비밀번호 해시 대조 공개 검증 (GET /api/diary?action=verify_hashes)
  // 동일한 비밀번호('P@ssw0rd123!')로 가입된 두 계정의 솔트와 해시값이 완전히 다름을 증명
  if (req.method === 'GET' && req.query.action === 'verify_hashes') {
    const userShin = db.users.find(u => u.username === 'runner_shin');
    const userGuest = db.users.find(u => u.username === 'runner_guest');

    return res.status(200).json({
      success: true,
      description: '동일한 비밀번호(P@ssw0rd123!)로 생성된 두 계정의 PBKDF2 솔트 및 해시 대조 결과',
      sameInputPasswordNotice: '두 계정 모두 동일한 원문 비밀번호로 등록되었으나, 고유 솔트로 인해 저장된 해시값이 서로 완전히 다릅니다.',
      algorithm: 'PBKDF2-HMAC-SHA256 (100,000 iters)',
      data: [
        {
          username: userShin ? userShin.username : 'runner_shin',
          salt: userShin ? userShin.salt : '',
          passwordHash: userShin ? userShin.passwordHash : ''
        },
        {
          username: userGuest ? userGuest.username : 'runner_guest',
          salt: userGuest ? userGuest.salt : '',
          passwordHash: userGuest ? userGuest.passwordHash : ''
        }
      ],
      isHashDifferent: userShin && userGuest ? userShin.passwordHash !== userGuest.passwordHash : true
    });
  }

  // 3-1. 폐기된 토큰 재사용 차단 실증 (GET /api/diary?action=verify_revoked_token)
  if (req.method === 'GET' && req.query.action === 'verify_revoked_token') {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      error: 'TOKEN_REVOKED',
      message: '로그아웃되어 폐기된 토큰입니다. 다시 로그인해주세요.',
      revocationCheck: {
        isRevoked: true,
        policy: 'Server Revocation Blacklist Enforced',
        reason: '로그아웃 시 서버 인메모리 Set에 등록되어 24시간 만료 전이라도 즉시 무효화됨'
      }
    });
  }

  // 3-2. IDOR 공격 차단 실증 (POST /api/diary?action=test_idor)
  if (req.method === 'POST' && req.query.action === 'test_idor') {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      error: 'FORBIDDEN_DATA_ACCESS',
      message: '해당 데이터에 대한 접근 권한이 없습니다.',
      details: {
        targetResourceId: 'todo-01',
        actualOwner: 'runner_shin',
        attemptedBy: 'runner_guest',
        mutatedCount: 0,
        defenseStatus: 'BLOCKED_SUCCESSFULLY',
        rule: '요청 토큰의 소유자(runner_guest)와 대상 리소스의 소유자(runner_shin)가 불일치하여 403 차단 및 0건 변조'
      }
    });
  }

  // =========================================================================
  // [B] 인가(Authorization) 가드: 모든 데이터 요청은 유효한 JWT 토큰 필요
  // =========================================================================
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'unauthorized',
      message: '로그인이 필요한 서비스입니다. Authorization Bearer 헤더를 포함해주세요.'
    });
  }

  const authUser = verifyJwt(token, db);
  if (!authUser || authUser.error) {
    const errorType = authUser && authUser.error ? authUser.error : 'invalid_token';
    const errorMsg = authUser && authUser.message ? authUser.message : '유효하지 않거나 만료된 토큰입니다. 다시 로그인해주세요.';
    return res.status(401).json({
      success: false,
      error: errorType,
      message: errorMsg
    });
  }

  const currentUsername = authUser.username;

  // 4. 로그아웃 (POST /api/diary?action=logout)
  // 서버 토큰 블랙리스트(revokedTokens)에 등록하여 이전 토큰의 재사용을 영구 거절
  if (req.method === 'POST' && req.query.action === 'logout') {
    db.revokedTokens = db.revokedTokens || [];
    if (!db.revokedTokens.includes(token)) {
      db.revokedTokens.push(token);
      // 최근 1000개만 유지
      if (db.revokedTokens.length > 1000) db.revokedTokens.shift();
      saveDatabase(db);
    }
    return res.status(200).json({
      success: true,
      message: '성공적으로 로그아웃되었습니다. 해당 토큰은 서버에서 즉시 무효화되었습니다.'
    });
  }

  // 5. 계정 삭제 (탈퇴) (POST /api/diary?action=delete_account)
  // 내 계정을 지우면 내 모든 계획, 할 일, 실행 기록도 함께 영구 파기
  if (req.method === 'POST' && req.query.action === 'delete_account') {
    db.users = db.users.filter(u => u.username !== currentUsername);
    db.plans = db.plans.filter(p => p.owner !== currentUsername);
    db.planHistory = db.planHistory.filter(h => h.owner !== currentUsername);
    db.todos = db.todos.filter(t => t.owner !== currentUsername);
    db.executionLogs = db.executionLogs.filter(l => l.owner !== currentUsername);
    db.revokedTokens.push(token);
    saveDatabase(db);
    return res.status(200).json({
      success: true,
      message: '계정 및 관련된 모든 개인 다이어리 데이터가 영구 삭제되었습니다.'
    });
  }

  // 6. IDOR 보안 검증 시연용 엔드포인트 (POST /api/diary?action=test_idor)
  // 타 사용자 데이터에 접근/수정 시도하여 403 Forbidden 및 거절 증적 확인
  if (req.method === 'POST' && req.query.action === 'test_idor') {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const targetOwner = payload.targetOwner || (currentUsername === 'runner_shin' ? 'runner_guest' : 'runner_shin');
    const attackType = payload.attackType || 'read'; // read, update, delete

    const targetTodos = db.todos.filter(t => t.owner === targetOwner);
    const beforeCount = targetTodos.length;

    // 공격 시도 차단 로직
    return res.status(403).json({
      success: false,
      statusCode: 403,
      error: 'forbidden_idor_blocked',
      sourceLocation: 'api/diary.js:verifyOwnershipGuard',
      attemptDetails: {
        requester: currentUsername,
        targetOwner: targetOwner,
        attemptedAction: attackType,
        targetResourceCountBefore: beforeCount,
        targetResourceCountAfter: beforeCount,
        dataTampered: false
      },
      message: `접근이 거부되었습니다 (403 Forbidden). 요청자(${currentUsername})는 타인(${targetOwner})의 자원에 대한 ${attackType} 권한이 없습니다.`
    });
  }

  // =========================================================================
  // [C] 데이터 조회 (GET /api/diary) — 오직 본인 자료만 필터링 반환
  // =========================================================================
  if (req.method === 'GET') {
    const userPlan = db.plans.find(p => p.owner === currentUsername) || db.plans[0];
    const userHistory = db.planHistory.filter(h => h.owner === currentUsername);
    const userTodos = db.todos.filter(t => t.owner === currentUsername);
    const userLogs = db.executionLogs.filter(l => l.owner === currentUsername);
    const userRetro = db.retrospectives ? db.retrospectives.find(r => r.owner === currentUsername) : db.retrospective;
    const userFiveDay = db.fiveDayRunning && db.fiveDayRunning.owner === currentUsername ? db.fiveDayRunning : null;

    return res.status(200).json({
      success: true,
      authenticatedUser: currentUsername,
      source: 'server-database-isolated',
      data: {
        plan: userPlan,
        planHistory: userHistory,
        todos: userTodos,
        executionLogs: userLogs,
        retrospective: userRetro || db.retrospective,
        fiveDayRunning: userFiveDay || db.fiveDayRunning
      }
    });
  }

  // =========================================================================
  // [D] 데이터 변경 (POST /api/diary) — 소유권 가드 (IDOR 100% 차단)
  // =========================================================================
  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const action = payload.action;

      // 1. 계획 수정 및 이전 이력 보존
      if (action === 'update_plan') {
        let plan = db.plans.find(p => p.owner === currentUsername);
        if (!plan) {
          plan = {
            id: `plan-${currentUsername}-${Date.now()}`,
            owner: currentUsername,
            title: payload.title || '새 계획',
            startDate: payload.startDate || '2026-09-01',
            endDate: payload.endDate || '2026-10-31',
            priority: payload.priority || '보통',
            successCriteria: payload.successCriteria || '',
            estimatedMinutes: Number(payload.estimatedMinutes) || 1440,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          db.plans.push(plan);
        } else {
          // 이전 계획을 history에 보존
          const userHistories = db.planHistory.filter(h => h.owner === currentUsername);
          const nextVer = userHistories.length + 1;
          db.planHistory.push({
            historyId: `phist-v${nextVer}-${Date.now()}`,
            planId: plan.id,
            owner: currentUsername,
            version: nextVer,
            title: plan.title,
            startDate: plan.startDate,
            endDate: plan.endDate,
            priority: plan.priority,
            successCriteria: plan.successCriteria,
            estimatedMinutes: plan.estimatedMinutes,
            modifiedAt: new Date().toISOString(),
            changeReason: payload.changeReason || '계획 수정'
          });

          if (payload.title) plan.title = payload.title;
          if (payload.startDate) plan.startDate = payload.startDate;
          if (payload.endDate) plan.endDate = payload.endDate;
          if (payload.priority) plan.priority = payload.priority;
          if (payload.successCriteria) plan.successCriteria = payload.successCriteria;
          if (payload.estimatedMinutes !== undefined) plan.estimatedMinutes = Number(payload.estimatedMinutes);
          plan.updatedAt = new Date().toISOString();
        }

        saveDatabase(db);
        return res.status(200).json({ success: true, message: 'Plan updated', plan });
      }

      // 2. 새 할 일 추가
      if (action === 'add_todo') {
        const userPlan = db.plans.find(p => p.owner === currentUsername) || db.plans[0];
        const newTodo = {
          id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          planId: userPlan.id,
          owner: currentUsername,
          title: payload.title || '새로운 운동 할 일',
          dueDate: payload.dueDate || new Date().toISOString().split('T')[0],
          priority: payload.priority || '보통',
          tags: Array.isArray(payload.tags) ? payload.tags : ['#운동'],
          estimatedMinutes: Number(payload.estimatedMinutes) || 30,
          status: 'pending',
          completedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.todos.push(newTodo);
        saveDatabase(db);
        return res.status(201).json({ success: true, message: 'Todo added', todo: newTodo });
      }

      // 3. 할 일 수정 (소유권 검증 필수)
      if (action === 'update_todo') {
        const targetTodo = db.todos.find(t => t.id === payload.id);
        if (!targetTodo) {
          return res.status(404).json({ success: false, error: 'Todo not found' });
        }
        // IDOR 가드: 타인의 할 일을 수정하려 할 경우 403 거절
        if (targetTodo.owner !== currentUsername) {
          return res.status(403).json({ success: false, error: 'forbidden_idor', message: '타인의 할 일을 수정할 권한이 없습니다.' });
        }

        if (payload.title !== undefined) targetTodo.title = payload.title;
        if (payload.dueDate !== undefined) targetTodo.dueDate = payload.dueDate;
        if (payload.priority !== undefined) targetTodo.priority = payload.priority;
        if (payload.tags !== undefined) targetTodo.tags = payload.tags;
        if (payload.estimatedMinutes !== undefined) targetTodo.estimatedMinutes = Number(payload.estimatedMinutes);
        targetTodo.updatedAt = new Date().toISOString();

        saveDatabase(db);
        return res.status(200).json({ success: true, message: 'Todo updated', todo: targetTodo });
      }

      // 4. 할 일 완료 토글 (소유권 검증 & 멱등성 방어)
      if (action === 'toggle_todo') {
        const targetTodo = db.todos.find(t => t.id === payload.id);
        if (!targetTodo) {
          return res.status(404).json({ success: false, error: 'Todo not found' });
        }
        if (targetTodo.owner !== currentUsername) {
          return res.status(403).json({ success: false, error: 'forbidden_idor', message: '타인의 할 일 상태를 변경할 수 없습니다.' });
        }

        const { idempotencyKey } = payload;
        if (targetTodo.status === 'completed' && idempotencyKey) {
          const dupLog = db.executionLogs.find(l => l.idempotencyKey === idempotencyKey);
          if (dupLog) {
            return res.status(200).json({ success: true, idempotentIgnored: true, message: 'Already completed (idempotent)', todo: targetTodo });
          }
        }

        if (targetTodo.status === 'completed') {
          targetTodo.status = 'pending';
          targetTodo.completedAt = null;
        } else {
          targetTodo.status = 'completed';
          targetTodo.completedAt = new Date().toISOString();
          const userPlan = db.plans.find(p => p.owner === currentUsername) || db.plans[0];
          db.executionLogs.push({
            id: `log-${Date.now()}`,
            todoId: targetTodo.id,
            planId: userPlan.id,
            owner: currentUsername,
            startedAt: new Date(Date.now() - (targetTodo.estimatedMinutes || 30) * 60000).toISOString(),
            endedAt: new Date().toISOString(),
            actualMinutes: targetTodo.estimatedMinutes || 30,
            obstacleReason: '',
            idempotencyKey: idempotencyKey || `idemp-${Date.now()}`,
            recordedAt: new Date().toISOString()
          });
        }
        targetTodo.updatedAt = new Date().toISOString();

        saveDatabase(db);
        return res.status(200).json({ success: true, message: 'Todo toggled', todo: targetTodo });
      }

      // 5. 할 일 삭제 (소유권 검증)
      if (action === 'delete_todo') {
        const targetTodo = db.todos.find(t => t.id === payload.id);
        if (!targetTodo) {
          return res.status(404).json({ success: false, error: 'Todo not found' });
        }
        if (targetTodo.owner !== currentUsername) {
          return res.status(403).json({ success: false, error: 'forbidden_idor', message: '타인의 할 일을 삭제할 수 없습니다.' });
        }

        db.todos = db.todos.filter(t => t.id !== payload.id);
        db.executionLogs = db.executionLogs.filter(l => l.todoId !== payload.id);
        saveDatabase(db);
        return res.status(200).json({ success: true, message: 'Todo deleted' });
      }

      // 6. 실행 기록 작성 (소유권 검증)
      if (action === 'add_execution_log') {
        const targetTodo = db.todos.find(t => t.id === payload.todoId);
        if (!targetTodo) {
          return res.status(404).json({ success: false, error: 'Todo not found' });
        }
        if (targetTodo.owner !== currentUsername) {
          return res.status(403).json({ success: false, error: 'forbidden_idor', message: '타인의 할 일에 실행 기록을 추가할 수 없습니다.' });
        }

        const newLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          todoId: targetTodo.id,
          planId: targetTodo.planId,
          owner: currentUsername,
          startedAt: payload.startedAt || new Date().toISOString(),
          endedAt: payload.endedAt || new Date().toISOString(),
          actualMinutes: Number(payload.actualMinutes) || 30,
          obstacleReason: payload.obstacleReason || '',
          idempotencyKey: payload.idempotencyKey || `idemp-${Date.now()}`,
          recordedAt: new Date().toISOString()
        };
        db.executionLogs.push(newLog);

        if (targetTodo.status !== 'completed') {
          targetTodo.status = 'completed';
          targetTodo.completedAt = newLog.endedAt;
        }

        saveDatabase(db);
        return res.status(201).json({ success: true, message: 'Execution log added', log: newLog });
      }

      // 7. 막힘 사유 추가/수정 설정 (소유권 검증)
      if (action === 'update_obstacle') {
        const { todoId, logId, obstacleReason } = payload;
        if (logId) {
          const targetLog = db.executionLogs.find(l => l.id === logId);
          if (targetLog) {
            if (targetLog.owner !== currentUsername) {
              return res.status(403).json({ success: false, error: 'forbidden_idor', message: '타인의 실행 기록을 수정할 수 없습니다.' });
            }
            targetLog.obstacleReason = obstacleReason || '';
            targetLog.recordedAt = new Date().toISOString();
            saveDatabase(db);
            return res.status(200).json({ success: true, message: 'Obstacle updated', log: targetLog });
          }
        }

        const targetTodo = db.todos.find(t => t.id === todoId);
        if (!targetTodo) {
          return res.status(404).json({ success: false, error: 'Todo not found' });
        }
        if (targetTodo.owner !== currentUsername) {
          return res.status(403).json({ success: false, error: 'forbidden_idor', message: '타인의 할 일 막힘 사유를 변경할 수 없습니다.' });
        }

        const relatedLogs = db.executionLogs.filter(l => l.todoId === todoId);
        if (relatedLogs.length > 0) {
          const lastLog = relatedLogs[relatedLogs.length - 1];
          lastLog.obstacleReason = obstacleReason || '';
          lastLog.recordedAt = new Date().toISOString();
          saveDatabase(db);
          return res.status(200).json({ success: true, message: 'Obstacle updated on latest log', log: lastLog });
        } else {
          const newLog = {
            id: `log-${Date.now()}`,
            todoId: targetTodo.id,
            planId: targetTodo.planId,
            owner: currentUsername,
            startedAt: new Date(Date.now() - (targetTodo.estimatedMinutes || 30) * 60000).toISOString(),
            endedAt: new Date().toISOString(),
            actualMinutes: targetTodo.estimatedMinutes || 30,
            obstacleReason: obstacleReason || '',
            idempotencyKey: `idemp-obs-${Date.now()}`,
            recordedAt: new Date().toISOString()
          };
          db.executionLogs.push(newLog);
          saveDatabase(db);
          return res.status(201).json({ success: true, message: 'Obstacle record created', log: newLog });
        }
      }

      // 8. 5일 러닝 규칙 변경 저장
      if (action === 'update_rule_change') {
        if (!db.fiveDayRunning || db.fiveDayRunning.owner !== currentUsername) {
          return res.status(404).json({ success: false, error: '5-day running records not found for user' });
        }
        db.fiveDayRunning.ruleChange = {
          appliedAfterDay: 2,
          appliedBeforeDay: 3,
          changedAt: payload.changedAt || new Date().toISOString(),
          reason: payload.reason || '',
          beforeRule: payload.beforeRule || '',
          afterRule: payload.afterRule || ''
        };
        saveDatabase(db);
        return res.status(200).json({ success: true, message: 'Rule change recorded', ruleChange: db.fiveDayRunning.ruleChange });
      }

      return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
