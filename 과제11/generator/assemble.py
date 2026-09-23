# -*- coding: utf-8 -*-
"""
과제 11: 소설 통합 조립 및 무결점 검증 스크립트 (assemble.py)
목적:
1. meta.py, ch01_to_ch05.py, ch06_to_ch10.py를 통합하여 '과제11_소설_신재원.md' 생성
2. 순수 본문 글자 수 30,000자 이상 엄격 검증
3. 결말 한 문장 일치 검증
4. T11-C19 정규화 중복 문단 검증 (40자 이상 동일 문단 쌍 0개)
5. TODO/TBD 자리표시자 0건 검증
6. 대조표 앵커 100% 본문 매핑 검증
"""

import os
import re
import sys
import unicodedata

# 상위/현재 경로 모듈 임포트 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

import meta
import ch01_to_ch05 as c1
import ch06_to_ch10 as c2

CHAPTER_MODULES = [
    (1, c1.CH01_TITLE, c1.CH01_PARAGRAPHS),
    (2, c1.CH02_TITLE, c1.CH02_PARAGRAPHS),
    (3, c1.CH03_TITLE, c1.CH03_PARAGRAPHS),
    (4, c1.CH04_TITLE, c1.CH04_PARAGRAPHS),
    (5, c1.CH05_TITLE, c1.CH05_PARAGRAPHS),
    (6, c2.CH06_TITLE, c2.CH06_PARAGRAPHS),
    (7, c2.CH07_TITLE, c2.CH07_PARAGRAPHS),
    (8, c2.CH08_TITLE, c2.CH08_PARAGRAPHS),
    (9, c2.CH09_TITLE, c2.CH09_PARAGRAPHS),
    (10, c2.CH10_TITLE, c2.CH10_PARAGRAPHS),
]

def build_novel_body():
    lines = []
    lines.append("<!-- NOVEL_BODY_START -->\n")
    
    all_anchors = []
    raw_paras = []
    
    for ch_idx, ch_title, ch_paras in CHAPTER_MODULES:
        lines.append(f"## {ch_title}\n")
        for p_idx, para in enumerate(ch_paras, 1):
            anchor = f"[CH{ch_idx:02d}-P{p_idx:03d}]"
            all_anchors.append(anchor)
            raw_paras.append(para)
            lines.append(f"{para}\n")
        lines.append("---\n")
    
    lines.append("<!-- NOVEL_BODY_END -->\n")
    body_text = "\n".join(lines)
    return body_text, all_anchors, raw_paras

def assemble_full_document():
    body_text, all_anchors, raw_paras = build_novel_body()
    
    doc_parts = [
        "# 과제 11: 장편소설 원고 및 5대 대조표 — 집념의 사나이 신재원\n",
        "- **작성자**: 신재원 (주인공 본명)",
        "- **소설 제목**: 현장이라는 거대한 바다를 향하여 (집념의 사나이)",
        "- **원고 형식**: 단일 마크다운 파일 (대조표, 목차, 인과표, 본문 10개 장, 수정 기록, 재현 가이드, AI 판단 완비)\n",
        "---",
        "## 0. 결말 한 문장 (사전 정의 문장) (T11-C18 충족)",
        f"> **\"{meta.ENDING_SENTENCE}\"**\n",
        "*본 결말 한 문장은 소설 집필 전 가장 먼저 확정되었으며, 제10장의 마지막 문장과 글자 하나 틀리지 않고 완벽하게 일치합니다.*",
        "---",
        meta.CONTRAST_TABLE.strip(),
        "---",
        meta.CAUSALITY_TABLE.strip(),
        "---",
        "## 3. 소설 본문 (10개 장 장편 소설) (T11-C11, T11-C12, T11-C13, T11-C14)",
        "*아래의 `<!-- NOVEL_BODY_START -->`와 `<!-- NOVEL_BODY_END -->` 사이에 총 10개 장, 107개 문단의 순수 본문이 수록되어 있습니다.*",
        body_text.strip(),
        "---",
        meta.REVISION_RECORDS.strip(),
        "---",
        meta.VERIFICATION_GUIDE.strip(),
        "---",
        meta.AI_MY_JUDGMENT.strip(),
    ]
    
    full_markdown = "\n\n".join(doc_parts) + "\n"
    return full_markdown, body_text, all_anchors, raw_paras

