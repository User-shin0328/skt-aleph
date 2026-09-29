# -*- coding: utf-8 -*-
"""
과제 B: NASA 2,220개 외계행성 관측 데이터 컴팩트 JSON 추출기
과제 10 논문의 processed_exoplanets.csv 및 raw_nasa_exoplanets.csv를 결합하여
ExoForge 웹 애플리케이션에 임베딩할 최적화된 데이터셋을 생성합니다.
"""

import os
import csv
import json
import math

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_CSV = os.path.join(BASE_DIR, "과제10", "data", "processed_exoplanets.csv")
RAW_CSV = os.path.join(BASE_DIR, "과제10", "data", "raw_nasa_exoplanets.csv")
OUTPUT_JSON = os.path.join(BASE_DIR, "과제B", "exoplanets_2220.json")
OUTPUT_JS = os.path.join(BASE_DIR, "과제B", "exoplanets_data.js")

def parse_float(val, default=None):
    try:
        return float(val) if val not in (None, "", "null") else default
    except ValueError:
        return default

# 1. raw에서 pl_rade 매핑
raw_radii = {}
with open(RAW_CSV, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row.get("pl_name", "").strip().strip('"')
        rade = parse_float(row.get("pl_rade"))
        if rade and rade > 0:
            raw_radii[name] = rade

print(f"Raw CSV에서 읽은 행성 수: {len(raw_radii)}")

# 2. processed_exoplanets 읽기
dataset = []
with open(PROCESSED_CSV, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row.get("pl_name", "").strip()
        host = row.get("hostname", "").strip()
        st_met = parse_float(row.get("st_met"))
        bmassj = parse_float(row.get("pl_bmassj"))
        bmasse = parse_float(row.get("pl_bmasse"))
        orbper = parse_float(row.get("pl_orbper"))
        ptype = row.get("planet_type", "").strip()
        method = row.get("discoverymethod", "").strip()
        st_teff = parse_float(row.get("st_teff"))

        if st_met is None or bmassj is None:
            continue

        # 지구 질량 보정
        if bmasse is None or bmasse <= 0:
            bmasse = bmassj * 317.828

        # 행성 반지름 (Earth Radii) 결정
        rade = raw_radii.get(name)
        if rade is None or rade <= 0:
            # 천체물리학 질량-반경 상관관계 (Chen & Kipping 2017 모델 근사)
            if bmasse < 2.0:
                rade = round(bmasse ** 0.28, 2)
            elif bmasse < 10.0:
                rade = round(bmasse ** 0.59, 2)
            elif bmasse < 100.0:
                rade = round(1.8 * (bmasse ** 0.28), 2)
            else: # 가스 행성 (수소-헬륨 축퇴압으로 인해 질량이 커져도 반경은 목성 반경 ~ 11.2 R_E 부근 수렴)
                rade = round(min(16.0, 11.2 * (bmasse / 317.8) ** 0.05), 2)
        else:
            rade = round(rade, 2)

        # 4대 표준 유형 간소화
        if "Gas Giant" in ptype or bmassj >= 0.1 or rade >= 6.0:
            norm_type = "Gas Giant"
        elif "Neptune" in ptype or (rade >= 2.0 and rade < 6.0):
            norm_type = "Neptune-like"
        elif "Terrestrial" in ptype or (bmasse <= 2.0 and rade <= 1.5):
            norm_type = "Terrestrial"
        else:
            norm_type = "Super-Earth"

        # 골디락스 존 (Habitable Zone) 간이 판정 (궤도 주기 100일~500일 사이 또는 추정 궤도반지름 0.7~1.5 AU)
        is_habitable = False
        if orbper is not None and 150 <= orbper <= 450 and norm_type in ("Terrestrial", "Super-Earth"):
            is_habitable = True

        dataset.append({
            "n": name,             # 행성 이름
            "h": host,             # 모항성 이름
            "m": round(st_met, 2), # 모항성 금속함량 [Fe/H]
            "mj": round(bmassj, 3),# 목성 질량
            "me": round(bmasse, 1),# 지구 질량
            "r": rade,             # 지구 반경 단위 (Earth Radii)
            "t": norm_type,        # 표준 유형
            "p": round(orbper, 1) if orbper else None, # 공전 주기(일)
            "d": method if method else "Radial Velocity",
            "hz": 1 if is_habitable else 0
        })

print(f"추출 완료된 정규 데이터셋 크기: {len(dataset)} 개")

# JSON 및 JS 파일로 저장
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False)

with open(OUTPUT_JS, "w", encoding="utf-8") as f:
    f.write("// NASA Exoplanet Archive 2,220 Curated Dataset for ExoForge\n")
    f.write("window.EXOPLANETS_2220 = ")
    json.dump(dataset, f, separators=(',', ':'), ensure_ascii=False)
    f.write(";\n")

print(f"저장 성공: {OUTPUT_JSON}, {OUTPUT_JS}")
