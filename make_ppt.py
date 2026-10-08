import os
import sys
from PIL import Image, ImageDraw, ImageFont
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

FONT_PATH_BOLD = "C:\\Windows\\Fonts\\malgunbd.ttf"
FONT_PATH_REG = "C:\\Windows\\Fonts\\malgun.ttf"

def get_font(bold=False, size=16):
    path = FONT_PATH_BOLD if bold else FONT_PATH_REG
    if not os.path.exists(path):
        path = FONT_PATH_REG
    return ImageFont.truetype(path, size)

def annotate_screenshot():
    base_img_path = "screenshot.png"
    if not os.path.exists(base_img_path):
        print(f"Error: {base_img_path} not found.")
        return None

    img = Image.open(base_img_path).convert("RGBA")
    w, h = img.size
    overlay = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)

    font_badge = get_font(bold=True, size=24)
    font_text = get_font(bold=True, size=18)

    # 1. 상단 단일행 헤더 영역
    draw.rounded_rectangle([15, 6, w - 15, 54], radius=10, outline=(37, 99, 235, 240), width=4)
    # 핀 ①
    draw.ellipse([30, 62, 70, 102], fill=(37, 99, 235, 245), outline=(255, 255, 255, 255), width=2)
    draw.text((43, 68), "1", font=font_badge, fill=(255, 255, 255, 255))
    draw.line([(50, 62), (50, 54)], fill=(37, 99, 235, 245), width=4)
    draw.rounded_rectangle([78, 65, 480, 99], radius=8, fill=(37, 99, 235, 240))
    draw.text((90, 71), "1. 상단 단일행 검색 & 저장/보관함", font=font_text, fill=(255, 255, 255, 255))

    # 2. 좌측 캘린더 영역
    draw.rounded_rectangle([180, 130, 890, 790], radius=12, outline=(79, 70, 229, 240), width=4)
    # 핀 ②
    draw.ellipse([125, 145, 165, 185], fill=(79, 70, 229, 245), outline=(255, 255, 255, 255), width=2)
    draw.text((138, 151), "2", font=font_badge, fill=(255, 255, 255, 255))
    draw.line([(165, 165), (180, 165)], fill=(79, 70, 229, 245), width=4)
    draw.rounded_rectangle([20, 195, 175, 260], radius=8, fill=(79, 70, 229, 235))
    draw.text((28, 202), "2. 대형 캘린더", font=font_text, fill=(255, 255, 255, 255))
    draw.text((28, 228), "• 3단계 역산 로드맵\n• 쉬는날 클릭 재배치", font=get_font(bold=False, size=13), fill=(224, 231, 255, 255))

    # 3. 우측 지연 재배치 배너
    draw.rounded_rectangle([920, 145, 1410, 225], radius=10, outline=(217, 119, 6, 240), width=4)
    # 핀 ③
    draw.ellipse([1425, 155, 1465, 195], fill=(217, 119, 6, 245), outline=(255, 255, 255, 255), width=2)
    draw.text((1438, 161), "3", font=font_badge, fill=(255, 255, 255, 255))
    draw.line([(1425, 175), (1410, 175)], fill=(217, 119, 6, 245), width=4)

    # 4. 우측 상세 패널
    draw.rounded_rectangle([920, 235, 1410, 790], radius=12, outline=(5, 150, 105, 240), width=4)
    # 핀 ④
    draw.ellipse([1425, 310, 1465, 350], fill=(5, 150, 105, 245), outline=(255, 255, 255, 255), width=2)
    draw.text((1438, 316), "4", font=font_badge, fill=(255, 255, 255, 255))
    draw.line([(1425, 330), (1410, 330)], fill=(5, 150, 105, 245), width=4)

    result = Image.alpha_composite(img, overlay).convert("RGB")
    out_path = "screenshot_annotated.png"
    result.save(out_path, quality=95)
    print(f"[1/3] Annotated screenshot created: {out_path}")
    return out_path

