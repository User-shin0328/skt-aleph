# -*- coding: utf-8 -*-
"""
과제 10: AI와 함께 쓰는 첫 논문
스크립트 1: NASA Exoplanet Archive TAP API를 통한 원자료 다운로드
출처: NASA Exoplanet Science Institute (NExScI) / Caltech IPAC
데이터 수집 범위: default_flag=1인 확정 외계행성 중 st_met 및 pl_bmasse가 유효한 전체 표본
"""

import os
import urllib.request
import urllib.parse
import json
import csv

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(DATA_DIR, exist_ok=True)

RAW_CSV_PATH = os.path.join(DATA_DIR, "raw_nasa_exoplanets.csv")

def fetch_nasa_exoplanet_data():
    print("[1/3] NASA Exoplanet Archive TAP API 호출 준비 중...")
    
    # TAP API 쿼리 구성 (CSV 포맷)
    query = """
    SELECT pl_name, hostname, pl_letter, pl_bmasse, pl_bmassj, pl_rade, 
           pl_orbper, st_met, st_teff, st_mass, st_rad, disc_year, discoverymethod
    FROM ps
    WHERE default_flag = 1 
      AND pl_bmasse IS NOT NULL 
      AND st_met IS NOT NULL
    ORDER BY pl_name ASC
    """.strip()
    
    params = urllib.parse.urlencode({
        "query": query,
        "format": "csv"
    })
    
    url = f"https://exoplanetarchive.ipac.caltech.edu/TAP/sync?{params}"
    print(f"[2/3] 데이터 다운로드 요청 전송 중... URL: {url[:80]}...")
    
    req = urllib.request.Request(url, headers={
        "User-Agent": "Exoplanet-Research-Paper/1.0 (Academic Project; Contact: student)"
    })
    
    with urllib.request.urlopen(req, timeout=30) as resp:
        content = resp.read().decode('utf-8')
        
    with open(RAW_CSV_PATH, "w", encoding="utf-8", newline="") as f:
        f.write(content)
        
    # 데이터 행 수 검증
    with open(RAW_CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
    print(f"[3/3] 다운로드 완료! 저장 경로: {RAW_CSV_PATH}")
    print(f"      총 수집된 확정 외계행성 표본 수: {len(rows)}건")
    if rows:
        print(f"      첫 번째 행성 샘플: {rows[0]['pl_name']} (모항성: {rows[0]['hostname']}, [Fe/H]: {rows[0]['st_met']}, 질량(Mj): {rows[0]['pl_bmassj']})")
        
    return len(rows)

if __name__ == "__main__":
    fetch_nasa_exoplanet_data()
