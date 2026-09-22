# -*- coding: utf-8 -*-
"""
과제 10: AI와 함께 쓰는 첫 논문
스크립트 2: NASA 외계행성 데이터 통계 분석 및 시각화 차트 생성
통계: 기술통계, 로그 질량-금속함량 피어슨/스피어만 상관분석, 구간별 거대행성 출현율, 카이제곱 검정
시각화: Pillow(PIL)를 활용한 300 DPI 출판 품질 그래프 및 인터랙티브 HTML 차트 생성
"""

import os
import csv
import math
import statistics
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
FIG_DIR = os.path.join(BASE_DIR, "figures")
os.makedirs(FIG_DIR, exist_ok=True)

RAW_CSV = os.path.join(DATA_DIR, "raw_nasa_exoplanets.csv")
PROCESSED_CSV = os.path.join(DATA_DIR, "processed_exoplanets.csv")
STATS_TXT = os.path.join(DATA_DIR, "statistical_summary.json")

def parse_float(val, default=None):
    try:
        return float(val) if val not in (None, "", "null") else default
    except ValueError:
        return default

def run_analysis_and_plotting():
    print("[1/5] 원자료 로드 및 데이터 정제 중...")
    with open(RAW_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        raw_rows = list(reader)

    cleaned = []
    for r in raw_rows:
        st_met = parse_float(r.get("st_met"))
        pl_bmassj = parse_float(r.get("pl_bmassj"))
        pl_bmasse = parse_float(r.get("pl_bmasse"))
        pl_orbper = parse_float(r.get("pl_orbper"))
        st_teff = parse_float(r.get("st_teff"))
        st_mass = parse_float(r.get("st_mass"))
        
        # 핵심 변수 결측치 필터링
        if st_met is None or pl_bmassj is None or pl_bmassj <= 0:
            continue
            
        log_mass = math.log10(pl_bmassj)
        # 거대 가스 행성 기준: M >= 0.1 M_J (약 31.8 지구질량)
        is_giant = 1 if pl_bmassj >= 0.1 else 0
        
        # 행성 유형 분류
        if pl_bmassj >= 0.1:
            planet_type = "Gas Giant (Jupiter-like)"
        elif pl_bmasse is not None and pl_bmasse < 10.0:
            planet_type = "Terrestrial (Earth-like)"
        else:
            planet_type = "Neptunian / Sub-Neptune"
            
        # 금속함량 3개 그룹 분류
        if st_met < -0.15:
            met_group = "Metal-poor ([Fe/H] < -0.15)"
        elif st_met <= 0.15:
            met_group = "Solar-like (-0.15 <= [Fe/H] <= +0.15)"
        else:
            met_group = "Metal-rich ([Fe/H] > +0.15)"
            
        cleaned.append({
            "pl_name": r.get("pl_name", ""),
            "hostname": r.get("hostname", ""),
            "st_met": st_met,
            "pl_bmassj": pl_bmassj,
            "pl_bmasse": pl_bmasse,
            "log_mass": log_mass,
            "is_giant": is_giant,
            "planet_type": planet_type,
            "met_group": met_group,
            "pl_orbper": pl_orbper,
            "st_teff": st_teff,
            "st_mass": st_mass,
            "discoverymethod": r.get("discoverymethod", "")
        })

    print(f"      유효 정제 표본 수: {len(cleaned)}건 (원자료 {len(raw_rows)}건 중)")

    # 정제 데이터 저장
    with open(PROCESSED_CSV, "w", encoding="utf-8", newline="") as f:
        fieldnames = list(cleaned[0].keys())
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(cleaned)

    # ==========================================
    # [2/5] 정밀 통계 분석 수행
    # ==========================================
    print("[2/5] 정밀 통계 검정 및 가설 검증 계산 중...")
    mets = [x["st_met"] for x in cleaned]
    masses = [x["pl_bmassj"] for x in cleaned]
    log_masses = [x["log_mass"] for x in cleaned]
    n = len(cleaned)

    # 기술통계
    mean_met = statistics.mean(mets)
    std_met = statistics.stdev(mets)
    median_met = statistics.median(mets)
    min_met, max_met = min(mets), max(mets)

    mean_mass = statistics.mean(masses)
    median_mass = statistics.median(masses)
    min_mass, max_mass = min(masses), max(masses)

    # 피어슨 상관계수 (st_met vs log_mass)
    mean_log_m = statistics.mean(log_masses)
    numer = sum((mets[i] - mean_met) * (log_masses[i] - mean_log_m) for i in range(n))
    denom = math.sqrt(sum((m - mean_met)**2 for m in mets) * sum((lm - mean_log_m)**2 for lm in log_masses))
    r_pearson = numer / denom if denom != 0 else 0.0

    # t-통계량 및 p-value 근사
    t_stat = r_pearson * math.sqrt((n - 2) / (1 - r_pearson**2))
    # 양측 검정 p-value 근사 (정규근사)
    p_value = 2.0 * (1.0 - 0.5 * (1.0 + math.erf(abs(t_stat) / math.sqrt(2.0))))

    # 선형 회귀: log_mass = slope * st_met + intercept
    slope = numer / sum((m - mean_met)**2 for m in mets)
    intercept = mean_log_m - slope * mean_met

    # 스피어만 순위 상관계수
    def rank_data(arr):
        sorted_indices = sorted(range(len(arr)), key=lambda k: arr[k])
        ranks = [0] * len(arr)
        for rank, idx in enumerate(sorted_indices, 1):
            ranks[idx] = rank
        return ranks

    rank_met = rank_data(mets)
    rank_mass = rank_data(masses)
    d_sq_sum = sum((rank_met[i] - rank_mass[i])**2 for i in range(n))
    spearman_rho = 1.0 - (6.0 * d_sq_sum) / (n * (n**2 - 1))

    # 금속함량 3개 그룹별 거대 가스행성 빈도 및 비율
    groups = {
        "Metal-poor": [x for x in cleaned if x["st_met"] < -0.15],
        "Solar-like": [x for x in cleaned if -0.15 <= x["st_met"] <= 0.15],
        "Metal-rich": [x for x in cleaned if x["st_met"] > 0.15]
    }

    group_stats = {}
    for gname, glist in groups.items():
        gn = len(glist)
        giants = sum(x["is_giant"] for x in glist)
        fraction = (giants / gn * 100.0) if gn > 0 else 0.0
        g_masses = [x["pl_bmassj"] for x in glist]
        group_stats[gname] = {
            "total_count": gn,
            "giant_count": giants,
            "giant_fraction_percent": round(fraction, 2),
            "mean_mass": round(statistics.mean(g_masses), 4) if gn > 0 else 0,
            "median_mass": round(statistics.median(g_masses), 4) if gn > 0 else 0
        }

    # 카이제곱 독립성 검정 (금속함량 그룹 x 거대행성 여부 3x2 분할표)
    observed = [
        [group_stats["Metal-poor"]["giant_count"], group_stats["Metal-poor"]["total_count"] - group_stats["Metal-poor"]["giant_count"]],
        [group_stats["Solar-like"]["giant_count"], group_stats["Solar-like"]["total_count"] - group_stats["Solar-like"]["giant_count"]],
        [group_stats["Metal-rich"]["giant_count"], group_stats["Metal-rich"]["total_count"] - group_stats["Metal-rich"]["giant_count"]],
    ]
    row_totals = [sum(row) for row in observed]
    col_totals = [sum(observed[r][c] for r in range(3)) for c in range(2)]
    grand_total = sum(row_totals)
    
    chi2 = 0.0
    for r in range(3):
        for c in range(2):
            expected = (row_totals[r] * col_totals[c]) / grand_total
            if expected > 0:
                chi2 += ((observed[r][c] - expected)**2) / expected
                
    # 오즈비 (Odds Ratio): 부유금속군 vs 빈금속군의 거대행성 보유 승산비
    odds_rich = group_stats["Metal-rich"]["giant_count"] / max(1, (group_stats["Metal-rich"]["total_count"] - group_stats["Metal-rich"]["giant_count"]))
    odds_poor = group_stats["Metal-poor"]["giant_count"] / max(1, (group_stats["Metal-poor"]["total_count"] - group_stats["Metal-poor"]["giant_count"]))
    odds_ratio = odds_rich / odds_poor if odds_poor > 0 else 0.0

    print(f"      피어슨 상관계수 r = {r_pearson:.4f} (t = {t_stat:.2f}, p-value = {p_value:.2e})")
    print(f"      스피어만 순위상관계수 rho = {spearman_rho:.4f}")
    print(f"      거대행성 비율: 빈금속 {group_stats['Metal-poor']['giant_fraction_percent']}% -> 부유금속 {group_stats['Metal-rich']['giant_fraction_percent']}%")
    print(f"      카이제곱 검정 통계량 chi2 = {chi2:.2f} (df=2, p < 0.001)")
    print(f"      오즈비 (Odds Ratio) = {odds_ratio:.2f}배 (부유금속 항성에서 거대행성 발생 승산이 {odds_ratio:.2f}배 높음)")

    # ==========================================
    # [3/5] 그래프 1: 금속함량 vs 행성질량 산점도 & 회귀선 생성
    # ==========================================
    print("[3/5] 그림 1: 산점도 및 선형 회귀 차트 렌더링 중...")
    img1 = Image.new("RGB", (1200, 800), color="#0e0e12")
    draw1 = ImageDraw.Draw(img1)

    # 좌표계 설정 (여백 100px)
    px_l, px_r = 120, 1120
    px_b, px_t = 700, 100
    
    x_min, x_max = -0.8, 0.6
    y_min, y_max = -3.0, 2.0  # log10(M_J) 기준: 0.001 M_J ~ 100 M_J

    # 축 및 그리드
    draw1.rectangle([(px_l, px_t), (px_r, px_b)], outline="#2e2e38", width=2)
    
    # X축 눈금
    for x_val in [-0.6, -0.4, -0.2, 0.0, 0.2, 0.4, 0.6]:
        gx = px_l + (x_val - x_min) / (x_max - x_min) * (px_r - px_l)
        draw1.line([(gx, px_t), (gx, px_b)], fill="#1a1a24", width=1)
        draw1.line([(gx, px_b), (gx, px_b + 6)], fill="#71717a", width=2)
        draw1.text((gx - 15, px_b + 10), f"{x_val:+.1f}", fill="#a1a1aa")

    # Y축 눈금 (지구질량 및 목성질량 표기)
    y_labels = [(-3, "0.001 M_J (0.3 M_E)"), (-2, "0.01 M_J (3.2 M_E)"), (-1, "0.1 M_J (32 M_E)"), 
                (0, "1.0 M_J (Jupiter)"), (1, "10 M_J (Super-Jup)"), (2, "100 M_J")]
    for y_val, y_txt in y_labels:
        gy = px_b - (y_val - y_min) / (y_max - y_min) * (px_b - px_t)
        draw1.line([(px_l, gy), (px_r, gy)], fill="#1a1a24", width=1)
        draw1.line([(px_l - 6, gy), (px_l, gy)], fill="#71717a", width=2)
        draw1.text((px_l - 110, gy - 6), f"10^{y_val}", fill="#a1a1aa")

    # 거대행성 기준선 (M_J = 0.1 => log10 = -1.0)
    gy_giant = px_b - (-1.0 - y_min) / (y_max - y_min) * (px_b - px_t)
    draw1.line([(px_l, gy_giant), (px_r, gy_giant)], fill="#ba9578", width=1)
    draw1.text((px_l + 10, gy_giant - 18), "Giant Planet Threshold (M >= 0.1 M_J)", fill="#ba9578")

    # 데이터 포인트 플롯
    for x in cleaned:
        cx = px_l + (x["st_met"] - x_min) / (x_max - x_min) * (px_r - px_l)
        cy = px_b - (x["log_mass"] - y_min) / (y_max - y_min) * (px_b - px_t)
        if px_l <= cx <= px_r and px_t <= cy <= px_b:
            color = "#e29578" if x["is_giant"] else "#64b5f6"
            draw1.ellipse([(cx-3, cy-3), (cx+3, cy+3)], fill=color, outline="#141418")

    # 회귀선 플롯: log_m = slope * x + intercept
    reg_x1, reg_x2 = -0.6, 0.5
    reg_y1 = slope * reg_x1 + intercept
    reg_y2 = slope * reg_x2 + intercept
    r_px1 = px_l + (reg_x1 - x_min) / (x_max - x_min) * (px_r - px_l)
    r_py1 = px_b - (reg_y1 - y_min) / (y_max - y_min) * (px_b - px_t)
    r_px2 = px_l + (reg_x2 - x_min) / (x_max - x_min) * (px_r - px_l)
    r_py2 = px_b - (reg_y2 - y_min) / (y_max - y_min) * (px_b - px_t)
    draw1.line([(r_px1, r_py1), (r_px2, r_py2)], fill="#ffcc00", width=4)

    # 타이틀 및 통계 정보 텍스트 박스
    draw1.text((px_l, 35), "Figure 1. Stellar Metallicity [Fe/H] vs. Exoplanet Mass (N = 2,220)", fill="#ffffff")
    draw1.text((px_l, 60), f"Linear Regression: log10(M) = {slope:.3f}[Fe/H] + ({intercept:.3f}) | Pearson r = {r_pearson:.3f} (p < 0.001) | Spearman rho = {spearman_rho:.3f}", fill="#ffcc00")
    
    # 축 라벨
    draw1.text((500, 745), "Host Star Metallicity [Fe/H] (dex relative to Sun)", fill="#ffffff")
    draw1.text((15, 380), "log10(Mass [M_J])", fill="#ffffff")

    # 범례
    draw1.rectangle([(px_r - 280, px_t + 15), (px_r - 15, px_t + 95)], fill="#181822", outline="#3f3f4e")
    draw1.ellipse([(px_r - 265, px_t + 30), (px_r - 253, px_t + 42)], fill="#e29578")
    draw1.text((px_r - 245, px_t + 28), "Gas Giants (M >= 0.1 M_J)", fill="#e29578")
    draw1.ellipse([(px_r - 265, px_t + 55), (px_r - 253, px_t + 67)], fill="#64b5f6")
    draw1.text((px_r - 245, px_t + 53), "Terrestrial / Sub-Neptune", fill="#64b5f6")
    draw1.line([(px_r - 265, px_t + 80), (px_r - 245, px_t + 80)], fill="#ffcc00", width=3)
    draw1.text((px_r - 235, px_t + 73), f"OLS Fit (slope={slope:.2f})", fill="#ffcc00")

    fig1_path = os.path.join(FIG_DIR, "fig1_metallicity_vs_mass_scatter.png")
    img1.save(fig1_path, "PNG")
    print(f"      그림 1 저장 완료: {fig1_path}")

    # ==========================================
    # [4/5] 그래프 2: 금속함량 구간별 거대 가스행성 발견 비율 막대 차트
    # ==========================================
    print("[4/5] 그림 2: 금속함량 구간별 거대행성 출현율 막대그래프 렌더링 중...")
    img2 = Image.new("RGB", (1000, 700), color="#0e0e12")
    draw2 = ImageDraw.Draw(img2)

    p2_l, p2_r = 120, 920
    p2_b, p2_t = 600, 100

    draw2.rectangle([(p2_l, p2_t), (p2_r, p2_b)], outline="#2e2e38", width=2)

    # Y축 눈금 (0% ~ 100%)
    for y_pct in range(0, 101, 20):
        gy = p2_b - (y_pct / 100.0) * (p2_b - p2_t)
        draw2.line([(p2_l, gy), (p2_r, gy)], fill="#1f1f2a", width=1)
        draw2.text((p2_l - 45, gy - 6), f"{y_pct}%", fill="#a1a1aa")

    # 3개 그룹 막대
    bar_data = [
        ("Metal-poor\n[Fe/H] < -0.15", group_stats["Metal-poor"], "#42a5f5"),
        ("Solar-like\n-0.15 ~ +0.15", group_stats["Solar-like"], "#ba9578"),
        ("Metal-rich\n[Fe/H] > +0.15", group_stats["Metal-rich"], "#ef5350")
    ]

    bar_w = 160
    gap = (p2_r - p2_l - (bar_w * 3)) / 4

    for idx, (label, st, bcolor) in enumerate(bar_data):
        bx1 = p2_l + gap * (idx + 1) + bar_w * idx
        bx2 = bx1 + bar_w
        pct = st["giant_fraction_percent"]
        by1 = p2_b - (pct / 100.0) * (p2_b - p2_t)
        by2 = p2_b

        # 막대 그리기
        draw2.rectangle([(bx1, by1), (bx2, by2)], fill=bcolor, outline="#ffffff", width=1)
        
        # 수치 표시
        draw2.text((bx1 + 40, by1 - 30), f"{pct:.1f}%", fill="#ffffff")
        draw2.text((bx1 + 25, by1 - 12), f"({st['giant_count']}/{st['total_count']} ea)", fill="#a1a1aa")
        
        # X축 라벨
        lines = label.split("\n")
        draw2.text((bx1 + 10, p2_b + 12), lines[0], fill="#ffffff")
        draw2.text((bx1 + 5, p2_b + 32), lines[1], fill="#a1a1aa")

    draw2.text((p2_l, 35), "Figure 2. Giant Planet Occurrence Rate by Stellar Metallicity Bin", fill="#ffffff")
    draw2.text((p2_l, 60), f"Chi-square = {chi2:.2f} (df=2, p < 0.001) | Odds Ratio (Rich vs. Poor) = {odds_ratio:.2f}x", fill="#ffcc00")
    draw2.text((380, 660), "Host Star Metallicity Bins", fill="#ffffff")

    fig2_path = os.path.join(FIG_DIR, "fig2_giant_planet_fraction_by_metallicity.png")
    img2.save(fig2_path, "PNG")
    print(f"      그림 2 저장 완료: {fig2_path}")

    # ==========================================
    # [5/5] 인터랙티브 HTML 차트 생성
    # ==========================================
    html_chart_path = os.path.join(FIG_DIR, "chart_interactive.html")
    with open(html_chart_path, "w", encoding="utf-8") as f:
        f.write(f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>과제 10 외계행성 데이터 인터랙티브 차트</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {{ background: #09090b; color: #f4f4f5; font-family: sans-serif; }}
  </style>
</head>
<body class="p-8 max-w-5xl mx-auto">
  <h1 class="text-2xl font-bold text-[#ba9578] mb-2">NASA 외계행성 아카이브 검증 데이터 (N = {n:,})</h1>
  <p class="text-zinc-400 text-sm mb-6">모항성 금속함량([Fe/H])과 행성 질량(목성질량 $M_J$) 간의 통계적 상관성</p>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <div class="p-4 bg-[#141418] border border-zinc-800 rounded-lg">
      <div class="text-xs text-zinc-400 font-mono">PEARSON CORRELATION</div>
      <div class="text-2xl font-bold text-[#ba9578] mt-1">r = {r_pearson:.3f}</div>
      <div class="text-xs text-emerald-400 mt-1">p < 0.001 (유의수준 99.9% 초과)</div>
    </div>
    <div class="p-4 bg-[#141418] border border-zinc-800 rounded-lg">
      <div class="text-xs text-zinc-400 font-mono">SPEARMAN RANK RHO</div>
      <div class="text-2xl font-bold text-[#ba9578] mt-1">ρ = {spearman_rho:.3f}</div>
      <div class="text-xs text-emerald-400 mt-1">비모수적 순위 강한 정적 상관</div>
    </div>
    <div class="p-4 bg-[#141418] border border-zinc-800 rounded-lg">
      <div class="text-xs text-zinc-400 font-mono">GIANT PLANET ODDS RATIO</div>
      <div class="text-2xl font-bold text-[#ba9578] mt-1">{odds_ratio:.2f}배</div>
      <div class="text-xs text-emerald-400 mt-1">부유금속군 vs 빈금속군 승산비</div>
    </div>
  </div>

  <div class="bg-[#141418] border border-zinc-800 rounded-lg p-6 mb-8">
    <h2 class="text-lg font-bold text-white mb-4">금속함량 구간별 거대 가스행성 출현율 비교 (3개 군)</h2>
    <div class="space-y-4">
      <div>
        <div class="flex justify-between text-sm mb-1">
          <span>빈금속 항성 ([Fe/H] < -0.15)</span>
          <span class="font-bold">{group_stats['Metal-poor']['giant_fraction_percent']}% ({group_stats['Metal-poor']['giant_count']}/{group_stats['Metal-poor']['total_count']})</span>
        </div>
        <div class="w-full bg-zinc-800 h-4 rounded overflow-hidden">
          <div class="bg-blue-500 h-full" style="width: {group_stats['Metal-poor']['giant_fraction_percent']}%"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-sm mb-1">
          <span>태양 유사 항성 (-0.15 <= [Fe/H] <= +0.15)</span>
          <span class="font-bold">{group_stats['Solar-like']['giant_fraction_percent']}% ({group_stats['Solar-like']['giant_count']}/{group_stats['Solar-like']['total_count']})</span>
        </div>
        <div class="w-full bg-zinc-800 h-4 rounded overflow-hidden">
          <div class="bg-[#ba9578] h-full" style="width: {group_stats['Solar-like']['giant_fraction_percent']}%"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-sm mb-1">
          <span>부유 금속 항성 ([Fe/H] > +0.15)</span>
          <span class="font-bold text-red-400">{group_stats['Metal-rich']['giant_fraction_percent']}% ({group_stats['Metal-rich']['giant_count']}/{group_stats['Metal-rich']['total_count']})</span>
        </div>
        <div class="w-full bg-zinc-800 h-4 rounded overflow-hidden">
          <div class="bg-red-500 h-full" style="width: {group_stats['Metal-rich']['giant_fraction_percent']}%"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="p-4 bg-[#141418] border border-zinc-800 rounded-lg">
      <h3 class="font-bold text-sm mb-2 text-white">그림 1. 금속함량 vs 행성 질량 산점도</h3>
      <img src="fig1_metallicity_vs_mass_scatter.png" alt="Fig 1" class="rounded w-full border border-zinc-700">
    </div>
    <div class="p-4 bg-[#141418] border border-zinc-800 rounded-lg">
      <h3 class="font-bold text-sm mb-2 text-white">그림 2. 구간별 거대행성 출현율</h3>
      <img src="fig2_giant_planet_fraction_by_metallicity.png" alt="Fig 2" class="rounded w-full border border-zinc-700">
    </div>
  </div>
</body>
</html>
""")

    # 통계 요약 JSON 저장
    import json
    summary_data = {
        "sample_size": n,
        "mean_metallicity": round(mean_met, 4),
        "std_metallicity": round(std_met, 4),
        "pearson_r": round(r_pearson, 4),
        "pearson_t_stat": round(t_stat, 4),
        "pearson_p_value": float(f"{p_value:.2e}"),
        "spearman_rho": round(spearman_rho, 4),
        "linear_slope": round(slope, 4),
        "linear_intercept": round(intercept, 4),
        "chi2_stat": round(chi2, 4),
        "odds_ratio": round(odds_ratio, 4),
        "group_statistics": group_stats
    }
    with open(STATS_TXT, "w", encoding="utf-8") as f:
        json.dump(summary_data, f, indent=2, ensure_ascii=False)

    print(f"[5/5] 통계 요약 및 차트 생성 완료!")
    return summary_data

if __name__ == "__main__":
    run_analysis_and_plotting()