def build_presentation():
    annotated_img = annotate_screenshot()

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    FONT_FAMILY = "Malgun Gothic"
    COLOR_DARK = RGBColor(30, 41, 59)      # Slate 800
    COLOR_MUTED = RGBColor(100, 116, 139)  # Slate 500
    COLOR_BLUE = RGBColor(37, 99, 235)     # Blue 600
    COLOR_INDIGO = RGBColor(79, 70, 229)   # Indigo 600
    COLOR_AMBER = RGBColor(217, 119, 6)    # Amber 600
    COLOR_EMERALD = RGBColor(5, 150, 105)  # Emerald 600
    COLOR_CARD_BG = RGBColor(248, 250, 252)# Slate 50
    COLOR_BORDER = RGBColor(226, 232, 240) # Slate 200

    # -------------------------------------------------------------------------
    # SLIDE 1: 프로젝트 개요 및 사용 스킬/도구 (Tech Stack & Architecture)
    # -------------------------------------------------------------------------
    slide1 = prs.slides.add_slide(blank_layout)

    # 뱃지
    shape_badge = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.6), Inches(2.3), Inches(0.36))
    shape_badge.fill.solid()
    shape_badge.fill.fore_color.rgb = RGBColor(239, 246, 255)
    shape_badge.line.color.rgb = RGBColor(191, 219, 254)
    tf_b = shape_badge.text_frame
    p_b = tf_b.paragraphs[0]
    p_b.text = "PROJECT OVERVIEW"
    p_b.font.name = FONT_FAMILY
    p_b.font.size = Pt(11)
    p_b.font.bold = True
    p_b.font.color.rgb = COLOR_BLUE
    p_b.alignment = PP_ALIGN.CENTER

    # 타이틀
    tb_title = slide1.shapes.add_textbox(Inches(0.8), Inches(1.05), Inches(11.7), Inches(1.15))
    tf_t = tb_title.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = "수험생 맞춤형 자격증 시험 스케줄링 SaaS 웹 앱"
    p_t.font.name = FONT_FAMILY
    p_t.font.size = Pt(26)
    p_t.font.bold = True
    p_t.font.color.rgb = COLOR_DARK

    p_sub = tf_t.add_paragraph()
    p_sub.text = "시험일까지의 기간을 역산하여 3단계 맞춤 커리큘럼을 자동 편성하고 지연 일정을 능동 재배치하는 스마트 학습 솔루션"
    p_sub.font.name = FONT_FAMILY
    p_sub.font.size = Pt(13)
    p_sub.font.color.rgb = COLOR_MUTED
    p_sub.space_before = Pt(4)

    # 4대 카드 섹션
    card_w = Inches(5.65)
    card_h = Inches(2.2)
    col1_x = Inches(0.8)
    col2_x = Inches(6.85)
    row1_y = Inches(2.3)
    row2_y = Inches(4.7)

    cards_data = [
        {
            "x": col1_x, "y": row1_y, "title": "[기획 의도] 개발 배경 및 핵심 가치", "color": COLOR_BLUE,
            "bullets": [
                "수험 일정 실패 방지: 시험일까지 쉬는 날을 제외한 '순수 유효 학습일' 자동 역산",
                "3대 자격증 커리큘럼 표준화: 정보처리기사, 정보보안기사, 전기기사 정규 5개 과목 완비",
                "작심삼일 극복: 미완료 학습을 다가오는 휴식일 또는 잔여 일정에 자동 만회·재분배"
            ],
            "footer": "대상: 자격증 수험생 전체  |  기대효과: 완주율 극대화 및 학습 스트레스 감소"
        },
        {
            "x": col2_x, "y": row1_y, "title": "[프론트엔드] 반응형 UI & 인터랙션 스킬", "color": COLOR_INDIGO,
            "bullets": [
                "7:5 반응형 스플릿 레이아웃: 대형 월간 캘린더와 우측 Sticky 일일 상세 패널 동기화",
                "Tailwind CSS & 모던 스타일: 정기 휴식일 스트라이프 패턴 및 과목별 테마 뱃지",
                "즉각적 반응성: 체크박스 완료 토글, 회독수 증감(-1/+1) 시 낙관적 UI 업데이트"
            ],
            "footer": "기술 스택: HTML5, Tailwind CSS, JavaScript (ES6+), React/Next.js 컴포넌트"
        },
        {
            "x": col1_x, "y": row2_y, "title": "[알고리즘] 가중치 스케줄링 & 지연 복구 엔진", "color": COLOR_AMBER,
            "bullets": [
                "난이도×출제빈도 가중치: 과목 난이도(상/중/하)와 기출빈출(★) 점수 기반 학습량 산출",
                "• 3단계 역산 로드맵: 1단계 개념(50%) ▶ 2단계 압축(30%) ▶ 3단계 기출파이널(20%)",
                "스마트 재배치 모드: [휴식일 보충일 전환] 또는 [잔여 기간 균등 분할] 선택 지원"
            ],
            "footer": "핵심 로직: 가중치 역산 엔진  |  안전 장치: 회독수 최소 1회독 방어"
        },
        {
            "x": col2_x, "y": row2_y, "title": "[데이터/인프라] 영속성 보관함 & 배포 파이프라인", "color": COLOR_EMERALD,
            "bullets": [
                "다중 스케줄 보관함: 브라우저 로컬 저장소에 자격증별 다중 일정 보관 및 즉시 복원",
                "JSON 백업/가져오기: 기기 간 스케줄 파일 다운로드/업로드 및 영구 보관 지원",
                "클라우드 CI/CD: Vercel Serverless 글로벌 배포 및 GitHub 자동 연동"
            ],
            "footer": "저장: LocalStorage & JSON Blob  |  배포: https://skt-aleph-gilt.vercel.app/"
        }
    ]

    for c in cards_data:
        box = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c["x"], c["y"], card_w, card_h)
        box.fill.solid()
        box.fill.fore_color.rgb = COLOR_CARD_BG
        box.line.color.rgb = COLOR_BORDER
        box.line.width = Pt(1)

        tf = box.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_right = Inches(0.25)
        tf.margin_top = Inches(0.2)
        tf.margin_bottom = Inches(0.15)

        p_ct = tf.paragraphs[0]
        p_ct.text = c["title"]
        p_ct.font.name = FONT_FAMILY
        p_ct.font.size = Pt(13.5)
        p_ct.font.bold = True
        p_ct.font.color.rgb = c["color"]

        for b in c["bullets"]:
            p_b = tf.add_paragraph()
            p_b.text = f"• {b}"
            p_b.font.name = FONT_FAMILY
            p_b.font.size = Pt(10.5)
            p_b.font.color.rgb = COLOR_DARK
            p_b.space_before = Pt(3)

        p_cf = tf.add_paragraph()
        p_cf.text = c["footer"]
        p_cf.font.name = FONT_FAMILY
        p_cf.font.size = Pt(9.5)
        p_cf.font.color.rgb = COLOR_MUTED
        p_cf.space_before = Pt(6)

    tb_foot1 = slide1.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(11.7), Inches(0.35))
    tf_f1 = tb_foot1.text_frame
    p_f1 = tf_f1.paragraphs[0]
    p_f1.text = "웹 앱 주소: https://skt-aleph-gilt.vercel.app/certiflow.html   |   GitHub: https://github.com/User-shin0328/skt-aleph   |   슬라이드 1/2"
    p_f1.font.name = FONT_FAMILY
    p_f1.font.size = Pt(9.5)
    p_f1.font.color.rgb = COLOR_MUTED

    # -------------------------------------------------------------------------
    # SLIDE 2: 서비스 화면 구성 및 화살표 기능 설명 (UI Map & Features)
    # -------------------------------------------------------------------------
    slide2 = prs.slides.add_slide(blank_layout)

    # 상단 뱃지
    shape_badge2 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.5), Inches(2.3), Inches(0.36))
    shape_badge2.fill.solid()
    shape_badge2.fill.fore_color.rgb = RGBColor(236, 253, 245)
    shape_badge2.line.color.rgb = RGBColor(167, 243, 208)
    tf_b2 = shape_badge2.text_frame
    p_b2 = tf_b2.paragraphs[0]
    p_b2.text = "PAGE FUNCTION & UI MAP"
    p_b2.font.name = FONT_FAMILY
    p_b2.font.size = Pt(11)
    p_b2.font.bold = True
    p_b2.font.color.rgb = COLOR_EMERALD
    p_b2.alignment = PP_ALIGN.CENTER

    # 타이틀
    tb_title2 = slide2.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(11.7), Inches(0.6))
    tf_t2 = tb_title2.text_frame
    p_t2 = tf_t2.paragraphs[0]
    p_t2.text = "CertiFlow 실제 서비스 화면 및 주요 기능 안내"
    p_t2.font.name = FONT_FAMILY
    p_t2.font.size = Pt(22)
    p_t2.font.bold = True
    p_t2.font.color.rgb = COLOR_DARK

    # 좌측: 스크린샷 이미지 (1600x1050 비율 고려 배치)
    img_x = Inches(0.8)
    img_y = Inches(1.6)
    img_w = Inches(7.4)
    if os.path.exists("screenshot_annotated.png"):
        slide2.shapes.add_picture("screenshot_annotated.png", img_x, img_y, width=img_w)
    elif os.path.exists("screenshot.png"):
        slide2.shapes.add_picture("screenshot.png", img_x, img_y, width=img_w)

    # 우측: 4대 핵심 기능 콜아웃 카드
    callout_x = Inches(8.45)
    callout_w = Inches(4.05)
    callout_h = Inches(1.18)

    callouts = [
        {
            "y": Inches(1.6), "num": "1", "title": "상단 단일행 제어 & 저장 바", "color": COLOR_BLUE,
            "desc": "• 자격증 실시간 검색 (미지원 자격증 엄격 필터링)\n• 3대 자격증(정보처리/보안/전기) 원클릭 전환\n• 내 스케줄 브라우저 저장 & 다중 보관함/JSON 백업"
        },
        {
            "y": Inches(2.9), "num": "2", "title": "대형 인터랙티브 캘린더", "color": COLOR_INDIGO,
            "desc": "• 시험일 역산 3단계 로드맵 (개념 ▶ 핵심회독 ▶ 기출)\n• 커피/연필 아이콘 클릭 시 쉬는 날 즉시 재배치\n• 과목별 테마 컬러 및 단원별 난이도 뱃지 표기"
        },
        {
            "y": Inches(4.2), "num": "3", "title": "스마트 지연 재조정 알림", "color": COLOR_AMBER,
            "desc": "• 어제 완료하지 못한 밀린 과제 자동 감지\n• [휴식일 보충일 전환] 또는 [잔여 기간 균등 분할]\n• 수험생의 학습 스트레스 없는 유연한 복구"
        },
        {
            "y": Inches(5.5), "num": "4", "title": "일자별 상세 학습 패널", "color": COLOR_EMERALD,
            "desc": "• 당일 진도율 실시간 프로그레스 바 연동\n• 단원별 난이도(상/중/하) 및 빈출도(★) 점수 표기\n• -1회독 / +1회독 카운터 & 핵심 암기 아코디언"
        }
    ]

    for item in callouts:
        cbox = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, callout_x, item["y"], callout_w, callout_h)
        cbox.fill.solid()
        cbox.fill.fore_color.rgb = COLOR_CARD_BG
        cbox.line.color.rgb = item["color"]
        cbox.line.width = Pt(1.5)

        ctf = cbox.text_frame
        ctf.word_wrap = True
        ctf.margin_left = Inches(0.18)
        ctf.margin_right = Inches(0.18)
        ctf.margin_top = Inches(0.12)
        ctf.margin_bottom = Inches(0.1)

        p_h = ctf.paragraphs[0]
        p_h.text = f"[{item['num']}] {item['title']}"
        p_h.font.name = FONT_FAMILY
        p_h.font.size = Pt(12)
        p_h.font.bold = True
        p_h.font.color.rgb = item["color"]

        for line in item["desc"].split("\n"):
            p_d = ctf.add_paragraph()
            p_d.text = line
            p_d.font.name = FONT_FAMILY
            p_d.font.size = Pt(9.5)
            p_d.font.color.rgb = COLOR_DARK
            p_d.space_before = Pt(2)

    tb_foot2 = slide2.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(11.7), Inches(0.35))
    tf_f2 = tb_foot2.text_frame
    p_f2 = tf_f2.paragraphs[0]
    p_f2.text = "웹 앱 주소: https://skt-aleph-gilt.vercel.app/certiflow.html   |   GitHub: https://github.com/User-shin0328/skt-aleph   |   슬라이드 2/2"
    p_f2.font.name = FONT_FAMILY
    p_f2.font.size = Pt(9.5)
    p_f2.font.color.rgb = COLOR_MUTED

    ppt_path = "나만의앱만들기_발표자료.pptx"
    prs.save(ppt_path)
    print(f"[2/4] Presentation successfully created: {ppt_path}")
    return ppt_path

