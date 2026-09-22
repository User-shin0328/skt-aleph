# 과제 10 재현 패키지 (Replication Package)

## 연구 제목
**별에 철이 많으면 행성도 더 커질까? — NASA의 2,220개 외계행성 데이터로 밝혀낸 거대 행성의 탄생 비밀**
* 저자: 신재원
* 일자: 2026-09-22

---

## 1. 패키지 구성
* `AI_우주연구_논문.md`: 완성 학술 논문 전문
* `카드1_질문을_가설로.md`: 카드 1 산출물 (가설 수립 및 주제 필터링)
* `카드2_논거_세우기.md`: 카드 2 산출물 (문헌 실물 검증 및 할루시네이션 필터링)
* `카드3_실험_설계와_실행.md`: 카드 3 산출물 (실험 설계 및 절차)
* `카드4_결과_해석.md`: 카드 4 산출물 (통계 검정 및 가설 정교화)
* `카드5_논문으로_묶기.md`: 카드 5 산출물 (최종 완주 체크리스트 및 AI 판단 3줄)
* `data/`:
  - `raw_nasa_exoplanets.csv`: NASA TAP API 원자료 전수 (N = 2,220)
  - `processed_exoplanets.csv`: 전처리 및 파생변수 포함 데이터셋
  - `statistical_summary.json`: 계산된 주요 통계치 요약
* `scripts/`:
  - `01_fetch_nasa_data.py`: NASA 실시간 다운로드 코드
  - `02_analyze_and_plot.py`: 통계 분석 및 시각화 코드
* `figures/`:
  - `fig1_metallicity_vs_mass_scatter.png`: 금속함량 vs 로그 질량 산점도 및 선형 회귀선
  - `fig2_giant_planet_fraction_by_metallicity.png`: 구간별 거대행성 출현율 막대그래프
  - `chart_interactive.html`: 웹 인터랙티브 대시보드

---

## 2. 재현 실행 방법 (1분 완료)
Python 3.8 이상 환경의 터미널에서 다음 명령어를 실행합니다:

```powershell
# 1. 데이터 수집
python scripts/01_fetch_nasa_data.py

# 2. 통계 분석 및 그래프 생성
python scripts/02_analyze_and_plot.py
```
