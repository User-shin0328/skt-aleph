// Vercel Serverless Function: 플랜두씨 다이어리 서버 데이터베이스 REST API
// 계약 규약: contracts/pds-schema-v2.json 준수 (시간대: Asia/Seoul, 단위: minute)

const fs = require('fs');
const path = require('path');

const DB_FILE_PATH = path.join('/tmp', 'pds_database.json');

// 초기 정품 운동 데이터셋 (실제 하반기 마라톤 & 코어 강화 프로젝트)
function getInitialDataset() {
  return {
    version: '2.0.0',
    meta: {
      owner: '신재원',
      timezone: 'Asia/Seoul',
      databaseEngine: 'server-db-pds-v2',
      updatedAt: new Date().toISOString()
    },
    plan: {
      id: 'plan-running-2026-h2',
      title: '2026 하반기 러닝 페이스 단축 & 코어 강화 프로젝트',
      startDate: '2026-09-01',
      endDate: '2026-10-31',
      priority: '높음',
      successCriteria: '10km 52분 이내 완주 & 주 4회 러닝/보강운동 달성 (누적 40회)',
      estimatedMinutes: 2880,
      createdAt: '2026-09-01T09:00:00+09:00',
      updatedAt: '2026-09-05T10:00:00+09:00'
    },
    planHistory: [
      {
        historyId: 'phist-v1-initial',
        planId: 'plan-running-2026-h2',
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
        title: '토요일 갑천 12km 지속주 LSD 러닝',
        dueDate: '2026-09-14', // 서울 KST 2026-09-18 기준 미완료 지연 건
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
        title: '일요일 폼롤러 전신 스트레칭 & 족욕',
        dueDate: '2026-09-20',
        priority: '낮음',
        tags: ['#리커버리', '#스트레칭', '#회복'],
        estimatedMinutes: 40,
        status: 'pending',
        completedAt: null,
        createdAt: '2026-09-01T09:30:00+09:00',
        updatedAt: '2026-09-01T09:30:00+09:00'
      }
    ],
    executionLogs: [
      {
        id: 'log-01',
        todoId: 'todo-01',
        planId: 'plan-running-2026-h2',
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
      period: '2026년 9월 3주차 종합 분석',
      nextImprovementPoint: '주중 인터벌 훈련 전후 15분 동적 웜업/쿨다운 필수 배정 및 주말 갑천 LSD 러닝 일정 수요일 사전 리마인드',
      updatedAt: '2026-09-18T09:00:00+09:00'
    }
  };
}

// 데이터 읽기 헬퍼
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.plan && Array.isArray(data.todos)) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Database load error, fallback to initial dataset:', e.message);
  }
  const initial = getInitialDataset();
  saveDatabase(initial);
  return initial;
}

// 데이터 저장 헬퍼
function saveDatabase(data) {
  try {
    data.meta = data.meta || {};
    data.meta.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.warn('Database save warning (ephemeral serverless environment):', e.message);
    return false;
  }
}

