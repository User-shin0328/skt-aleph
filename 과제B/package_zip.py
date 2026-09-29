# -*- coding: utf-8 -*-
"""
과제 B: 실행 묶음(ZIP) 패키징 스크립트
"""

import os
import zipfile

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_APP_HTML = os.path.join(BASE_DIR, "과제B", "web", "index.html")
SRC_README = os.path.join(BASE_DIR, "과제B", "README.md")
SRC_SUBMISSION = os.path.join(BASE_DIR, "과제B", "과제B_제출서.md")
SRC_DATA = os.path.join(BASE_DIR, "과제B", "exoplanets_2220.json")

ZIP_OUT = os.path.join(BASE_DIR, "과제B", "과제B_신재원_패키지.zip")

print("과제 B 패키지 압축 시작...")
with zipfile.ZipFile(ZIP_OUT, 'w', zipfile.ZIP_DEFLATED) as zf:
    zf.write(SRC_APP_HTML, arcname="index.html")
    zf.write(SRC_README, arcname="README.md")
    zf.write(SRC_SUBMISSION, arcname="과제B_제출서.md")
    zf.write(SRC_DATA, arcname="data/exoplanets_2220.json")

print(f"압축 완료: {ZIP_OUT} (크기: {os.path.getsize(ZIP_OUT):,} bytes)")
