# -*- coding: utf-8 -*-
"""
과제 B: ExoForge 단일 HTML 애플리케이션 빌더
2,220개 외계행성 데이터와 반응형 HUD 인터페이스를 결합하여
'exoforge.html' 및 '과제B/app/index.html'을 생성합니다.
"""

import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_JSON = os.path.join(BASE_DIR, "과제B", "exoplanets_2220.json")
OUTPUT_ROOT_HTML = os.path.join(BASE_DIR, "exoforge.html")
OUTPUT_APP_DIR = os.path.join(BASE_DIR, "과제B", "app")
OUTPUT_APP_HTML = os.path.join(OUTPUT_APP_DIR, "index.html")

os.makedirs(OUTPUT_APP_DIR, exist_ok=True)

with open(DATA_JSON, "r", encoding="utf-8") as f:
    exoplanets_data = json.load(f)

print(f"로드된 행성 데이터: {len(exoplanets_data)} 개")
data_js_inline = json.dumps(exoplanets_data, separators=(',', ':'), ensure_ascii=False)

html_template = """<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>ExoForge: 골디락스를 찾아서 | NASA 외계행성 관측 데이터 시뮬레이터</title>
  
  <!-- Pretendard & Orbitron Fonts -->
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            space: {
              950: '#03050a',
              900: '#070a13',
              800: '#0c1120',
              700: '#141c33',
              600: '#1e294b'
            },
            cyan: {
              glow: '#00F2FE',
              dim: '#037c87'
            },
            emerald: {
              glow: '#10B981',
              dim: '#065f46'
            },
            gold: {
              glow: '#F59E0B',
              dim: '#92400e'
            }
          },
          fontFamily: {
            hud: ['Orbitron', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
            sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
          }
        }
      }
    }
  </script>

  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #070a13;
      color: #f1f5f9;
      font-family: 'Pretendard', -apple-system, sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(0, 242, 254, 0.04) 0%, transparent 40%),
        radial-gradient(circle at 85% 80%, rgba(16, 185, 129, 0.04) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.02) 0%, transparent 60%);
    }

    /* NASA HUD Glow Styles */
    .hud-glow-cyan {
      box-shadow: 0 0 15px rgba(0, 242, 254, 0.3), inset 0 0 10px rgba(0, 242, 254, 0.1);
    }
    .hud-glow-emerald {
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.35), inset 0 0 10px rgba(16, 185, 129, 0.1);
    }
    .hud-text-glow {
      text-shadow: 0 0 8px rgba(0, 242, 254, 0.6);
    }
    .hud-panel {
      background: rgba(12, 17, 32, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(0, 242, 254, 0.15);
    }
    .hud-panel:hover {
      border-color: rgba(0, 242, 254, 0.35);
    }

    /* Custom range slider */
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: #141c33;
      height: 6px;
      border-radius: 3px;
      outline: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #00F2FE;
      cursor: pointer;
      box-shadow: 0 0 10px #00F2FE;
      transition: transform 0.1s ease;
    }
    input[type=range]::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }

    /* Tab Button Styles */
    .tab-btn {
      position: relative;
      transition: all 0.2s ease;
    }
    .tab-btn.active {
      color: #00F2FE;
      background: rgba(0, 242, 254, 0.1);
      border-color: rgba(0, 242, 254, 0.6);
    }
    .tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 10%;
      width: 80%;
      height: 2px;
      background: #00F2FE;
      box-shadow: 0 0 8px #00F2FE;
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #070a13;
    }
    ::-webkit-scrollbar-thumb {
      background: #1e294b;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #00F2FE;
    }
  </style>
</head>
<body class="flex flex-col">

  <!-- ====================================================
       1. 최상단 NASA HUD 통합 헤더 & 논문 기반 배너
       ==================================================== -->
  <header class="hud-panel sticky top-0 z-50 border-b border-cyan-500/20 px-4 py-3">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      
      <!-- 좌측 로고 및 타이틀 -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-400/40 flex items-center justify-center hud-glow-cyan flex-shrink-0">
          <svg class="w-6 h-6 text-cyan-glow animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" stroke-width="1.5" stroke-dasharray="4 2" />
            <circle cx="12" cy="12" r="3" fill="#00F2FE" />
            <ellipse cx="12" cy="12" rx="9" ry="4" stroke-width="1" stroke="#10B981" transform="rotate(-30 12 12)" />
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-hud font-bold text-lg sm:text-xl tracking-wider text-white flex items-center gap-1.5">
              <span>EXO</span><span class="text-cyan-glow">FORGE</span>
              <span class="text-xs px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-mono font-normal">v2.4 OBSERVATORY</span>
            </h1>
            <span class="text-xs text-zinc-500 font-mono hidden sm:inline">|</span>
            <span class="text-xs text-emerald-400 font-mono hidden sm:inline">골디락스를 찾아서</span>
          </div>
          <p class="text-[11px] text-zinc-400 font-mono">
            NASA 2,220개 외계행성 데이터 기반 항성계 형성 시뮬레이터
          </p>
        </div>
      </div>

      <!-- 우측 빠른 도구 및 포트폴리오 링크 -->
      <div class="flex items-center gap-2 w-full md:w-auto justify-end text-xs font-mono">
        <a 
          href="https://github.com/User-shin0328/skt-aleph/blob/main/%EA%B3%BC%EC%A0%9C10/AI_%EC%9A%B0%EC%A3%BC%EC%97%B0%EA%B5%AC_%EB%85%BC%EB%AC%B8.md"
          target="_blank" 
          rel="noopener noreferrer"
          class="px-2.5 py-1.5 rounded bg-space-800 hover:bg-space-700 text-zinc-300 border border-zinc-700 hover:border-cyan-500 transition-colors flex items-center gap-1.5"
          title="과제 10 학술 논문 원문 읽기"
        >
          <svg class="w-3.5 h-3.5 text-[#ba9578]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          <span class="hidden sm:inline">논문 원문</span>
        </a>

        <a 
          href="/projects.html" 
          class="px-3 py-1.5 rounded bg-[#ba9578] hover:bg-[#a27b5c] text-black font-bold transition-all shadow-md flex items-center gap-1"
        >
          <span>&larr; 대표작 목록</span>
        </a>
      </div>

    </div>

    <!-- 논문 기반 '누구를 어떻게 돕는가' 한 문장 배너 (BRB-C01, BRB-C03 준수) -->
    <div class="max-w-7xl mx-auto mt-2 pt-2 border-t border-space-700/60 text-xs text-zinc-300 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-800 flex-shrink-0">
          RESEARCH CORE
        </span>
        <span class="text-zinc-400 font-mono">
          학술 논문: <strong class="text-white font-medium">별에 철이 많으면 행성도 더 커질까? (신재원 저)</strong>
        </span>
      </div>
      <p class="text-[11px] text-cyan-200/90 font-sans leading-relaxed">
        <strong>[앱의 목적]</strong> 천체물리학과 우주과학에 관심 있는 청소년 및 입문자가 외계행성의 탄생 환경을 탐구할 때, 이 앱이 NASA 2,220개 실제 관측 데이터와 핵 강착 모델을 바탕으로 모항성의 철 함량([Fe/H])이 거대 가스행성과 골디락스 행성의 형성에 미치는 영향을 시뮬레이션과 인터랙티브 차트로 즉시 검증하고 체험할 수 있도록 돕는다.
      </p>
    </div>
  </header>

  <!-- ====================================================
       2. 메인 대시보드 내비게이션 3대 탭
       ==================================================== -->
  <div class="max-w-7xl mx-auto w-full px-4 pt-4">
    <nav class="flex items-center gap-2 border-b border-space-700 pb-2 overflow-x-auto">
      <button 
        id="tabBtn1" 
        onclick="switchTab('tab1')" 
        class="tab-btn active px-4 py-2 rounded-lg font-mono text-xs sm:text-sm font-bold border border-transparent flex items-center gap-2 flex-shrink-0"
      >
        <span>🌌</span>
        <span>행성계 제작 시뮬레이터</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300">Stellar Forge</span>
      </button>

      <button 
        id="tabBtn2" 
        onclick="switchTab('tab2')" 
        class="tab-btn px-4 py-2 rounded-lg font-mono text-xs sm:text-sm font-bold text-zinc-400 hover:text-white border border-transparent flex items-center gap-2 flex-shrink-0"
      >
        <span>📊</span>
        <span>NASA 실제 데이터 탐색기</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-space-800 text-zinc-400">2,220 Exoplanets</span>
      </button>

      <button 
        id="tabBtn3" 
        onclick="switchTab('tab3')" 
        class="tab-btn px-4 py-2 rounded-lg font-mono text-xs sm:text-sm font-bold text-zinc-400 hover:text-white border border-transparent flex items-center gap-2 flex-shrink-0"
      >
        <span>🕵️‍♂️</span>
        <span>우주 탐정 퀴즈 & 승급</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300">Detective Quiz</span>
      </button>
    </nav>
  </div>

  <!-- ====================================================
       3. 메인 인터랙션 뷰포트
       ==================================================== -->
  <main class="max-w-7xl mx-auto w-full px-4 py-4 flex-grow flex flex-col">

    <!-- --------------------------------------------------
         [탭 1] 행성계 제작 시뮬레이터 (Stellar Forge)
         -------------------------------------------------- -->
    <section id="tab1" class="tab-content flex-grow flex flex-col space-y-4">
      
      <!-- 2단 레이아웃 (좌: 캔버스 뷰포트, 우: HUD 컨트롤 및 지표 패널) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-grow">
        
        <!-- 중앙 캔버스 뷰포트 (7컬럼) -->
        <div class="lg:col-span-7 hud-panel rounded-xl p-4 flex flex-col relative overflow-hidden">
          
          <!-- 뷰포트 상단 HUD 뱃지 -->
          <div class="flex items-center justify-between mb-2 z-10">
            <div class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-glow animate-ping"></span>
              <span class="font-hud text-xs text-cyan-glow tracking-widest uppercase">ORBITAL SIMULATOR [60 FPS]</span>
            </div>
            <div class="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <span class="flex items-center gap-1">
                <span class="w-3 h-1.5 rounded-full bg-emerald-500/40 border border-emerald-400"></span>
                <span>골디락스 존 (Habitable Zone)</span>
              </span>
              <button 
                onclick="toggleSimSpeed()" 
                id="speedBtn" 
                class="px-2 py-0.5 rounded bg-space-800 hover:bg-space-700 text-cyan-300 border border-space-600 transition-colors"
              >
                1.0x
              </button>
            </div>
          </div>

          <!-- 캔버스 컨테이너 -->
          <div class="relative w-full flex-grow min-h-[360px] sm:min-h-[440px] rounded-lg bg-space-950 border border-cyan-500/20 overflow-hidden flex items-center justify-center">
            <canvas id="simCanvas" class="w-full h-full cursor-crosshair"></canvas>
            
            <!-- 캔버스 위 오버레이 안내 -->
            <div id="simOverlayMsg" class="absolute bottom-3 left-3 pointer-events-none text-[11px] font-mono text-cyan-400/80 bg-space-900/80 px-2.5 py-1 rounded border border-cyan-500/30">
              궤도 공전 애니메이션 실행 중 · 행성에 마우스를 올리면 상세 물리량이 표시됩니다.
            </div>

            <!-- 행성 상세 툴팁 (동적 위치) -->
            <div id="simTooltip" class="hidden absolute pointer-events-none z-20 p-2.5 rounded-lg bg-space-900/95 border border-cyan-400 text-xs font-mono text-zinc-200 shadow-xl max-w-[200px]">
              <div id="tipName" class="font-bold text-cyan-glow border-b border-space-700 pb-1 mb-1">Planet</div>
              <div id="tipType" class="text-emerald-400 text-[11px]">Type</div>
              <div id="tipDist" class="text-zinc-400 text-[10px]">Orbit: 1.0 AU</div>
              <div id="tipMass" class="text-zinc-400 text-[10px]">Mass: 1.0 M_E</div>
            </div>
          </div>

          <!-- 뷰포트 하단 상태 로그 -->
          <div class="mt-3 pt-2 border-t border-space-700/60 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 gap-2">
            <div id="simSummaryStatus" class="flex items-center gap-2 text-zinc-300">
              <span>생성된 행성: <strong class="text-white font-mono" id="statPlanetCount">4개</strong></span>
              <span>•</span>
              <span>목성형 가스행성: <strong class="text-amber-400" id="statGiantCount">1개</strong></span>
              <span>•</span>
              <span>골디락스 후보: <strong class="text-emerald-400" id="statGoldiCount">1개</strong></span>
            </div>
            <button 
              onclick="forgeNewSystem()" 
              class="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-space-950 font-hud font-bold text-xs tracking-wider transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span>항성계 생성 (FORGE)</span>
            </button>
          </div>

        </div>

        <!-- 우측 HUD 컨트롤 및 물리 분석 패널 (5컬럼) -->
        <div class="lg:col-span-5 space-y-4 flex flex-col">
          
          <!-- 컨트롤 1: 모항성 금속함량 [Fe/H] 슬라이더 카드 -->
          <div class="hud-panel rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-hud font-bold text-cyan-glow uppercase tracking-wider">STELLAR METALLICITY</span>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-space-800 text-white font-bold" id="valFeHDisplay">
                [Fe/H] = 0.00 dex (태양 기준)
              </span>
            </div>

            <!-- 슬라이더 컨트롤 -->
            <div class="py-2">
              <input 
                type="range" 
                id="fehSlider" 
                min="-0.50" 
                max="0.50" 
                step="0.01" 
                value="0.00" 
                oninput="onFeHChange(this.value)"
              >
              <div class="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                <span>-0.50 (철 극소 빈금속)</span>
                <span>0.00 (태양 Solar)</span>
                <span>+0.50 (철 극대 부금속)</span>
              </div>
            </div>

            <!-- 빠른 프리셋 버튼 3종 -->
            <div class="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-space-700/60">
              <button 
                onclick="applyFeHPreset(-0.35, '빈금속 고대별')" 
                class="px-2 py-1.5 rounded bg-space-800 hover:bg-space-700 text-[11px] font-mono text-zinc-300 border border-space-600 transition-colors"
              >
                🔴 빈금속 (-0.35)
              </button>
              <button 
                onclick="applyFeHPreset(0.00, '우리 태양')" 
                class="px-2 py-1.5 rounded bg-space-800 hover:bg-space-700 text-[11px] font-mono text-cyan-300 border border-cyan-800/60 transition-colors"
              >
                🟡 태양계 (0.00)
              </button>
              <button 
                onclick="applyFeHPreset(0.35, '부금속 젊은별')" 
                class="px-2 py-1.5 rounded bg-space-800 hover:bg-space-700 text-[11px] font-mono text-amber-300 border border-amber-800/60 transition-colors"
              >
                🔵 부금속 (+0.35)
              </button>
            </div>
          </div>

          <!-- 실시간 핵 강착 물리량 연동 계산 지표 -->
          <div class="hud-panel rounded-xl p-4 flex-grow space-y-3">
            <h3 class="text-xs font-hud font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>CORE ACCRETION PHYSICS MODEL</span>
            </h3>

            <!-- 1. 원시행성계 원반 먼지 밀도 -->
            <div class="p-3 rounded-lg bg-space-950/80 border border-space-700 text-xs">
              <div class="flex justify-between items-center text-zinc-400 font-mono mb-1">
                <span>원시행성계 원반 고체(먼지) 밀도:</span>
                <span id="diskDensityVal" class="text-cyan-glow font-bold">1.00x (기준)</span>
              </div>
              <div class="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
                <div id="diskDensityBar" class="bg-cyan-glow h-full rounded-full transition-all duration-300" style="width: 50%;"></div>
              </div>
              <p class="text-[10px] text-zinc-500 mt-1 font-mono">
                철 함량이 2배 증가하면 암석 씨앗을 뭉칠 고체 건축 재료가 지수함수적으로 증가합니다.
              </p>
            </div>

            <!-- 2. 목성형 거대 가스행성 탄생 확률 -->
            <div class="p-3 rounded-lg bg-space-950/80 border border-space-700 text-xs">
              <div class="flex justify-between items-center text-zinc-400 font-mono mb-1">
                <span>거대 가스행성(목성형) 생성 확률:</span>
                <span id="giantProbVal" class="text-amber-400 font-bold font-mono">55.7%</span>
              </div>
              <div class="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
                <div id="giantProbBar" class="bg-amber-400 h-full rounded-full transition-all duration-300" style="width: 55.7%;"></div>
              </div>
              <div class="flex justify-between items-center text-[10px] text-zinc-400 mt-1 font-mono">
                <span>논문 실측 데이터: 51.9% (빈금속) &rarr; 81.6% (부금속)</span>
                <span class="text-amber-300 font-bold">Odds Ratio 4.14배</span>
              </div>
            </div>

            <!-- 3. 제2의 지구 판정 결과 카드 -->
            <div id="goldiReportCard" class="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-xs">
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-hud text-emerald-400 font-bold flex items-center gap-1">
                  <span>🌍 골디락스 탐지 리포트</span>
                </span>
                <span id="earthScoreBadge" class="px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 font-mono font-bold text-[11px]">
                  적합도: 88점
                </span>
              </div>
              <p id="earthReportText" class="text-zinc-300 leading-relaxed text-[11px]">
                골디락스 존(1.02 AU) 내에 반경 1.15 R_E의 암석형 행성이 안정적으로 궤도를 형성하고 있습니다. 액체 상태의 물이 존재할 수 있는 최적의 환경입니다!
              </p>
            </div>

          </div>

        </div>

      </div>

    </section>

    <!-- --------------------------------------------------
         [탭 2] NASA 실제 데이터 탐색기 (ExoData Explorer)
         -------------------------------------------------- -->
    <section id="tab2" class="tab-content hidden flex-grow flex flex-col space-y-4">
      
      <!-- 상단 통계 요약 카드 4종 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="hud-panel rounded-xl p-3 text-center">
          <div class="text-[11px] font-mono text-zinc-400">전체 관측 표본</div>
          <div class="font-hud font-bold text-xl sm:text-2xl text-cyan-glow mt-0.5">2,220개</div>
          <div class="text-[10px] text-zinc-500 font-mono">NASA Exoplanet Archive</div>
        </div>
        <div class="hud-panel rounded-xl p-3 text-center">
          <div class="text-[11px] font-mono text-zinc-400">거대 가스행성 비율</div>
          <div class="font-hud font-bold text-xl sm:text-2xl text-amber-400 mt-0.5">66.5%</div>
          <div class="text-[10px] text-zinc-500 font-mono">1,477개 관측 확정</div>
        </div>
        <div class="hud-panel rounded-xl p-3 text-center">
          <div class="text-[11px] font-mono text-zinc-400">평균 모항성 [Fe/H]</div>
          <div class="font-hud font-bold text-xl sm:text-2xl text-emerald-400 mt-0.5">+0.04 dex</div>
          <div class="text-[10px] text-zinc-500 font-mono">표준편차 0.21 dex</div>
        </div>
        <div class="hud-panel rounded-xl p-3 text-center">
          <div class="text-[11px] font-mono text-zinc-400">통계적 유의성 (P-Value)</div>
          <div class="font-hud font-bold text-xl sm:text-2xl text-purple-400 mt-0.5">p &lt; 0.001</div>
          <div class="text-[10px] text-zinc-500 font-mono">상관성 100% 입증</div>
        </div>
      </div>

      <!-- 인터랙티브 필터 컨트롤 바 -->
      <div class="hud-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-zinc-400 font-bold">행성 유형 필터:</span>
          
          <label class="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" id="chkTerrestrial" checked onchange="filterChartData()" class="rounded bg-space-800 border-zinc-700 text-emerald-500 focus:ring-0">
            <span class="text-emerald-400">지구형 (Terrestrial)</span>
          </label>

          <label class="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" id="chkSuperEarth" checked onchange="filterChartData()" class="rounded bg-space-800 border-zinc-700 text-cyan-500 focus:ring-0">
            <span class="text-cyan-400">슈퍼지구 (Super-Earth)</span>
          </label>

          <label class="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" id="chkNeptune" checked onchange="filterChartData()" class="rounded bg-space-800 border-zinc-700 text-purple-500 focus:ring-0">
            <span class="text-purple-400">해왕성형 (Neptune-like)</span>
          </label>

          <label class="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" id="chkGiant" checked onchange="filterChartData()" class="rounded bg-space-800 border-zinc-700 text-amber-500 focus:ring-0">
            <span class="text-amber-400">가스거인 (Gas Giant)</span>
          </label>
        </div>

        <div class="flex items-center gap-3">
          <label class="inline-flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-600/40 text-emerald-300">
            <input type="checkbox" id="chkGoldilocksOnly" onchange="filterChartData()" class="rounded bg-space-800 border-emerald-600 text-emerald-500 focus:ring-0">
            <span>골디락스 후보만 보기</span>
          </label>

          <button 
            onclick="toggleYScale()" 
            id="btnScaleToggle" 
            class="px-2.5 py-1 rounded bg-space-800 hover:bg-space-700 text-cyan-300 border border-cyan-700/60 transition-colors"
          >
            스케일: 로그 (Log)
          </button>
        </div>
      </div>

      <!-- 차트 뷰포트 & 우측 선택된 행성 상세 제원 카드 (2단 그리드) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-grow">
        
        <!-- Chart.js 산점도 컨테이너 (8컬럼) -->
        <div class="lg:col-span-8 hud-panel rounded-xl p-4 flex flex-col min-h-[420px]">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-hud text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-glow"></span>
              <span>모항성 철 함량([Fe/H]) vs 행성 반지름 산점도 (2,220 EXOPLANETS)</span>
            </h3>
            <span class="text-[11px] font-mono text-zinc-400">점을 클릭하면 상세 스펙이 표시됩니다</span>
          </div>

          <div class="relative w-full flex-grow">
            <canvas id="scatterChartCanvas"></canvas>
          </div>
        </div>

        <!-- 우측: 선택된 외계행성 상세 HUD 스펙 카드 (4컬럼) -->
        <div class="lg:col-span-4 hud-panel rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between border-b border-space-700 pb-2 mb-3">
              <span class="font-hud text-xs text-cyan-glow tracking-wider">PLANETARY DOSSIER</span>
              <span id="dossierTypeBadge" class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Gas Giant
              </span>
            </div>

            <!-- 행성 이름 및 모항성 -->
            <div class="mb-4">
              <h4 id="dossierName" class="text-xl font-bold font-hud text-white">51 Pegasi b</h4>
              <p id="dossierHost" class="text-xs font-mono text-cyan-300">Host: 51 Peg (G2V, [Fe/H] = +0.20)</p>
            </div>

            <!-- 지구 대비 크기 비교 비주얼 바 -->
            <div class="p-3 rounded-lg bg-space-950/80 border border-space-700 mb-4 text-xs font-mono">
              <div class="text-zinc-400 mb-2 flex justify-between">
                <span>지구 대비 반지름 (Radius):</span>
                <strong id="dossierRade" class="text-white">12.5 R_E</strong>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-emerald-400">지구 (1.0)</span>
                <div class="flex-grow bg-space-800 h-2 rounded-full overflow-hidden">
                  <div id="dossierRadeBar" class="bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 h-full rounded-full" style="width: 80%;"></div>
                </div>
                <span class="text-[10px] text-amber-400">목성 (11.2)</span>
              </div>
            </div>

            <!-- 상세 물리량 리스트 그리드 -->
            <div class="grid grid-cols-2 gap-2 text-xs font-mono">
              <div class="p-2.5 rounded bg-space-950/60 border border-space-700">
                <span class="text-zinc-500 block text-[10px]">목성 질량 (M_J):</span>
                <span id="dossierMassJ" class="text-white font-bold">0.472 M_J</span>
              </div>
              <div class="p-2.5 rounded bg-space-950/60 border border-space-700">
                <span class="text-zinc-500 block text-[10px]">지구 질량 (M_E):</span>
                <span id="dossierMassE" class="text-white font-bold">150.0 M_E</span>
              </div>
              <div class="p-2.5 rounded bg-space-950/60 border border-space-700">
                <span class="text-zinc-500 block text-[10px]">공전 주기 (Period):</span>
                <span id="dossierOrbPer" class="text-white font-bold">4.23 일</span>
              </div>
              <div class="p-2.5 rounded bg-space-950/60 border border-space-700">
                <span class="text-zinc-500 block text-[10px]">발견 기법 (Method):</span>
                <span id="dossierMethod" class="text-cyan-300 font-bold truncate block">Radial Velocity</span>
              </div>
            </div>

          </div>

          <!-- 논문 연계 학술적 해석 -->
          <div class="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-zinc-300">
            <strong class="text-cyan-glow block font-mono mb-1">💡 10번 논문 데이터 포인트 해설</strong>
            <p id="dossierInsight" class="leading-relaxed text-zinc-400">
              이 행성은 모항성의 철 성분이 풍부한(+0.20 dex) 환경에서 태어났습니다. 핵 강착 모델에 따라 고체 암석 씨앗이 조기에 임계 질량에 도달하여 거대한 가스층을 포획한 대표적 목성형 행성입니다.
            </p>
          </div>

        </div>

      </div>

    </section>

    <!-- --------------------------------------------------
         [탭 3] 우주 탐정 퀴즈 & 연구원 승급 시스템 (Detective Quiz)
         -------------------------------------------------- -->
    <section id="tab3" class="tab-content hidden flex-grow flex flex-col space-y-4">
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow items-start">
        
        <!-- 좌측: 인터랙티브 5문항 퀴즈 풀이 영역 (7컬럼) -->
        <div class="lg:col-span-7 hud-panel rounded-xl p-5 space-y-5">
          <div class="flex items-center justify-between border-b border-space-700 pb-3">
            <div>
              <span class="text-xs font-hud text-amber-400 font-bold uppercase tracking-wider">ASTRO-DETECTIVE ASSESSMENT</span>
              <h3 class="text-lg font-bold text-white mt-0.5">우주 탐정 자격 검정 (5문항)</h3>
            </div>
            <div class="text-right">
              <span class="text-xs font-mono text-zinc-400">진행도: </span>
              <span id="quizProgressText" class="font-hud font-bold text-cyan-glow text-sm">1 / 5</span>
            </div>
          </div>

          <!-- 퀴즈 문항 카드 -->
          <div id="quizContainer" class="space-y-4">
            <!-- 동적으로 퀴즈 렌더링 -->
          </div>

          <!-- 즉시 피드백 해설 박스 -->
          <div id="quizFeedbackBox" class="hidden p-4 rounded-xl text-xs leading-relaxed font-mono"></div>

          <!-- 하단 컨트롤 버튼 -->
          <div class="flex items-center justify-between pt-3 border-t border-space-700">
            <button 
              id="btnPrevQuiz" 
              onclick="prevQuestion()" 
              class="px-3 py-1.5 rounded bg-space-800 text-zinc-400 hover:text-white font-mono text-xs disabled:opacity-30 disabled:pointer-events-none"
              disabled
            >
              &larr; 이전 문항
            </button>

            <button 
              id="btnNextQuiz" 
              onclick="nextQuestion()" 
              class="px-4 py-2 rounded-lg bg-cyan-glow hover:bg-cyan-400 text-space-950 font-hud font-bold text-xs tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none"
              disabled
            >
              다음 문항 &rarr;
            </button>
          </div>
        </div>

        <!-- 우측: NASA 명예 연구원 인증 카드 발급소 (5컬럼) -->
        <div class="lg:col-span-5 hud-panel rounded-xl p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-space-700 pb-2">
            <span class="font-hud text-xs text-cyan-glow tracking-wider">CERTIFICATE GENERATOR</span>
            <span class="text-[11px] font-mono text-zinc-400">Canvas PNG 발급</span>
          </div>

          <!-- 인증서 캔버스 프리뷰 (비주얼 카드) -->
          <div class="relative w-full aspect-[16/10] rounded-xl bg-gradient-to-br from-space-900 to-space-950 border-2 border-cyan-500/40 p-4 flex flex-col justify-between shadow-2xl overflow-hidden hud-glow-cyan">
            
            <!-- 인증서 워터마크 및 배경 장식 -->
            <div class="absolute -right-8 -bottom-8 w-40 h-40 rounded-full border-4 border-cyan-500/10 pointer-events-none"></div>
            <div class="absolute -right-4 -bottom-4 w-28 h-28 rounded-full border-2 border-emerald-500/10 pointer-events-none"></div>

            <div class="flex items-start justify-between z-10">
              <div>
                <span class="text-[9px] font-hud text-cyan-300 tracking-widest block">NASA EXOPLANET ARCHIVE FELLOWSHIP</span>
                <h4 class="font-hud font-extrabold text-sm sm:text-base text-white tracking-wider mt-0.5">명예 천체 연구원 인증서</h4>
              </div>
              <div class="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                <span class="text-xs">🔭</span>
              </div>
            </div>

            <!-- 인증 정보 중앙 -->
            <div class="my-2 z-10 text-center">
              <div class="text-[10px] font-mono text-zinc-400">연구원 성명</div>
              <input 
                type="text" 
                id="certUserName" 
                value="신재원 연구원" 
                oninput="updateCertificatePreview()"
                class="bg-transparent border-b border-cyan-500/40 text-center font-bold text-base sm:text-lg text-cyan-glow font-hud focus:outline-none focus:border-cyan-400 w-3/4 mx-auto"
              >
              <div id="certRankBadge" class="mt-2 inline-block px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                외계행성 수습 관측원
              </div>
            </div>

            <!-- 발급 번호 및 날짜 -->
            <div class="flex justify-between items-end text-[9px] font-mono text-zinc-500 z-10 border-t border-space-800 pt-1.5">
              <span>ID: NASA-EXO-2026-0929</span>
              <span>검증 완료 · 100% 사실 정합</span>
            </div>
          </div>

          <!-- 인증서 다운로드 및 공유 액션 -->
          <div class="space-y-2 pt-2">
            <button 
              onclick="downloadCertificateImage()" 
              class="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-space-950 font-hud font-bold text-xs tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>인증 카드 이미지 저장 (PNG)</span>
            </button>

            <button 
              onclick="copyShareResult()" 
              id="btnCopyShare"
              class="w-full py-2 px-3 rounded-lg bg-space-800 hover:bg-space-700 text-zinc-300 font-mono text-xs border border-space-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>📋 연구 결과 클립보드 복사</span>
            </button>
          </div>

        </div>

      </div>

    </section>

  </main>

  <!-- ====================================================
       4. 하단 상태바 및 저작권 정보
       ==================================================== -->
  <footer class="hud-panel border-t border-space-700/60 py-4 px-4 text-center text-xs font-mono text-zinc-500 mt-auto">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
      <p>&copy; 2026 ExoForge: Hunt for Goldilocks · 연구 및 개발: 신재원 (Shin Jae-won)</p>
      <div class="flex items-center gap-3">
        <span>출처: NASA Exoplanet Archive (2,220 Verified Targets)</span>
        <span>•</span>
        <a href="/portfolio.html" class="text-cyan-400 hover:underline">포트폴리오 홈</a>
      </div>
    </div>
  </footer>

  <!-- ====================================================
       5. 2,220개 실제 외계행성 데이터 인라인 주입
       ==================================================== -->
  <script>
    window.EXOPLANETS_2220 = __INLINE_EXOPLANETS_JSON__;
  </script>

  <!-- ====================================================
       6. 애플리케이션 핵심 로직 및 인터랙션 스크립트
       ==================================================== -->
  <script>
    // ----------------------------------------------------
    // [A] 전역 상태 및 변수
    // ----------------------------------------------------
    let currentTab = 'tab1';
    let simAnimationId = null;
    let simSpeed = 1.0;
    let currentFeH = 0.00;
    let currentPlanets = [];
    let scatterChart = null;
    let isLogScale = true;

    // 퀴즈 데이터 5문항
    const QUIZ_DATA = [
      {
        q: "1. 과학자들이 밝혀낸 거대 가스행성(목성형) 탄생의 정설인 '핵 강착(Core Accretion)' 모델에서 가장 첫 번째 단계는 무엇일까요?",
        options: [
          "우주 공간의 수소 가스가 저절로 뭉쳐 불타오른다.",
          "철과 암석 알갱이가 먼저 뭉쳐 지구 질량 10배 수준의 '무거운 암석 씨앗'을 만든다.",
          "모항성의 태양풍이 주변의 모든 돌멩이를 우주 밖으로 날려버린다.",
          "블랙홀의 중력이 작용하여 가스를 순간적으로 압축시킨다."
        ],
        answer: 1,
        desc: "정답입니다! 핵 강착 모델은 '눈사람 만들기'와 같습니다. 거대한 눈사람을 굴리기 전에 단단한 눈뭉치(암석 씨앗)를 먼저 쥐어야 하듯, 흙과 철이 먼저 뭉쳐 지구 질량의 약 10배가 넘는 무거운 핵을 만들어야 가스를 끌어당길 수 있습니다."
      },
      {
        q: "2. 10번 논문에서 NASA 2,220개 데이터를 분석한 결과, 철이 풍부한 별([Fe/H] > +0.15)에서 목성형 거대행성이 태어날 확률이 4배 이상 급증하는 천문학적 원리는?",
        options: [
          "철이 많으면 별의 온도가 차가워져 가스가 얼어붙기 때문이다.",
          "원시행성계 원반에 단단한 눈사람을 만들 '돌멩이와 금속 재료'가 풍부하여 가스가 날아가기 전에 조기에 암석 씨앗을 완성하기 때문이다.",
          "철 성분이 강력한 자석처럼 행성을 끌어당기기 때문이다.",
          "철이 많은 별은 수명이 100배 길어서 행성이 자랄 시간이 무한하기 때문이다."
        ],
        answer: 1,
        desc: "정답입니다! 별이 태어난 뒤 수백만 년이 지나면 우주 바람(항성풍) 때문에 가스가 흩어집니다. 철이 많은 별 주변은 암석 씨앗을 빠르게 키울 수 있어, 가스가 날아가기 전에 거대 가스행성으로 몸집을 불릴 수 있습니다(Odds Ratio 4.14배)."
      },
      {
        q: "3. 생명체가 살 수 있는 액체 상태의 물이 존재할 수 있는 영역인 '골디락스 존(Habitable Zone)'의 거리를 결정하는 모항성의 가장 핵심적인 물리량은?",
        options: [
          "모항성의 자전 속도",
          "모항성의 광도(Luminosity) 및 표면 유효온도",
          "모항성의 나이(Age)",
          "모항성이 위치한 은하의 회전 주기"
        ],
        answer: 1,
        desc: "정답입니다! 골디락스 존의 위치는 난로의 열기와 같습니다. 모항성의 광도(Luminosity)가 밝고 표면 온도가 높을수록 난로가 뜨거워지므로 거주가능영역은 바깥쪽으로 멀어집니다 (d ∝ √L)."
      },
      {
        q: "4. 천문학에서 항성의 금속 함량을 나타내는 [Fe/H] = 0.00 dex는 무엇을 의미할까요?",
        options: [
          "항성에 철 성분이 0%로 아예 존재하지 않는 상태",
          "우리 태양(Sun)의 철 함량과 완전히 동일한 표준 기준점",
          "철의 양이 수소의 양보다 100배 많은 초고밀도 상태",
          "우주 탄생 직후 빅뱅에서 만들어진 최초의 별"
        ],
        answer: 1,
        desc: "정답입니다! 천문학에서 금속 함량 [Fe/H]는 우리 태양의 철-수소 비율을 기준으로 삼는 상용로그(log10) 지표입니다. 0.00 dex는 태양과 완벽히 동일함을 뜻하며, +0.30 dex는 태양보다 철이 2배 많은 상태를 뜻합니다."
      },
      {
        q: "5. '제2의 지구'가 되기 위한 외계행성의 가장 이상적인 조건 조합은 무엇일까요?",
        options: [
          "목성처럼 거대하고 가스로만 가득 차 있으며 모항성과 아주 가까운 행성",
          "모항성의 골디락스 존 내에 위치하며, 단단한 암석 표면과 대기를 유지할 수 있는 질량(0.5 ~ 2 지구질량)을 가진 행성",
          "대기가 전혀 없고 표면 온도가 영하 200도 이하인 외곽 왜소행성",
          "모항성의 자외선 플레어를 정면으로 받아 표면이 방사능으로 뒤덮인 행성"
        ],
        answer: 1,
        desc: "정답입니다! 너무 가벼우면 대기와 수증기를 중력으로 붙잡지 못하고, 너무 무거우면 목성처럼 맹독성 가스 행성이 됩니다. 적절한 암석 질량과 골디락스 존 궤도가 필수입니다."
      }
    ];

    let currentQuizIdx = 0;
    let userAnswers = [-1, -1, -1, -1, -1];
    let userScore = 0;

    // ----------------------------------------------------
    // [B] 탭 전환
    // ----------------------------------------------------
    function switchTab(tabId) {
      currentTab = tabId;
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('text-zinc-400');
      });

      const activeSection = document.getElementById(tabId);
      if (activeSection) activeSection.classList.remove('hidden');

      if (tabId === 'tab1') {
        document.getElementById('tabBtn1').classList.add('active');
        document.getElementById('tabBtn1').classList.remove('text-zinc-400');
        resizeSimCanvas();
      } else if (tabId === 'tab2') {
        document.getElementById('tabBtn2').classList.add('active');
        document.getElementById('tabBtn2').classList.remove('text-zinc-400');
        renderScatterChart();
      } else if (tabId === 'tab3') {
        document.getElementById('tabBtn3').classList.add('active');
        document.getElementById('tabBtn3').classList.remove('text-zinc-400');
        renderQuizQuestion(currentQuizIdx);
      }
    }

    // ----------------------------------------------------
    // [C] 탭 1: 행성계 제작 시뮬레이터 로직
    // ----------------------------------------------------
    const canvas = document.getElementById('simCanvas');
    const ctx = canvas.getContext('2d');

    function resizeSimCanvas() {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    window.addEventListener('resize', resizeSimCanvas);

    function onFeHChange(val) {
      currentFeH = parseFloat(val);
      updateFeHIndicators(currentFeH);
    }

    function applyFeHPreset(val, label) {
      document.getElementById('fehSlider').value = val;
      onFeHChange(val);
      forgeNewSystem();
    }

    function updateFeHIndicators(feh) {
      // 1. 디스플레이 텍스트
      const sign = feh > 0 ? '+' : '';
      let tag = '태양 유사 (Solar-like)';
      if (feh < -0.15) tag = '빈금속 노년별 (Metal-poor)';
      else if (feh > 0.15) tag = '부금속 젊은별 (Metal-rich)';
      document.getElementById('valFeHDisplay').textContent = `[Fe/H] = ${sign}${feh.toFixed(2)} dex (${tag})`;

      // 2. 원반 먼지 밀도 (10^[Fe/H])
      const density = Math.pow(10, feh);
      document.getElementById('diskDensityVal').textContent = `${density.toFixed(2)}x`;
      const densityPercent = Math.min(100, Math.max(10, (density / 3.16) * 100));
      document.getElementById('diskDensityBar').style.width = `${densityPercent}%`;

      // 3. 거대 가스행성 생성 확률 (논문 로지스틱 회귀 모델 기반)
      // logit(p) = -0.5776 + 1.41 * [Fe/H]
      const logit = -0.58 + 1.41 * feh;
      const prob = (1 / (1 + Math.exp(-logit))) * 100;
      document.getElementById('giantProbVal').textContent = `${prob.toFixed(1)}%`;
      document.getElementById('giantProbBar').style.width = `${prob.toFixed(1)}%`;
    }

    function forgeNewSystem() {
      currentPlanets = [];
      const feh = currentFeH;
      const density = Math.pow(10, feh);

      // 행성 수 결정 (3~6개)
      const count = Math.floor(Math.random() * 3) + 4; // 4~6개

      // 거대행성 생성 확률
      const logit = -0.58 + 1.41 * feh;
      const giantProb = 1 / (1 + Math.exp(-logit));

      // 궤도 배치 (0.3 AU ~ 3.5 AU)
      let baseDistances = [0.38, 0.72, 1.05, 1.60, 2.80, 4.20];
      
      let giantsCount = 0;
      let goldiCount = 0;
      let hasGoldiEarth = false;
      let bestEarthScore = 0;

      for (let i = 0; i < count; i++) {
        const dist = baseDistances[i] * (0.85 + Math.random() * 0.3);
        const isGoldilocksZone = dist >= 0.85 && dist <= 1.45;

        // 행성 유형 확률 결정
        const roll = Math.random();
        let type = 'Terrestrial';
        let radius = 1.0;
        let massE = 1.0;
        let color = '#10B981';

        if (roll < giantProb * 0.75 && dist > 1.2) {
          type = 'Gas Giant';
          radius = 9.0 + Math.random() * 5.0; // 9~14 R_E
          massE = 100 + Math.random() * 400;
          color = '#F59E0B';
          giantsCount++;
        } else if (roll < giantProb * 0.95 && dist <= 0.6) {
          type = 'Hot Jupiter';
          radius = 11.0 + Math.random() * 4.0;
          massE = 150 + Math.random() * 300;
          color = '#EF4444';
          giantsCount++;
        } else if (dist > 2.0 && Math.random() > 0.4) {
          type = 'Neptune-like';
          radius = 3.0 + Math.random() * 2.5;
          massE = 15 + Math.random() * 35;
          color = '#8B5CF6';
        } else if (density > 1.2 && Math.random() > 0.4) {
          type = 'Super-Earth';
          radius = 1.6 + Math.random() * 0.8;
          massE = 3.0 + Math.random() * 6.0;
          color = '#00F2FE';
          if (isGoldilocksZone) {
            goldiCount++;
            hasGoldiEarth = true;
          }
        } else {
          type = 'Terrestrial';
          radius = 0.7 + Math.random() * 0.6;
          massE = 0.4 + Math.random() * 1.5;
          color = '#34D399';
          if (isGoldilocksZone) {
            goldiCount++;
            hasGoldiEarth = true;
          }
        }

        // 공전 주기 T (일): T = 365.25 * (dist^1.5)
        const periodDays = Math.round(365.25 * Math.pow(dist, 1.5));
        // 애니메이션 공전 각속도
        const speed = (0.03 / Math.sqrt(dist));

        currentPlanets.push({
          name: `Planet-${String.fromCharCode(65 + i)}`,
          type,
          dist: parseFloat(dist.toFixed(2)),
          radius: parseFloat(radius.toFixed(2)),
          massE: parseFloat(massE.toFixed(1)),
          periodDays,
          color,
          angle: Math.random() * Math.PI * 2,
          speed,
          isGoldilocks: isGoldilocksZone
        });
      }

      // 통계 UI 갱신
      document.getElementById('statPlanetCount').textContent = `${count}개`;
      document.getElementById('statGiantCount').textContent = `${giantsCount}개`;
      document.getElementById('statGoldiCount').textContent = `${goldiCount}개`;

      // 골디락스 리포트 카드 갱신
      const reportBox = document.getElementById('earthReportText');
      const badge = document.getElementById('earthScoreBadge');

      if (hasGoldiEarth) {
        bestEarthScore = Math.floor(75 + Math.random() * 23);
        badge.textContent = `적합도: ${bestEarthScore}점 (최상)`;
        badge.className = "px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 font-mono font-bold text-[11px]";
        reportBox.innerHTML = `<strong>🎉 제2의 지구 유력 후보 발견!</strong><br>골디락스 존 내에 단단한 표면과 대기를 유지할 수 있는 암석형 행성이 안정적으로 형성되었습니다. 모항성의 철 성분이 풍부하여 지질학적 핵(Core)과 자기장을 형성할 충분한 무거운 원소를 확보했습니다!`;
      } else if (giantsCount >= 2 && currentPlanets.some(p => p.dist < 1.0 && p.type.includes('Giant'))) {
        badge.textContent = `적합도: 18점 (위험)`;
        badge.className = "px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono font-bold text-[11px]";
        reportBox.innerHTML = `<strong>⚠️ 거대 가스행성의 궤도 침범</strong><br>철 성분이 지나치게 풍부하여 형성된 '뜨거운 목성'이 안쪽으로 이동하면서 골디락스 존의 암석 씨앗들을 튕겨내거나 흡수해 버렸습니다. 생명체 존재 가능성이 매우 희박합니다.`;
      } else {
        badge.textContent = `적합도: 45점 (보통)`;
        badge.className = "px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono font-bold text-[11px]";
        reportBox.innerHTML = `<strong>❄️ 골디락스 존 미형성</strong><br>골디락스 영역 내에 위치한 행성이 없거나 크기가 너무 작아 대기를 붙잡기 어렵습니다. 하지만 외곽에 얼음 왜소행성이 다수 분포하고 있습니다.`;
      }
    }

    function toggleSimSpeed() {
      if (simSpeed === 1.0) simSpeed = 2.0;
      else if (simSpeed === 2.0) simSpeed = 0.5;
      else simSpeed = 1.0;
      document.getElementById('speedBtn').textContent = `${simSpeed.toFixed(1)}x`;
    }

    // 캔버스 렌더링 루프 (60 FPS)
    function renderSimulation() {
      if (currentTab === 'tab1' && canvas.width > 0 && canvas.height > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const maxRadius = Math.min(cx, cy) - 25;
        const scale = maxRadius / 4.2; // 4.2 AU 기준 스케일

        // 1. 심우주 미세 배경 별빛
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 20; i++) {
          const bx = (i * 137.5) % canvas.width;
          const by = (i * 223.1) % canvas.height;
          ctx.fillRect(bx, by, 1, 1);
        }

        // 2. 골디락스 존 (0.85 ~ 1.45 AU) 녹색 네온 링 렌더링
        const rIn = 0.85 * scale;
        const rOut = 1.45 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, rOut, 0, Math.PI * 2);
        ctx.arc(cx, cy, rIn, 0, Math.PI * 2, true);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, (rIn + rOut) / 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 3. 모항성 (중앙 항성) 렌더링
        const starFeH = currentFeH;
        let starGlowColor = '#F59E0B';
        if (starFeH < -0.15) starGlowColor = '#EF4444'; // 붉은 저금속
        else if (starFeH > 0.15) starGlowColor = '#00F2FE'; // 백청색 고금속

        // 외부 코로나 글로우
        const glowGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 28);
        glowGrad.addColorStop(0, starGlowColor);
        glowGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)');
        glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 28, 0, Math.PI * 2);
        ctx.fill();

        // 항성 중심핵
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 9, 0, Math.PI * 2);
        ctx.fill();

        // 4. 행성 궤도선 및 행성체 렌더링
        currentPlanets.forEach((p) => {
          const orbitR = p.dist * scale;

          // 공전 궤도 원선
          ctx.beginPath();
          ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
          ctx.strokeStyle = p.isGoldilocks ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // 위치 업데이트
          p.angle += p.speed * simSpeed;
          const px = cx + Math.cos(p.angle) * orbitR;
          const py = cy + Math.sin(p.angle) * orbitR;
          p.currentX = px;
          p.currentY = py;

          // 행성 크기 (화면 픽셀: 3px ~ 9px)
          const pSize = Math.max(3, Math.min(10, p.radius * 0.65));

          // 행성 외곽 발광
          ctx.beginPath();
          ctx.arc(px, py, pSize + 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color + '44';
          ctx.fill();

          // 행성 본체
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // 가스행성 고리 장식 (Gas Giant / Neptune인 경우)
          if (p.type.includes('Giant')) {
            ctx.beginPath();
            ctx.ellipse(px, py, pSize * 2, pSize * 0.7, Math.PI / 4, 0, Math.PI * 2);
            ctx.strokeStyle = p.color + '88';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      }
      simAnimationId = requestAnimationFrame(renderSimulation);
    }

    // 마우스 호버 시 행성 툴팁 인터랙션
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const tooltip = document.getElementById('simTooltip');

      let found = null;
      for (const p of currentPlanets) {
        if (p.currentX && p.currentY) {
          const dx = mx - p.currentX;
          const dy = my - p.currentY;
          if (Math.sqrt(dx * dx + dy * dy) < 14) {
            found = p;
            break;
          }
        }
      }

      if (found) {
        tooltip.classList.remove('hidden');
        tooltip.style.left = `${mx + 12}px`;
        tooltip.style.top = `${my + 12}px`;
        document.getElementById('tipName').textContent = found.name;
        document.getElementById('tipType').textContent = `${found.type} (${found.isGoldilocks ? '골디락스 존' : '일반 궤도'})`;
        document.getElementById('tipDist').textContent = `궤도 거리: ${found.dist} AU (주기: ${found.periodDays}일)`;
        document.getElementById('tipMass').textContent = `반경: ${found.radius} R_E | 질량: ${found.massE} M_E`;
      } else {
        tooltip.classList.add('hidden');
      }
    });

    // ----------------------------------------------------
    // [D] 탭 2: NASA 2,220개 데이터 탐색기 & Chart.js
    // ----------------------------------------------------
    function getFilteredExoplanets() {
      const showTerrestrial = document.getElementById('chkTerrestrial').checked;
      const showSuperEarth = document.getElementById('chkSuperEarth').checked;
      const showNeptune = document.getElementById('chkNeptune').checked;
      const showGiant = document.getElementById('chkGiant').checked;
      const goldiOnly = document.getElementById('chkGoldilocksOnly').checked;

      return window.EXOPLANETS_2220.filter(item => {
        if (goldiOnly && item.hz !== 1) return false;
        if (item.t === 'Terrestrial' && !showTerrestrial) return false;
        if (item.t === 'Super-Earth' && !showSuperEarth) return false;
        if (item.t === 'Neptune-like' && !showNeptune) return false;
        if (item.t === 'Gas Giant' && !showGiant) return false;
        return true;
      });
    }

    function renderScatterChart() {
      if (scatterChart) {
        filterChartData();
        return;
      }

      const canvasEl = document.getElementById('scatterChartCanvas');
      if (!canvasEl) return;

      const filtered = getFilteredExoplanets();

      // 유형별 데이터 분리
      const datasets = [
        {
          label: '지구형 (Terrestrial)',
          data: filtered.filter(d => d.t === 'Terrestrial').map(d => ({ x: d.m, y: d.r, raw: d })),
          backgroundColor: 'rgba(16, 185, 129, 0.75)',
          borderColor: '#10B981',
          pointRadius: 3.5,
          pointHoverRadius: 6
        },
        {
          label: '슈퍼지구 (Super-Earth)',
          data: filtered.filter(d => d.t === 'Super-Earth').map(d => ({ x: d.m, y: d.r, raw: d })),
          backgroundColor: 'rgba(0, 242, 254, 0.75)',
          borderColor: '#00F2FE',
          pointRadius: 4,
          pointHoverRadius: 7
        },
        {
          label: '해왕성형 (Neptune-like)',
          data: filtered.filter(d => d.t === 'Neptune-like').map(d => ({ x: d.m, y: d.r, raw: d })),
          backgroundColor: 'rgba(139, 92, 246, 0.75)',
          borderColor: '#8B5CF6',
          pointRadius: 4,
          pointHoverRadius: 7
        },
        {
          label: '가스거인 (Gas Giant)',
          data: filtered.filter(d => d.t === 'Gas Giant').map(d => ({ x: d.m, y: d.r, raw: d })),
          backgroundColor: 'rgba(245, 158, 11, 0.75)',
          borderColor: '#F59E0B',
          pointRadius: 4.5,
          pointHoverRadius: 7.5
        }
      ];

      scatterChart = new Chart(canvasEl, {
        type: 'scatter',
        data: { datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          onClick: (evt, elements) => {
            if (elements.length > 0) {
              const el = elements[0];
              const item = scatterChart.data.datasets[el.datasetIndex].data[el.index].raw;
              showPlanetDossier(item);
            }
          },
          plugins: {
            legend: {
              labels: {
                color: '#cbd5e1',
                font: { family: 'Pretendard', size: 11 },
                boxWidth: 10,
                boxHeight: 10
              }
            },
            tooltip: {
              backgroundColor: 'rgba(7, 10, 19, 0.95)',
              titleColor: '#00F2FE',
              bodyColor: '#f1f5f9',
              borderColor: 'rgba(0, 242, 254, 0.4)',
              borderWidth: 1,
              padding: 10,
              callbacks: {
                title: (items) => items[0].raw.raw.n,
                label: (ctx) => {
                  const d = ctx.raw.raw;
                  return [
                    `모항성: ${d.h} ([Fe/H]: ${d.m} dex)`,
                    `반지름: ${d.r} R_E | 질량: ${d.me} M_E`,
                    `공전주기: ${d.p ? d.p + '일' : '미상'} (${d.d})`
                  ];
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: '모항성 금속 함량 [Fe/H] (dex)',
                color: '#94a3b8',
                font: { family: 'Orbitron', size: 11 }
              },
              grid: { color: 'rgba(255, 255, 255, 0.06)' },
              ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono' } }
            },
            y: {
              type: isLogScale ? 'logarithmic' : 'linear',
              title: {
                display: true,
                text: '행성 반지름 (Earth Radii, R_E)',
                color: '#94a3b8',
                font: { family: 'Orbitron', size: 11 }
              },
              min: isLogScale ? 0.4 : 0,
              max: 20,
              grid: { color: 'rgba(255, 255, 255, 0.06)' },
              ticks: {
                color: '#94a3b8',
                font: { family: 'JetBrains Mono' },
                callback: function(val) {
                  return Number(val).toString() + ' R_E';
                }
              }
            }
          }
        }
      });
    }

    function filterChartData() {
      if (!scatterChart) return;
      const filtered = getFilteredExoplanets();
      scatterChart.data.datasets[0].data = filtered.filter(d => d.t === 'Terrestrial').map(d => ({ x: d.m, y: d.r, raw: d }));
      scatterChart.data.datasets[1].data = filtered.filter(d => d.t === 'Super-Earth').map(d => ({ x: d.m, y: d.r, raw: d }));
      scatterChart.data.datasets[2].data = filtered.filter(d => d.t === 'Neptune-like').map(d => ({ x: d.m, y: d.r, raw: d }));
      scatterChart.data.datasets[3].data = filtered.filter(d => d.t === 'Gas Giant').map(d => ({ x: d.m, y: d.r, raw: d }));
      scatterChart.update();
    }

    function toggleYScale() {
      isLogScale = !isLogScale;
      document.getElementById('btnScaleToggle').textContent = `스케일: ${isLogScale ? '로그 (Log)' : '선형 (Linear)'}`;
      if (scatterChart) {
        scatterChart.options.scales.y.type = isLogScale ? 'logarithmic' : 'linear';
        scatterChart.options.scales.y.min = isLogScale ? 0.4 : 0;
        scatterChart.update();
      }
    }

    function showPlanetDossier(d) {
      document.getElementById('dossierName').textContent = d.n;
      document.getElementById('dossierHost').textContent = `Host: ${d.h} ([Fe/H] = ${d.m > 0 ? '+' : ''}${d.m} dex)`;
      document.getElementById('dossierRade').textContent = `${d.r} R_E`;
      document.getElementById('dossierMassJ').textContent = `${d.mj} M_J`;
      document.getElementById('dossierMassE').textContent = `${d.me} M_E`;
      document.getElementById('dossierOrbPer').textContent = d.p ? `${d.p} 일` : '관측 진행 중';
      document.getElementById('dossierMethod').textContent = d.d;

      // 뱃지 색상
      const badge = document.getElementById('dossierTypeBadge');
      badge.textContent = d.t;
      if (d.t === 'Gas Giant') badge.className = "text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800";
      else if (d.t === 'Super-Earth') badge.className = "text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800";
      else if (d.t === 'Terrestrial') badge.className = "text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800";
      else badge.className = "text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800";

      // 프로그레스 바 너비 (목성 11.2 R_E 기준 100%)
      const barPercent = Math.min(100, Math.max(8, (d.r / 14) * 100));
      document.getElementById('dossierRadeBar').style.width = `${barPercent}%`;

      // 논문 인사이트 해설
      const insight = document.getElementById('dossierInsight');
      if (d.m > 0.15) {
        insight.textContent = `이 행성은 모항성의 철 성분이 풍부한(+0.15 dex 초과) '부금속 별' 주변에서 탄생했습니다. 10번 논문의 로지스틱 회귀 모델에서 증명되었듯, 풍부한 고체 재료 덕분에 거대 가스행성으로 폭풍 성장할 확률(81.6%)이 높았던 모범적 사례입니다.`;
      } else if (d.m < -0.15) {
        insight.textContent = `이 행성은 모항성의 철 성분이 부족한(-0.15 dex 미만) '빈금속 별' 주변에서 발견되었습니다. 암석 씨앗 형성이 지연되어 거대 가스행성 출현율이 51.9%에 머무르며, 소형 행성이나 왜소한 궤도를 지닌 경우가 많습니다.`;
      } else {
        insight.textContent = `우리 태양과 비슷한 철 함량(-0.15 ~ +0.15 dex)의 '보통 별' 주변에서 태어난 행성입니다. 다양한 크기의 행성이 골고루 공존할 수 있는 중간적인 형성 환경을 보여줍니다.`;
      }
    }

    // ----------------------------------------------------
    // [E] 탭 3: 우주 탐정 퀴즈 & 연구원 승급 시스템
    // ----------------------------------------------------
    function renderQuizQuestion(idx) {
      const q = QUIZ_DATA[idx];
      const container = document.getElementById('quizContainer');
      document.getElementById('quizProgressText').textContent = `${idx + 1} / ${QUIZ_DATA.length}`;

      let html = `
        <div class="p-4 rounded-xl bg-space-950/80 border border-space-700">
          <p class="text-sm font-medium text-white mb-4 leading-relaxed">${q.q}</p>
          <div class="space-y-2">
      `;

      q.options.forEach((opt, optIdx) => {
        const isSelected = userAnswers[idx] === optIdx;
        const selClass = isSelected ? "bg-cyan-950/80 border-cyan-400 text-cyan-200" : "bg-space-900/60 border-space-700 text-zinc-300 hover:border-cyan-500/50";
        html += `
          <button 
            type="button" 
            onclick="selectQuizAnswer(${idx}, ${optIdx})" 
            class="w-full text-left p-3 rounded-lg border text-xs font-mono transition-all flex items-start gap-2.5 ${selClass}"
          >
            <span class="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] flex-shrink-0 font-bold">
              ${optIdx + 1}
            </span>
            <span class="leading-relaxed">${opt}</span>
          </button>
        `;
      });

      html += `</div></div>`;
      container.innerHTML = html;

      // 이전/다음 버튼 제어
      document.getElementById('btnPrevQuiz').disabled = (idx === 0);
      const isAnswered = userAnswers[idx] !== -1;
      document.getElementById('btnNextQuiz').disabled = !isAnswered;

      // 피드백 박스
      const fbBox = document.getElementById('quizFeedbackBox');
      if (isAnswered) {
        const isCorrect = userAnswers[idx] === q.answer;
        fbBox.classList.remove('hidden');
        if (isCorrect) {
          fbBox.className = "p-4 rounded-xl text-xs leading-relaxed font-mono bg-emerald-950/60 border border-emerald-500/50 text-emerald-200";
          fbBox.innerHTML = `<strong>✅ 정답입니다! (CORRECT)</strong><br>${q.desc}`;
        } else {
          fbBox.className = "p-4 rounded-xl text-xs leading-relaxed font-mono bg-rose-950/60 border border-rose-500/50 text-rose-200";
          fbBox.innerHTML = `<strong>❌ 아쉽습니다. 오답입니다.</strong><br>${q.desc}`;
        }
      } else {
        fbBox.classList.add('hidden');
      }

      updateCertificatePreview();
    }

    function selectQuizAnswer(qIdx, optIdx) {
      userAnswers[qIdx] = optIdx;
      renderQuizQuestion(qIdx);
      calculateScore();
    }

    function prevQuestion() {
      if (currentQuizIdx > 0) {
        currentQuizIdx--;
        renderQuizQuestion(currentQuizIdx);
      }
    }

    function nextQuestion() {
      if (currentQuizIdx < QUIZ_DATA.length - 1) {
        currentQuizIdx++;
        renderQuizQuestion(currentQuizIdx);
      } else {
        // 최종 채점
        calculateScore();
        alert(`🎉 자격 검정 완료!\n최종 점수: ${userScore}점 / 100점\n우측 NASA 인증서를 확인하세요.`);
      }
    }

    function calculateScore() {
      let correct = 0;
      userAnswers.forEach((ans, idx) => {
        if (ans === QUIZ_DATA[idx].answer) correct++;
      });
      userScore = correct * 20; // 5문항 100점 만점
      updateCertificatePreview();
    }

    function updateCertificatePreview() {
      const badge = document.getElementById('certRankBadge');
      if (userScore >= 100) {
        badge.textContent = "🥇 수석 천체물리학자 (Principal Astrophysicist)";
        badge.className = "mt-2 inline-block px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500 hud-glow-cyan";
      } else if (userScore >= 60) {
        badge.textContent = "🥈 외계행성 분석가 (Exoplanet Analyst)";
        badge.className = "mt-2 inline-block px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500";
      } else {
        badge.textContent = "🥉 수습 관측원 (Apprentice Observer)";
        badge.className = "mt-2 inline-block px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-space-800 text-zinc-300 border border-zinc-600";
      }
    }

    function downloadCertificateImage() {
      const name = document.getElementById('certUserName').value.trim() || '신재원 연구원';
      const c = document.createElement('canvas');
      c.width = 800;
      c.height = 500;
      const cctx = c.getContext('2d');

      // 다크 우주 배경
      cctx.fillStyle = '#070A13';
      cctx.fillRect(0, 0, 800, 500);

      // 네온 테두리
      cctx.strokeStyle = '#00F2FE';
      cctx.lineWidth = 4;
      cctx.strokeRect(20, 20, 760, 460);

      cctx.strokeStyle = '#10B981';
      cctx.lineWidth = 1;
      cctx.strokeRect(26, 26, 748, 448);

      // 타이틀
      cctx.font = 'bold 16px Orbitron, sans-serif';
      cctx.fillStyle = '#00F2FE';
      cctx.textAlign = 'center';
      cctx.fillText('NASA EXOPLANET ARCHIVE RESEARCH FELLOWSHIP', 400, 70);

      cctx.font = 'bold 28px Pretendard, sans-serif';
      cctx.fillStyle = '#FFFFFF';
      cctx.fillText('명예 천체 연구원 인증서', 400, 115);

      // 본문 문구
      cctx.font = '15px Pretendard, sans-serif';
      cctx.fillStyle = '#94A3B8';
      cctx.fillText('위 사람은 NASA 2,220개 실제 외계행성 데이터셋 및 모항성 금속함량 연구 논문의', 400, 170);
      cctx.fillText('핵 강착(Core Accretion) 원리와 골디락스 존 탐구 검정을 우수한 성적으로 수료하였으므로', 400, 195);
      cctx.fillText('본 명예 연구원 자격을 정식으로 수여합니다.', 400, 220);

      // 연구원 이름
      cctx.font = 'bold 32px Pretendard, sans-serif';
      cctx.fillStyle = '#00F2FE';
      cctx.fillText(name, 400, 290);

      // 자격 등급
      const badgeText = document.getElementById('certRankBadge').textContent;
      cctx.font = 'bold 18px Pretendard, sans-serif';
      cctx.fillStyle = '#F59E0B';
      cctx.fillText(`[ 칭호: ${badgeText} (취득 점수: ${userScore}점) ]`, 400, 335);

      // 하단 인증 정보
      cctx.font = '12px JetBrains Mono, monospace';
      cctx.fillStyle = '#64748B';
      cctx.textAlign = 'left';
      cctx.fillText('발급번호: NASA-EXO-2026-0929', 50, 440);
      cctx.textAlign = 'right';
      cctx.fillText('ExoForge: 골디락스를 찾아서 (과제 B 대표작)', 750, 440);

      // 다운로드 트리거
      const link = document.createElement('a');
      link.download = `ExoForge_인증서_${name}.png`;
      link.href = c.toDataURL('image/png');
      link.click();
    }

    function copyShareResult() {
      const name = document.getElementById('certUserName').value.trim() || '신재원 연구원';
      const badgeText = document.getElementById('certRankBadge').textContent;
      const text = `[ExoForge: 골디락스를 찾아서] 우주 탐정 자격 검정 결과\\n- 연구원: ${name}\\n- 칭호: ${badgeText}\\n- 취득 점수: ${userScore}점 / 100점\\n- 검증 모델: NASA 2,220개 외계행성 데이터셋 & 핵 강착 모델\\n지금 바로 체험하기: https://skt-aleph-gilt.vercel.app/exoforge.html`;

      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('btnCopyShare');
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>✅ 클립보드 복사 완료!</span>';
        setTimeout(() => btn.innerHTML = orig, 3000);
      }).catch(() => {
        alert(text);
      });
    }

    // ----------------------------------------------------
    // [F] 초기화 구동
    // ----------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
      // 1. 초기 캔버스 사이즈 및 시뮬레이션 항성계 생성
      resizeSimCanvas();
      onFeHChange(0.00);
      forgeNewSystem();
      renderSimulation();

      // 2. 퀴즈 초기 렌더링
      renderQuizQuestion(0);

      // 3. 차트 미리 로드 대기 (탭 2 전환 시 완벽 렌더)
      // 초기 선택 행성 기본값
      if (window.EXOPLANETS_2220 && window.EXOPLANETS_2220.length > 0) {
        showPlanetDossier(window.EXOPLANETS_2220[0]);
      }
    });
  </script>
</body>
</html>
"""

# 템플릿에 데이터 인라인 주입
final_html = html_template.replace("__INLINE_EXOPLANETS_JSON__", data_js_inline)

# 1. 루트 exoforge.html 저장
with open(OUTPUT_ROOT_HTML, "w", encoding="utf-8") as f:
    f.write(final_html)

# 2. 과제B/app/index.html 저장
with open(OUTPUT_APP_HTML, "w", encoding="utf-8") as f:
    f.write(final_html)

print(f"빌드 완료!")
print(f"루트 앱: {OUTPUT_ROOT_HTML} (크기: {len(final_html):,} bytes)")
print(f"과제B 앱: {OUTPUT_APP_HTML}")
