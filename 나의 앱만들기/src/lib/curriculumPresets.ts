import { CurriculumPreset } from './types';

export const CURRICULUM_PRESETS: CurriculumPreset[] = [
  // ============================================================================
  // 1. 정보처리기사 (Engineer Information Processing)
  // ============================================================================
  {
    id: 'eip',
    title: '정보처리기사 (EIP)',
    category: 'IT · 소프트웨어',
    description: '국가공인 IT 대표 자격증 (NCS 기반 5개 과목 정밀 대비)',
    passCriteria: '과목당 40점 이상(과락 방지), 5과목 평균 60점 이상 합격',
    defaultDailyHours: 3.0,
    subjects: [
      {
        name: '소프트웨어 설계',
        color: '#3B82F6', // Blue
        chapters: [
          {
            title: '요구사항 확인 및 UML 모델링',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['유스케이스 다이어그램', '요구사항 도출/분석/명세/확인 절차', '구조적/행위 다이어그램 분류']
          },
          {
            title: '화면 설계 및 UI 아키텍처',
            difficulty: '하',
            frequency: 3,
            keyPoints: ['UI 설계 4대 원칙(직관성/유효성/학습성/유연성)', '와이어프레임 vs 프로토타입 vs 스토리보드']
          },
          {
            title: '애플리케이션 설계 및 GoF 디자인 패턴',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['모듈 결합도(낮을수록 우수) & 응집도(높을수록 우수)', 'GoF 23가지 디자인 패턴(생성/구조/행위)', 'MVC 아키텍처 패턴']
          },
          {
            title: '인터페이스 설계 및 통신 연계',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['JSON, XML 데이터 포맷', 'RESTful API 명세서 작성', '송수신 데이터 식별 및 보안']
          }
        ]
      },
      {
        name: '소프트웨어 개발',
        color: '#8B5CF6', // Purple
        chapters: [
          {
            title: '데이터 입출력 구현 및 자료구조',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['트리 순회(전위/중위/후위 순회)', '정렬 알고리즘 시간복잡도(퀵/병합/힙 정렬 O(N log N))', '스택/큐 연산']
          },
          {
            title: '통합 구현 및 연계 메커니즘',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['EAI/ESB 연계 아키텍처 방식', '웹 서비스(SOAP, WSDL, UDDI)', 'AJAX 비동기 통신']
          },
          {
            title: '제품 소프트웨어 패키징 및 형상 관리',
            difficulty: '하',
            frequency: 3,
            keyPoints: ['형상 관리 4단계(식별/통제/감사/기록)', 'Git 브랜치 전략', '빌드 자동화 도구(Gradle, Maven)', 'DRM 기술']
          },
          {
            title: '애플리케이션 테스트 관리',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['화이트박스(기저경로, 제어흐름)', '블랙박스(동등분할, 경계값 분석)', '테스트 레벨(단위-통합-시스템-인수)', '맥케이브 순환 복잡도']
          }
        ]
      },
      {
        name: '데이터베이스 구축',
        color: '#10B981', // Emerald
        chapters: [
          {
            title: 'SQL DDL / DML / DCL 기본 및 응용',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['SELECT 서브쿼리 및 그룹함수(HAVING)', 'JOIN(INNER, OUTER, CROSS)', 'GRANT/REVOKE 권한 부여']
          },
          {
            title: 'SQL 고급 활용 및 트랜잭션',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['ACID 원칙(원자성/일관성/격리성/영속성)', '트랜잭션 격리수준 4단계', '교착상태(Deadlock) 해결', '윈도우 함수']
          },
          {
            title: '물리 데이터베이스 설계 및 인덱스',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['B-Tree 인덱스 구조 및 클러스터드 인덱스', '반정규화(역정규화) 기법', '테이블 파티셔닝(Range, Hash)']
          },
          {
            title: '정규화 이론 및 관계 데이터 모델',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['1정규형(원자값) ~ BCNF(결정자 함수종속)', '무손실 분해 조건', '데이터 이상현상(삽입/삭제/갱신 이상)']
          }
        ]
      },
      {
        name: '프로그래밍 언어 활용',
        color: '#F59E0B', // Amber
        chapters: [
          {
            title: 'C언어 포인터 및 메모리 구조',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['포인터 변수 연산 및 2차원 배열 포인터', '구조체와 malloc/free 동적할당', '스택 vs 힙 메모리 영역']
          },
          {
            title: 'Java 객체지향 및 예외 처리',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['캡슐화, 상속, 다형성(오버로딩/오버라이딩), 추상화', '인터페이스 vs 추상클래스', 'try-catch-finally']
          },
          {
            title: 'Python 기초 및 스크립트 활용',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['리스트 컴프리헨션', '슬라이싱 및 딕셔너리', '람다(lambda) 표현식', '정규표현식']
          },
          {
            title: '운영체제 스케줄링 및 가상메모리',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['프로세스 스케줄링(FCFS, SJF, RR, HRN 우선순위)', '가상메모리 페이지 교체(FIFO, LRU, LFU)', '페이징 vs 세그멘테이션']
          }
        ]
      },
      {
        name: '정보시스템 구축관리',
        color: '#EC4899', // Pink
        chapters: [
          {
            title: '소프트웨어 개발 보안 구축',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['SQL 인젝션, XSS, CSRF 공격 및 방어', '시큐어 코딩 7대 보안 약점', '대칭키/비대칭키 암호화(AES, RSA, SHA-256)']
          },
          {
            title: 'IT 프로젝트 보안 및 인프라 관리',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['네트워크 보안 장비(방화벽, IDS, IPS)', '클라우드 서비스(IaaS, PaaS, SaaS)', 'DoS/DDoS 공격 기법']
          },
          {
            title: '소프트웨어 개발 방법론 및 비용 산정',
            difficulty: '하',
            frequency: 3,
            keyPoints: ['애자일(스크럼, 칸반, XP)', '비용산정 모델(COCOMO, 기능점수 FP, LOC)', '테일러링 기법']
          }
        ]
      }
    ]
  },

  // ============================================================================
  // 2. 정보보안기사 (Engineer Information Security)
  // ============================================================================
  {
    id: 'sec',
    title: '정보보안기사 (Sec)',
    category: '정보보안 · 네트워크',
    description: '사이버 보안 최고 권위 국가기술자격 (시스템·네트워크·앱·암호학 총망라)',
    passCriteria: '과목당 40점 이상, 5과목 평균 60점 이상 합격',
    defaultDailyHours: 3.5,
    subjects: [
      {
        name: '시스템 보안',
        color: '#EF4444', // Red
        chapters: [
          {
            title: '운영체제 구조 및 계정/권한 관리',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['Linux /etc/passwd, /etc/shadow 구조', 'SetUID/SetGID 권한과 Sticky Bit', 'Windows SAM 및 접근제어']
          },
          {
            title: '서버 보안 위협 및 침해사고 분석',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['버퍼 오버플로우(BoF) 및 ASLR, DEP 방어', '레이스 컨디션 및 포맷 스트링', '루트킷 및 백도어 탐지']
          },
          {
            title: '시스템 로그 분석 및 침해 감사',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['wtmp, utmp, btmp, lastlog, secure 로그 분석', 'syslog 및 rsyslog 설정', 'Windows 이벤트 로그 감사']
          },
          {
            title: '스토리지 보안 및 가상화 인프라',
            difficulty: '하',
            frequency: 3,
            keyPoints: ['RAID 레벨별 특징(RAID 0, 1, 5, 6)', '클라우드 하이퍼바이저 격리', '도커 컨테이너 보안']
          }
        ]
      },
      {
        name: '네트워크 보안',
        color: '#F97316', // Orange
        chapters: [
          {
            title: 'TCP/IP 프로토콜 취약점 분석',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['TCP 3-Way Handshake 및 SYN Flooding', 'IP 스푸핑, ARP 스푸핑, DNS 스푸핑', 'ICMP Smurf 및 Teardrop']
          },
          {
            title: '네트워크 기반 공격 기법 및 탐지',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['DDoS 공격(NTP/DNS 증폭, CC공격, Slowloris)', '포트 스캐닝(TCP SYN, FIN, NULL, Xmas 스캔)', '스니핑 및 패킷 분석']
          },
          {
            title: '네트워크 보안 솔루션 운용',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['패킷 필터링 방화벽 vs 상태추적(Stateful) 방화벽', '침입탐지시스템(IDS) 오용/이상 탐지', 'IPS 및 웹방화벽(WAF) 차단']
          },
          {
            title: '무선 네트워크 및 VPN 원격 보안',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['IPSec(AH, ESP, IKE)', 'SSL/TLS VPN 구조', 'WPA2/WPA3 무선 암호화 및 802.1X']
          }
        ]
      },
      {
        name: '애플리케이션 보안',
        color: '#84CC16', // Lime
        chapters: [
          {
            title: '웹 애플리케이션 취약점 (OWASP Top 10)',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['SQL 인젝션(Error-based, Blind, Union)', 'XSS(Stored, Reflected, DOM)', 'CSRF 및 SSRF 공격', '파일 업로드/다운로드 취약점']
          },
          {
            title: '시큐어 코딩 및 보안 아키텍처',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['입력 데이터 검증 및 매개변수화된 쿼리', '세션 하이재킹 방어(SameSite, HttpOnly, Secure)', '오류 처리 정보 노출 방지']
          },
          {
            title: '데이터베이스 보안 및 암호화 기법',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['DB 암호화 방식(API, Plug-in, TDE 커널 방식)', '데이터베이스 접근제어 및 감사', 'SQL 모니터링']
          },
          {
            title: '전자상거래 및 이메일 보안',
            difficulty: '중',
            frequency: 3,
            keyPoints: ['전자상거래 SET, 전자화폐', '이메일 보안(SPF, DKIM, DMARC, PGP, S/MIME)']
          }
        ]
      },
      {
        name: '정보보안 일반 (암호학)',
        color: '#06B6D4', // Cyan
        chapters: [
          {
            title: '대칭키 및 비대칭키 암호 시스템',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['블록 암호(DES, 3DES, AES, SEED, ARIA)', '블록 암호 운용 모드(ECB, CBC, CFB, OFB, CTR)', '공개키 암호(RSA, ElGamal, ECC 타원곡선)']
          },
          {
            title: '해시함수, 전자서명 및 PKI',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['일방향 해시(SHA-2, SHA-3, MD5 취약점)', '전자서명 원리 및 부인방지', 'PKI 공인인증체계(CA, RA, CRL, OCSP)']
          },
          {
            title: '사용자 인증 및 접근통제 모델',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['인증 3요소(지식, 소유, 생체)', 'DAC(신분기반), MAC(규칙기반), RBAC(역할기반)', 'Bell-LaPadula(기밀성), Biba(무결성) 모델']
          },
          {
            title: '키 교환 프로토콜 및 영지식 증명',
            difficulty: '중',
            frequency: 3,
            keyPoints: ['Diffie-Hellman 키 교환 및 중간자 공격(MitM)', 'Kerberos 티켓 기반 인증', '영지식 증명']
          }
        ]
      },
      {
        name: '정보보안 관리 및 법규',
        color: '#6366F1', // Indigo
        chapters: [
          {
            title: 'ISMS-P 인증체계 및 정보보호 관리',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['ISMS-P 3대 영역(관리체계, 보호대책, 개인정보 흐름)', '위험 분석(정량적 vs 정성적)', 'BIA 및 RTO/RPO 산정']
          },
          {
            title: '개인정보보호법 핵심 조항',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['개인정보 수집/이용/제공 동의 요건', '고유식별정보 암호화 및 유출 통지 기준', '가명정보 처리 기준']
          },
          {
            title: '정보통신망법 및 전자금융거래법',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['CISO 지정 요건 및 역할', '침해사고 신고 절차', '접속기록 보관 기준(최소 1년 이상)']
          },
          {
            title: '업무연속성 계획(BCP) 및 재해복구(DRS)',
            difficulty: '하',
            frequency: 3,
            keyPoints: ['재해복구센터 구축 유형(Mirror, Hot, Warm, Cold Site)', '비상대응 절차']
          }
        ]
      }
    ]
  },

  // ============================================================================
  // 3. 전기기사 (Engineer Electricity)
  // ============================================================================
  {
    id: 'elec',
    title: '전기기사 (Elec)',
    category: '전기 · 에너지',
    description: '대한민국 이공계 공학의 꽃 (전기자기학·전력·기기·회로·KEC 5개 과목 완벽 대비)',
    passCriteria: '과목당 40점 이상, 5과목 평균 60점 이상 합격 (계산 공식 완벽 숙지 필수)',
    defaultDailyHours: 3.5,
    subjects: [
      {
        name: '전기자기학',
        color: '#3B82F6', // Blue
        chapters: [
          {
            title: '정전계, 쿨롱의 법칙 및 가우스 정리',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['쿨롱의 법칙 F = 1/(4πε) * (q1 q2 / r²)', '전계의 세기 E 및 전위 V', '가우스 정리 및 전기력선 방정식']
          },
          {
            title: '도체계, 정전용량 및 유전체',
            difficulty: '상',
            frequency: 4,
            keyPoints: ['평행판 콘덴서 정전용량 C = εA/d', '정전에너지 W = 1/2 CV²', '유전율 ε, 분극의 세기 P']
          },
          {
            title: '정자계, 비오-사바르 및 앙페르 주회적분',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['비오-사바르 법칙', '앙페르의 주회적분 법칙', '원형 및 무한장 직선 도선 주변 자계 H']
          },
          {
            title: '전자유도, 인덕턴스 및 맥스웰 방정식',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['패러데이-렌츠 전자유도 법칙', '자기인덕턴스 L, 상호인덕턴스 M 결합계수', '맥스웰 전자방정식 4개 기본형']
          }
        ]
      },
      {
        name: '전력공학',
        color: '#10B981', // Emerald
        chapters: [
          {
            title: '선로정수 및 코로나 현상',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['선로정수 4요소(R, L, C, G)', '복도체/다도체 방식 장점', '코로나 임계전압 및 방지 대책']
          },
          {
            title: '송전선로 특성값 및 4단자 정수',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['단거리/중거리(T, π형 회로)/장거리 송전선로', '특성임피던스 Z0 및 전파정수 γ', '페란티 현상 및 수란현상']
          },
          {
            title: '고장계산, 대칭좌표법 및 안정도',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['영상/정상/역상분 대칭좌표법', '1선 지락, 3상 단락 전류 계산 및 %Z법', '정태/과도 안정도 향상 대책']
          },
          {
            title: '배전선로 운용 및 이상전압 방호',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['전압강하율 및 전력손실 계산', '역률 개선용 전력용 콘덴서 용량 계산', '피뢰기(LA) 제한전압 및 접지']
          }
        ]
      },
      {
        name: '전기기기',
        color: '#F59E0B', // Amber
        chapters: [
          {
            title: '직류기 (발전기 및 전동기)',
            difficulty: '상',
            frequency: 4,
            keyPoints: ['직류기 구조(계자, 전기자, 정류자)', '전기자 반작용 및 보극/보상권선', '직권/분권/복권 전동기 토크-속도 특성']
          },
          {
            title: '동기기 (동기발전기 및 동기전동기)',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['동기발전기 유기기전력 E = 4.44 kw f w Φ', '단락비(Ks)와 전기자 반작용', '병렬운전 조건(기전력 크기/위상/주파수/파형 일치)']
          },
          {
            title: '변압기 등가회로 및 결선',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['변압기 등가회로 및 전압변동률', 'Δ-Δ, Y-Δ, V-V 결선 출력비(57.7%) 및 이용률(86.6%)', '손실(철손/동손) 및 최대효율 조건']
          },
          {
            title: '유도전동기 (3상 및 단상)',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['슬립(Slip) s = (Ns - N) / Ns', '토크-슬립 곡선 및 비례추이', '유도전동기 기동법(Y-Δ, 기동보상기, 인버터)']
          }
        ]
      },
      {
        name: '회로이론 및 제어공학',
        color: '#8B5CF6', // Purple
        chapters: [
          {
            title: '교류 RLC 회로 및 공진 회로',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['RLC 직렬/병렬 공진 조건 및 Q값', '임피던스 Z 및 어드미턴스 Y 궤적', '유효전력, 무효전력, 피상전력 삼각관계']
          },
          {
            title: '3상 교류 전력 및 대칭분 계산',
            difficulty: '상',
            frequency: 4,
            keyPoints: ['Y결선 및 Δ결선 선간전압/상전압 위상 관계', '2전력계법 측정 공식 P = W1 + W2', '대칭 3상 교류 회로 해석']
          },
          {
            title: '라플라스 변환 및 전달함수',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['기본 함수 라플라스 변환(단위계단, 지수함수, 삼각함수)', '미분/적분 정리 및 최종값 정리', '블록선도 및 메이슨 이득 공식']
          },
          {
            title: '주파수 응답 및 제어계 안정도 판별',
            difficulty: '상',
            frequency: 4,
            keyPoints: ['루스-후르비츠 안정도 판별법', '보드선도(Bode Plot) 이득여유 & 위상여유', '나이퀴스트 판별법 및 근궤적법']
          }
        ]
      },
      {
        name: '전기설비기술기준 (KEC)',
        color: '#EC4899', // Pink
        chapters: [
          {
            title: '한국전기설비규정(KEC) 접지시스템',
            difficulty: '상',
            frequency: 5,
            keyPoints: ['접지시스템 구분(단독접지, 공통접지, 통합접지)', 'TN계통(TN-S, TN-C, TN-C-S), TT계통, IT계통', '감전보호 등전위본딩']
          },
          {
            title: '전선로 및 가공전선로 지지물 규정',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['가공전선 굵기 및 지표상 높이 규정', '지주 및 지선(안전율 2.5, 인류하중)', '이도(Dip) 계산 공식 D = WS²/(8T)']
          },
          {
            title: '옥내 배선 공사 및 저압 전기설비',
            difficulty: '중',
            frequency: 5,
            keyPoints: ['금속관, 합성수지관, 가요전선관 공사 기준', '케이블트레이 공사', '누전차단기(ELB) 설치 기준(30mA, 0.03초)']
          },
          {
            title: '특고압 및 분산형 전원설비 기술기준',
            difficulty: '중',
            frequency: 4,
            keyPoints: ['태양광 및 풍력 분산형 전원 연계 기준', '특고압 변전소 울타리 높이 규정', '절연내력 시험전압(10분간 인가)']
          }
        ]
      }
    ]
  }
];

export function getSubjectColor(subjectName: string): string {
  const match = CURRICULUM_PRESETS.flatMap(p => p.subjects).find(s => s.name === subjectName);
  if (match) return match.color;

  const defaultColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return defaultColors[Math.abs(hash) % defaultColors.length];
}