// 서버리스 요청 핸들러
module.exports = async function handler(req, res) {
  // CORS 및 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Idempotency-Key');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('x-server-database', 'pds-sqlite-v2');
  res.setHeader('x-server-timezone', 'Asia/Seoul');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let db = loadDatabase();

  // GET: 전체 데이터베이스 조회
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      source: 'server-database',
      data: db
    });
  }

  // POST: 데이터 변경 및 동기화
  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const action = payload.action || 'sync_all';

      // 1. 계획 수정 및 이전 이력 보존
      if (action === 'update_plan') {
        const { title, startDate, endDate, priority, successCriteria, estimatedMinutes, changeReason } = payload;
        
        // 이전 계획을 planHistory에 버전 번호 매겨 보존
        const currentVersion = (db.planHistory.length || 0) + 1;
        db.planHistory.push({
          historyId: `phist-v${currentVersion}-${Date.now()}`,
          planId: db.plan.id,
          version: currentVersion,
          title: db.plan.title,
          startDate: db.plan.startDate,
          endDate: db.plan.endDate,
          priority: db.plan.priority,
          successCriteria: db.plan.successCriteria,
          estimatedMinutes: db.plan.estimatedMinutes,
          modifiedAt: new Date().toISOString(),
          changeReason: changeReason || '계획 주기 목표치 보정 및 세부 일정 조정'
        });

        // 현재 계획 갱신 (ID는 불변 유지)
        if (title) db.plan.title = title;
        if (startDate) db.plan.startDate = startDate;
        if (endDate) db.plan.endDate = endDate;
        if (priority) db.plan.priority = priority;
        if (successCriteria) db.plan.successCriteria = successCriteria;
        if (estimatedMinutes !== undefined) db.plan.estimatedMinutes = Number(estimatedMinutes);
        db.plan.updatedAt = new Date().toISOString();

        saveDatabase(db);
        return res.status(200).json({ success: true, message: 'Plan updated and history saved', data: db });
      }

      // 2. 새 할 일 추가
      if (action === 'add_todo') {
        const { title, dueDate, priority, tags, estimatedMinutes } = payload;
        const newTodo = {
          id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          planId: db.plan.id,
          title: title || '새로운 운동 할 일',
          dueDate: dueDate || new Date().toISOString().split('T')[0],
          priority: priority || '보통',
          tags: Array.isArray(tags) ? tags : ['#운동'],
          estimatedMinutes: Number(estimatedMinutes) || 30,
          status: 'pending',
          completedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.todos.push(newTodo);
        saveDatabase(db);
        return res.status(201).json({ success: true, message: 'Todo added', todo: newTodo, data: db });
      }

      // 3. 할 일 수정
      if (action === 'update_todo') {
        const { id, title, dueDate, priority, tags, estimatedMinutes } = payload;
        const todo = db.todos.find(t => t.id === id);
        if (!todo) {
          return res.status(404).json({ success: false, error: 'Todo not found' });
        }
        if (title !== undefined) todo.title = title;
        if (dueDate !== undefined) todo.dueDate = dueDate;
        if (priority !== undefined) todo.priority = priority;
        if (tags !== undefined) todo.tags = tags;
        if (estimatedMinutes !== undefined) todo.estimatedMinutes = Number(estimatedMinutes);
        todo.updatedAt = new Date().toISOString();

        saveDatabase(db);
        return res.status(200).json({ success: true, message: 'Todo updated', todo, data: db });
      }

      // 4. 할 일 완료 상태 토글 (중복 완료 방어 Idempotency 구현)
      if (action === 'toggle_todo') {
        const { id, idempotencyKey } = payload;
        const todo = db.todos.find(t => t.id === id);
        if (!todo) {
          return res.status(404).json({ success: false, error: 'Todo not found' });
        }

        // 중복 방어: 이미 완료 상태이고 동일한 idempotencyKey가 최근 실행로그에 존재하면 추가 누적 없이 200 반환
        if (todo.status === 'completed' && idempotencyKey) {
          const existingLog = db.executionLogs.find(l => l.idempotencyKey === idempotencyKey);
          if (existingLog) {
            return res.status(200).json({
              success: true,
              idempotentIgnored: true,
              message: 'Already completed with this idempotency key (duplicate ignored)',
              data: db
            });
          }
        }

        if (todo.status === 'completed') {
          // 완료 -> 진행 중으로 되돌리기
          todo.status = 'pending';
          todo.completedAt = null;
        } else {
          // 진행 중 -> 완료
          todo.status = 'completed';
          todo.completedAt = new Date().toISOString();

          // 기본 실행로그 1건 자동 생성 (중복 방어 키 포함)
          const newLog = {
            id: `log-${Date.now()}`,
            todoId: todo.id,
            planId: db.plan.id,
            startedAt: new Date(Date.now() - (todo.estimatedMinutes || 30) * 60000).toISOString(),
            endedAt: new Date().toISOString(),
            actualMinutes: todo.estimatedMinutes || 30,
            obstacleReason: '',
            idempotencyKey: idempotencyKey || `idemp-${Date.now()}`,
            recordedAt: new Date().toISOString()
          };
          db.executionLogs.push(newLog);
        }
        todo.updatedAt = new Date().toISOString();

        saveDatabase(db);
        return res.status(200).json({ success: true, message: 'Todo toggled', todo, data: db });
      }

      // 5. 할 일 삭제
      if (action === 'delete_todo') {
        const { id } = payload;
        db.todos = db.todos.filter(t => t.id !== id);
        db.executionLogs = db.executionLogs.filter(l => l.todoId !== id);
        saveDatabase(db);
        return res.status(200).json({ success: true, message: 'Todo deleted', data: db });
      }

      // 6. 실행 기록 작성 (원래 계획 값 덮어쓰지 않고 독립 보존)
      if (action === 'add_execution_log') {
        const { todoId, startedAt, endedAt, actualMinutes, obstacleReason, idempotencyKey } = payload;
        const targetTodo = db.todos.find(t => t.id === todoId);
        if (!targetTodo) {
          return res.status(404).json({ success: false, error: 'Target todo not found' });
        }

        // 중복 방어
        if (idempotencyKey) {
          const dup = db.executionLogs.find(l => l.idempotencyKey === idempotencyKey);
          if (dup) {
            return res.status(200).json({ success: true, idempotentIgnored: true, message: 'Duplicate log ignored', data: db });
          }
        }

        const newLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          todoId: targetTodo.id,
          planId: db.plan.id,
          startedAt: startedAt || new Date().toISOString(),
          endedAt: endedAt || new Date().toISOString(),
          actualMinutes: Number(actualMinutes) || 30,
          obstacleReason: obstacleReason || '',
          idempotencyKey: idempotencyKey || `idemp-${Date.now()}`,
          recordedAt: new Date().toISOString()
        };

        db.executionLogs.push(newLog);
        // 완료 상태로 자동 변경
        if (targetTodo.status !== 'completed') {
          targetTodo.status = 'completed';
          targetTodo.completedAt = endedAt || new Date().toISOString();
        }

        saveDatabase(db);
        return res.status(201).json({ success: true, message: 'Execution log added', log: newLog, data: db });
      }

      // 6-1. 막힘 기록(장애 요인) 추가 및 수정 설정
      if (action === 'update_obstacle') {
        const { todoId, logId, obstacleReason } = payload;
        
        if (logId) {
          const targetLog = db.executionLogs.find(l => l.id === logId);
          if (targetLog) {
            targetLog.obstacleReason = obstacleReason || '';
            targetLog.recordedAt = new Date().toISOString();
            saveDatabase(db);
            return res.status(200).json({ success: true, message: 'Obstacle log updated', log: targetLog, data: db });
          }
        }

        const targetTodo = db.todos.find(t => t.id === todoId);
        if (!targetTodo) {
          return res.status(404).json({ success: false, error: 'Todo not found' });
        }

        const relatedLogs = db.executionLogs.filter(l => l.todoId === todoId);
        if (relatedLogs.length > 0) {
          const lastLog = relatedLogs[relatedLogs.length - 1];
          lastLog.obstacleReason = obstacleReason || '';
          lastLog.recordedAt = new Date().toISOString();
          saveDatabase(db);
          return res.status(200).json({ success: true, message: 'Obstacle reason updated on latest log', log: lastLog, data: db });
        } else {
          const newLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            todoId: targetTodo.id,
            planId: db.plan.id,
            startedAt: new Date(Date.now() - (targetTodo.estimatedMinutes || 30) * 60000).toISOString(),
            endedAt: new Date().toISOString(),
            actualMinutes: targetTodo.estimatedMinutes || 30,
            obstacleReason: obstacleReason || '',
            idempotencyKey: `idemp-obs-${Date.now()}`,
            recordedAt: new Date().toISOString()
          };
          db.executionLogs.push(newLog);
          saveDatabase(db);
          return res.status(201).json({ success: true, message: 'Obstacle record created', log: newLog, data: db });
        }
      }

      // 7. 돌아보기 개선점 업데이트
      if (action === 'update_retro_feedback') {
        const { nextImprovementPoint } = payload;
        db.retrospective = db.retrospective || {};
        db.retrospective.nextImprovementPoint = nextImprovementPoint || '';
        db.retrospective.updatedAt = new Date().toISOString();
        saveDatabase(db);
        return res.status(200).json({ success: true, message: 'Retro feedback updated', data: db });
      }

      // 8. 전체 상태 동기화 (클라이언트 캐시 복원 등)
      if (action === 'sync_all') {
        if (payload.data && payload.data.plan && Array.isArray(payload.data.todos)) {
          db = payload.data;
          saveDatabase(db);
        }
        return res.status(200).json({ success: true, message: 'Synced with server', data: db });
      }

      // 9. 초기 데이터로 리셋
      if (action === 'reset_initial') {
        db = getInitialDataset();
        saveDatabase(db);
        return res.status(200).json({ success: true, message: 'Reset to initial dataset', data: db });
      }

      return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