def render_slide1_image():
    # 슬라이드 1 미리보기 고해상도 이미지 (1920x1080)
    w, h = 1920, 1080
    img = Image.new("RGB", (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    f_title = get_font(bold=True, size=46)
    f_sub = get_font(bold=False, size=22)
    f_badge = get_font(bold=True, size=18)
    f_card_t = get_font(bold=True, size=24)
    f_bullet = get_font(bold=False, size=18)
    f_foot = get_font(bold=False, size=16)

    # 상단 뱃지
    draw.rounded_rectangle([100, 70, 360, 115], radius=20, fill=(239, 246, 255), outline=(191, 219, 254), width=2)
    draw.text((120, 80), "PROJECT OVERVIEW", font=f_badge, fill=(37, 99, 235))

    # 타이틀 & 서브타이틀
    draw.text((100, 130), "수험생 맞춤형 자격증 시험 스케줄링 SaaS 웹 앱", font=f_title, fill=(24, 24, 27))
    draw.text((100, 195), "시험일까지의 기간을 역산하여 3단계 맞춤 커리큘럼을 자동 편성하고 지연 일정을 능동 재배치하는 스마트 학습 솔루션", font=f_sub, fill=(113, 113, 122))

    # 4대 카드 섹션 (2x2)
    cards = [
        {
            "box": [100, 270, 930, 590], "title": "[기획 의도] 개발 배경 및 핵심 가치", "color": (37, 99, 235),
            "lines": [
                "• 수험 일정 실패 방지: 시험일까지 쉬는 날을 제외한 '순수 유효 학습일' 자동 역산",
                "• 3대 자격증 커리큘럼 표준화: 정보처리기사, 정보보안기사, 전기기사 정규 5개 과목 완비",
                "• 작심삼일 극복: 미완료 학습을 다가오는 휴식일 또는 잔여 일정에 자동 만회·재분배"
            ],
            "footer": "대상: 자격증 수험생 전체  |  기대효과: 완주율 극대화 및 학습 스트레스 감소"
        },
        {
            "box": [980, 270, 1820, 590], "title": "[프론트엔드] 반응형 UI & 인터랙션 스킬", "color": (79, 70, 229),
            "lines": [
                "• 7:5 반응형 스플릿 레이아웃: 대형 월간 캘린더와 우측 Sticky 일일 상세 패널 동기화",
                "• Tailwind CSS & 모던 스타일: 정기 휴식일 스트라이프 패턴 및 과목별 테마 뱃지",
                "• 즉각적 반응성: 체크박스 완료 토글, 회독수 증감(-1/+1) 시 낙관적 UI 업데이트"
            ],
            "footer": "기술 스택: HTML5, Tailwind CSS, JavaScript (ES6+), React/Next.js 컴포넌트"
        },
        {
            "box": [100, 630, 930, 950], "title": "[알고리즘] 가중치 스케줄링 & 지연 복구 엔진", "color": (217, 119, 6),
            "lines": [
                "• 난이도×출제빈도 가중치: 과목 난이도(상/중/하)와 기출빈출(★) 점수 기반 학습량 산출",
                "• 3단계 역산 로드맵: 1단계 개념(50%) ▶ 2단계 압축(30%) ▶ 3단계 기출파이널(20%)",
                "• 스마트 재배치 모드: [휴식일 보충일 전환] 또는 [잔여 기간 균등 분할] 선택 지원"
            ],
            "footer": "핵심 로직: 가중치 역산 엔진  |  안전 장치: 회독수 최소 1회독 방어"
        },
        {
            "box": [980, 630, 1820, 950], "title": "[데이터/인프라] 영속성 보관함 & 배포 파이프라인", "color": (5, 150, 105),
            "lines": [
                "• 다중 스케줄 보관함: 브라우저 로컬 저장소에 자격증별 다중 일정 보관 및 즉시 복원",
                "• JSON 백업/가져오기: 기기 간 스케줄 파일 다운로드/업로드 및 영구 보관 지원",
                "• 클라우드 CI/CD: Vercel Serverless 글로벌 배포 및 GitHub 자동 연동"
            ],
            "footer": "저장: LocalStorage & JSON Blob  |  배포: https://skt-aleph-gilt.vercel.app/"
        }
    ]

    for c in cards:
        b = c["box"]
        draw.rounded_rectangle(b, radius=18, fill=(248, 250, 252), outline=(226, 232, 240), width=2)
        draw.text((b[0] + 35, b[1] + 30), c["title"], font=f_card_t, fill=c["color"])
        y = b[1] + 85
        for l in c["lines"]:
            draw.text((b[0] + 35, y), l, font=f_bullet, fill=(30, 41, 59))
            y += 42
        draw.line([(b[0] + 35, b[3] - 55), (b[2] - 35, b[3] - 55)], fill=(226, 232, 240), width=1)
        draw.text((b[0] + 35, b[3] - 42), c["footer"], font=f_foot, fill=(100, 116, 139))

    # 하단 푸터
    draw.line([(100, 990), (1820, 990)], fill=(226, 232, 240), width=1)
    draw.text((100, 1015), "웹 앱 주소: https://skt-aleph-gilt.vercel.app/certiflow.html   |   GitHub: https://github.com/User-shin0328/skt-aleph   |   슬라이드 1/2", font=f_foot, fill=(148, 163, 184))

    out_path = "slide1_preview.png"
    img.save(out_path, quality=95)
    print(f"[3/4] Slide 1 preview image created: {out_path}")
    return out_path

def render_slide2_image():
    # 슬라이드 2 미리보기 고해상도 이미지 (1920x1080)
    w, h = 1920, 1080
    img = Image.new("RGB", (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    f_title = get_font(bold=True, size=42)
    f_sub = get_font(bold=False, size=20)
    f_badge = get_font(bold=True, size=18)
    f_card_t = get_font(bold=True, size=22)
    f_bullet = get_font(bold=False, size=16)
    f_foot = get_font(bold=False, size=16)

    # 상단 뱃지
    draw.rounded_rectangle([100, 50, 420, 95], radius=20, fill=(236, 253, 245), outline=(167, 243, 208), width=2)
    draw.text((120, 60), "PAGE FUNCTION & UI MAP", font=f_badge, fill=(5, 150, 105))

    # 타이틀
    draw.text((100, 110), "CertiFlow 실제 서비스 화면 및 주요 기능 안내", font=f_title, fill=(24, 24, 27))
    draw.text((100, 165), "핵심 화면 스크린샷과 화살표 가이드를 통한 4대 주요 기능 맵핑", font=f_sub, fill=(113, 113, 122))

    # 좌측: 스크린샷 이미지 삽입 (x: 100, y: 220, w: 1050, h: 740)
    if os.path.exists("screenshot_annotated.png"):
        shot = Image.open("screenshot_annotated.png")
        shot_resized = shot.resize((1050, 740), Image.Resampling.LANCZOS)
        img.paste(shot_resized, (100, 220))
        draw.rectangle([100, 220, 1150, 960], outline=(203, 213, 225), width=2)

    # 우측: 4대 핵심 기능 콜아웃 카드 (x: 1180, w: 640)
    callouts = [
        {
            "box": [1180, 220, 1820, 385], "num": "[1]", "title": "상단 단일행 제어 & 저장 바", "color": (37, 99, 235),
            "lines": [
                "• 자격증 실시간 검색 (미지원 자격증 엄격 필터링)",
                "• 3대 자격증 (정보처리/보안/전기) 원클릭 전환",
                "• 내 스케줄 브라우저 저장 & 다중 보관함/JSON 백업"
            ]
        },
        {
            "box": [1180, 410, 1820, 575], "num": "[2]", "title": "대형 인터랙티브 캘린더", "color": (79, 70, 229),
            "lines": [
                "• 시험일 역산 3단계 로드맵 (개념 ▶ 회독 ▶ 기출)",
                "• 커피/연필 아이콘 클릭 시 쉬는 날 즉시 재배치",
                "• 과목별 고유 테마 컬러 및 단원별 난이도 뱃지"
            ]
        },
        {
            "box": [1180, 600, 1820, 765], "num": "[3]", "title": "스마트 지연 재조정 알림", "color": (217, 119, 6),
            "lines": [
                "• 어제 완료하지 못한 밀린 과제 자동 감지",
                "• [휴식일 보충일 전환] 또는 [잔여 기간 균등 분할]",
                "• 수험생의 학습 스트레스 없는 유연한 복구 시스템"
            ]
        },
        {
            "box": [1180, 790, 1820, 955], "num": "[4]", "title": "일자별 상세 학습 패널", "color": (5, 150, 105),
            "lines": [
                "• 당일 진도율 실시간 프로그레스 바 연동",
                "• 단원별 난이도(상/중/하) 및 빈출도(★) 점수 표기",
                "• -1회독 / +1회독 카운터 & 핵심 암기 아코디언"
            ]
        }
    ]

    for item in callouts:
        b = item["box"]
        draw.rounded_rectangle(b, radius=14, fill=(248, 250, 252), outline=item["color"], width=2)
        draw.text((b[0] + 25, b[1] + 18), f"{item['num']} {item['title']}", font=f_card_t, fill=item["color"])
        y = b[1] + 55
        for l in item["lines"]:
            draw.text((b[0] + 25, y), l, font=f_bullet, fill=(30, 41, 59))
            y += 28

    # 하단 푸터
    draw.line([(100, 990), (1820, 990)], fill=(226, 232, 240), width=1)
    draw.text((100, 1015), "웹 앱 주소: https://skt-aleph-gilt.vercel.app/certiflow.html   |   GitHub: https://github.com/User-shin0328/skt-aleph   |   슬라이드 2/2", font=f_foot, fill=(148, 163, 184))

    out_path = "slide2_preview.png"
    img.save(out_path, quality=95)
    print(f"[4/4] Slide 2 preview image created: {out_path}")
    return out_path

if __name__ == "__main__":
    build_presentation()
    render_slide1_image()
    render_slide2_image()
