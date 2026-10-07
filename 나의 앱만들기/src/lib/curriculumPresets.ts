import { CurriculumPreset } from './types';

export const CURRICULUM_PRESETS: CurriculumPreset[] = [
  {
    id: 'eip',
    title: '정보처리기사 (EIP)',
    description: '국가공인 IT 대표 자격증 (5개 과목 완벽 대비)',
    defaultDailyHours: 3.0,
    subjects: [
      {
        name: '소프트웨어 설계',
        color: '#3B82F6', // Blue
        chapters: [
          {
            title: '요구사항 확인',
            keyPoints: ['유스케이스 모델링', '요구사항 도출/분석/명세/확인 절차', 'UML 다이어그램 분류']
          },
          {
            title: '화면 설계 및 UI 프로토타이핑',
            keyPoints: ['UI 설계 4대 원칙(직관성/유효성/학습성/유연성)', '와이어프레임 vs 스토리보드']
          },
          {
            title: '애플리케이션 설계 및 아키텍처 패턴',
            keyPoints: ['MVC 패턴', '모듈 독립성(결합도 낮춤, 응집도 높임)', 'GoF 디자인 패턴(생성/구조/행위)']
          },
          {
            title: '인터페이스 설계',
            keyPoints: ['송수신 데이터 식별', 'JSON, XML 데이터 포맷', 'REST API 명세서']
          }
        ]
      },
      {
        name: '소프트웨어 개발',
        color: '#8B5CF6', // Purple
        chapters: [
          {
            title: '데이터 입출력 및 자료구조',
            keyPoints: ['트리 순회(전위/중위/후위)', '정렬 알고리즘(퀵/병합/힙 정렬 시간복잡도)']
          },
          {
            title: '통합 구현 및 연계 메커니즘',
            keyPoints: ['EAI/ESB 연계 아키텍처', 'Web Service (SOAP, WSDL, UDDI)']
          },
          {
            title: '제품 소프트웨어 패키징 및 형상 관리',
            keyPoints: ['형상 관리 4단계(식별/통제/감사/기록)', 'Git 브랜치 전략', 'DRM 라이선스']
          },
          {
            title: '애플리케이션 테스트 관리',
            keyPoints: ['화이트박스(기저경로, 제어흐름)', '블랙박스(동등분할, 경계값)', '단위-통합-시스템-인수']
          }
        ]
      },
      {
        name: '데이터베이스 구축',
        color: '#10B981', // Emerald
        chapters: [
          {
            title: 'SQL 응용 및 DDL/DML/DCL',
            keyPoints: ['SELECT 서브쿼리 및 그룹함수', 'JOIN(INNER, OUTER, CROSS)', 'GRANT/REVOKE 권한']
          },
          {
            title: 'SQL 활용 및 트랜잭션 특성',
            keyPoints: ['ACID 원칙(원자성/일관성/격리성/영속성)', '트랜잭션 격리수준', '교착상태(Deadlock)']
          },
          {
            title: '물리 데이터베이스 설계 및 인덱스',
            keyPoints: ['B-Tree 인덱스 구조', '반정규화(역정규화) 기법', '파티셔닝(Range, Hash)']
          },
          {
            title: '데이터 전환 및 정규화 이론',
            keyPoints: ['1정규형(원자값) ~ BCNF(결정자 함수종속)', '무손실 분해', '이상현상(삽입/삭제/갱신)']
          }
        ]
      },
      {
        name: '프로그래밍 언어 활용',
        color: '#F59E0B', // Amber
        chapters: [
          {
            title: 'C/C++ 포인터 및 메모리 구조',
            keyPoints: ['포인터 연산 및 배열 관계', '구조체와 malloc 동적할당', '스택 vs 힙 메모리']
          },
          {
            title: 'Java 객체지향 4대 특징',
            keyPoints: ['캡슐화, 상속, 다형성(오버로딩/오버라이딩), 추상화', '인터페이스 vs 추상클래스']
          },
          {
            title: 'Python 기초 및 스크립트 활용',
            keyPoints: ['리스트 컴프리헨션', '슬라이싱 및 딕셔너리', '람다 표현식']
          },
          {
            title: '운영체제 및 기본 명령어',
            keyPoints: ['스케줄링 알고리즘(FCFS, SJF, RR)', '페이징 가상메모리(FIFO, LRU)', 'Linux 권한 chmod']
          }
        ]
      },
      {
        name: '정보시스템 구축관리',
        color: '#EC4899', // Pink
        chapters: [
          {
            title: '소프트웨어 개발 보안 구축',
            keyPoints: ['SQL 인젝션 및 XSS 방어', '시큐어 코딩 가이드', '암호화 알고리즘(AES, RSA, SHA-256)']
          },
          {
            title: 'IT 프로젝트 시스템 구축 관리',
            keyPoints: ['네트워크 보안 솔루션(방화벽, IDS, IPS)', '클라우드 컴퓨팅(IaaS, PaaS, SaaS)']
          },
          {
            title: '소프트웨어 개발 방법론 및 테일러링',
            keyPoints: ['애자일(스크럼, 칸반, XP 5가지 가치)', '비용산정 모델(COCOMO, 기능점수 FP)']
          }
        ]
      }
    ]
  },
  {
    id: 'sqld',
    title: 'SQL 개발자 (SQLD)',
    description: '국가공인 데이터베이스 SQL 실무 자격증',
    defaultDailyHours: 2.5,
    subjects: [
      {
        name: '데이터 모델링의 이해',
        color: '#6366F1', // Indigo
        chapters: [
          {
            title: '데이터 모델과 성능',
            keyPoints: ['3단계 스키마(외부, 개념, 내부)', 'ERD 작성 표준', '주식별자/외래식별자 도출']
          },
          {
            title: '정규화와 성능 최적화',
            keyPoints: ['1NF ~ 3NF 및 BCNF 분해', '반정규화 기법과 주의점']
          }
        ]
      },
      {
        name: 'SQL 기본 및 활용',
        color: '#14B8A6', // Teal
        chapters: [
          {
            title: 'SQL DDL / DML / TCL 핵심',
            keyPoints: ['NULL의 특성과 연산', 'WHERE 조건절 연산자 우선순위', 'COMMIT & ROLLBACK']
          },
          {
            title: 'SQL 서브쿼리 및 고급 조인',
            keyPoints: ['스칼라 서브쿼리, 인라인 뷰, 상관 서브쿼리', 'NATURAL JOIN, USING절']
          },
          {
            title: '윈도우 함수 및 계층형 질의',
            keyPoints: ['ROW_NUMBER, RANK, DENSE_RANK', 'LEAD, LAG', 'START WITH ... CONNECT BY PRIOR']
          }
        ]
      }
    ]
  },
  {
    id: 'net2',
    title: '네트워크관리사 2급',
    description: '네트워크 구축 및 서버 운용 공인 자격증',
    defaultDailyHours: 2.0,
    subjects: [
      {
        name: '네트워크 일반 & TCP/IP',
        color: '#06B6D4', // Cyan
        chapters: [
          {
            title: 'OSI 7계층 및 프로토콜',
            keyPoints: ['TCP 3-Way Handshake', 'UDP 헤더 구조', 'IP 서브넷 마스킹 계산법']
          },
          {
            title: 'IP 주소 체계와 서브네팅',
            keyPoints: ['IPv4 클래스 분류', 'VLSM 서브네팅', 'IPv6 구조 및 특징']
          }
        ]
      },
      {
        name: 'NOS & 네트워크 운용기기',
        color: '#84CC16', // Lime
        chapters: [
          {
            title: 'Windows Server / Linux 운용',
            keyPoints: ['Active Directory', 'DNS, DHCP, IIS 서버 구축', 'Linux 기본 명령어 및 vi 에디터']
          },
          {
            title: '라우터 설정 및 스위칭',
            keyPoints: ['라우터 기본 모드(User, Privileged, Config)', 'VLAN 및 트렁킹', '정적 라우팅 설정']
          }
        ]
      }
    ]
  }
];

export function getSubjectColor(subjectName: string): string {
  const match = CURRICULUM_PRESETS.flatMap(p => p.subjects).find(s => s.name === subjectName);
  if (match) return match.color;

  // 기본 해시 컬러
  const defaultColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#14B8A6'];
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return defaultColors[Math.abs(hash) % defaultColors.length];
}