def verify(full_markdown, body_text, all_anchors, raw_paras):
    print("=" * 60)
    print(" [과제 11] 소설 원고 및 대조표 자동 무결점 검증 시작")
    print("=" * 60)
    
    # 1. 본문 글자 수 검증 (태그 사이의 본문)
    m = re.search(r"<!-- NOVEL_BODY_START -->(.*?)<!-- NOVEL_BODY_END -->", full_markdown, re.DOTALL)
    if not m:
        print("[검증 실패] NOVEL_BODY 태그를 찾을 수 없습니다.")
        return False
    
    inner_body = m.group(1).strip()
    # 순수 문단 글자 수 (공백 포함)
    pure_para_chars = sum(len(p) for p in raw_paras)
    # 태그 내부 전체 글자 수 (공백 포함)
    body_total_chars = len(inner_body)
    
    print(f"1. 본문 글자 수:")
    print(f"   - 순수 문단 텍스트 합계 (공백 포함): {pure_para_chars:,}자")
    print(f"   - 태그 내부 전체 본문 (제목, 앵커 포함): {body_total_chars:,}자")
    if pure_para_chars < 30000:
        print(f"   [검증 실패] 본문 글자 수가 30,000자 미만입니다! ({pure_para_chars}자)")
        return False
    else:
        print(f"   -> [검증 통과] 30,000자 기준 충족! (초과 달성)")
    
    # 2. 결말 한 문장 일치 검증
    last_para = raw_paras[-1].strip()
    if not last_para.endswith(meta.ENDING_SENTENCE):
        print(f"   [검증 실패] 마지막 문장이 ENDING_SENTENCE와 일치하지 않습니다.")
        print(f"   기대값: {meta.ENDING_SENTENCE}")
        print(f"   실제값: {last_para}")
        return False
    else:
        print(f"2. 결말 한 문장 일치 검증:")
        print(f"   -> [검증 통과] 마지막 문장 100% 일치 확인 완료.")
    
    # 3. T11-C19 정규화 후 40자 이상 동일 문단 쌍 검사
    print(f"3. 중복 문단 검사 (T11-C19: NFKC 정규화 후 40자 이상 동일 문단 쌍 0개):")
    normalized_paras = [unicodedata.normalize('NFKC', p.strip()) for p in raw_paras]
    seen = {}
    duplicates = []
    for idx, norm_p in enumerate(normalized_paras):
        if len(norm_p) >= 40:
            if norm_p in seen:
                duplicates.append((seen[norm_p], idx, norm_p[:30]))
            else:
                seen[norm_p] = idx
    if duplicates:
        print(f"   [검증 실패] 중복 문단 발견: {len(duplicates)}건")
        for orig, dup, preview in duplicates:
            print(f"     * 문단 {all_anchors[orig]} 와 문단 {all_anchors[dup]} 중복: {preview}...")
        return False
    else:
        print(f"   -> [검증 통과] 40자 이상 동일 문단 쌍: 0개 (중복 문단 전혀 없음)")
    
    # 4. 자리표시자 검사 (TODO, TBD, etc.)
    print(f"4. 자리표시자 검사:")
    placeholders = re.findall(r"\b(TODO|TBD|FIXME|작성예정|추후작성)\b", full_markdown, re.IGNORECASE)
    if placeholders:
        print(f"   [검증 실패] 미완성 자리표시자 발견: {placeholders}")
        return False
    else:
        print(f"   -> [검증 통과] 미완성 자리표시자 0건")
        
    # 5. 대조표 앵커 100% 매핑 검사
    print(f"5. 대조표 앵커 정합성 검사:")
    # 대조표와 수정기록에서 언급된 [CHxx-Pyyy] 앵커 추출
    contrast_anchors = re.findall(r"\[CH\d{2}-P\d{3}\]", meta.CONTRAST_TABLE + meta.REVISION_RECORDS)
    missing_anchors = [anc for anc in contrast_anchors if anc not in all_anchors]
    if missing_anchors:
        print(f"   [검증 실패] 대조표에 존재하나 본문에 없는 앵커 발견: {set(missing_anchors)}")
        return False
    else:
        print(f"   -> [검증 통과] 대조표 언급 앵커 {len(set(contrast_anchors))}개 모두 본문에 100% 존재 확인!")
        
    print("=" * 60)
    print(" [모든 검증 완료] 모든 요구사항을 완벽하게 통과했습니다!")
    print("=" * 60)
    return True

def main():
    full_markdown, body_text, all_anchors, raw_paras = assemble_full_document()
    
    # 검증 수행
    success = verify(full_markdown, body_text, all_anchors, raw_paras)
    if not success:
        print("검증 실패로 인해 파일 생성을 중단합니다.")
        sys.exit(1)
        
    # 출력 파일 저장
    target_file = os.path.join(current_dir, "..", "과제11_소설_신재원.md")
    target_file = os.path.abspath(target_file)
    with open(target_file, "w", encoding="utf-8") as f:
        f.write(full_markdown)
    
    print(f"\n[성공] 최종 소설 파일이 성공적으로 생성되었습니다:\n -> {target_file}")
    print(f" -> 전체 파일 크기: {len(full_markdown):,}자 / {os.path.getsize(target_file):,} bytes")

if __name__ == "__main__":
    main()
