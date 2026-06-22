# 🔮 VIBE PROJECT - AI 기반 서비스 기획 및 AI 개발 워크스페이스

> **"누구나 자신의 아이디어를 현실의 서비스로 구현할 수 있도록"**
> VIBE PROJECT는 사용자의 불완전한 아이디어를 체계적인 기획서로 고도화하고, v0 / Cursor 등 차세대 AI 개발 도구와 연동할 수 있는 프롬프트 추출 및 디버깅을 지원하는 올인원(All-in-One) 기획·개발 가속화 웹 애플리케이션입니다.

---

## 🚀 주요 기능 (Key Features)

### 1. Step-by-Step 가이드형 워크플로우
* **Step 1 — 아이디어 제안 및 포착**: 완벽하지 않은 한 줄의 생각이나 직관적인 아이디어를 자유롭게 입력받습니다. (초보자를 위한 실용적인 아이디어 템플릿 예시 제공)
* **Step 2 — AI 기획 자동 구조화 & 실무형 PRD 출력**: 입력된 아이디어를 AI가 분석하여 문제 정의(Problem), 대상 사용자(Target), 핵심 기능(Features), 필요 화면 구조(Screens)의 4대 핵심 축으로 자동 분류 및 구조화합니다.
* **Step 3 — 차세대 코드 생성기 맞춤 프롬프트**: v0, Cursor, ChatGPT 등 최신 AI 개발 툴에 그대로 복사해서 붙여넣으면 고품질 코드가 즉시 생성되는 단계별 개발 맞춤형 프롬프트를 제공합니다.
* **Step 4 — AI 디버깅 및 고도화 도구**:
    * **🛟 에러 해석기**: 복잡하고 불친절한 개발 엔진/콘솔 에러 로그를 입력하면 초보자 눈높이에 맞춘 '원인 분석', '해결 가이드', 'AI 재질문용 최적화 프롬프트'를 제공합니다.
    * **✨ 프롬프트 코치**: "맛집 추천 사이트 짜줘"와 같은 일상적인 명령어를 프로페셔널한 AI 엔지니어 수준의 구체적이고 체계적인 프롬프트로 밸류업(Value-up) 해줍니다.

### 2. 엔터프라이즈급 실무 제안서 PDF 다운로드 시스템
* `html2canvas`와 `jsPDF` 기술을 융합하여 화면 상의 컴포넌트를 실제 기업·공공기관 제출 규격인 **대외비 문서 등급의 격식 있는 PRD 사양서(Product Requirement Document)** 구조로 변환하여 다중 페이지 PDF 보고서로 즉시 빌드 및 다운로드할 수 있습니다.

### 3. 모던 라이트/다크 하이브리드 UX 디자인
* **다크 모드**: 심해의 우주를 연상시키는 메쉬 그라데이션 블러 레이어 적용
* **라이트 모드**: 소프트한 입체감(Shadow Elevation)과 세련된 호버 피드백, 텍스트 가독성을 최적화한 트렌디한 디자인 레이아웃 제공

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
* **Framework**: Next.js 14+ (App Router, Client Component 아키텍처)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Libraries**: `html2canvas` (화면 캡처 엔진), `jspdf` (A4 규격 리포트 빌더)

### Backend & AI Interfacing
* **Server**: Next.js Route Handlers (Edge/Serverless 호환 API)
* **LLM Engine**: Google Gemini API Interfacing
    * `gemini-2.5-pro`, `gemini-2.5-flash` 등 구글 최신 추론 모델 라인업 동적 풀링 및 폴백(Fallback) 알고리즘 적용
    * JSON 파싱 안정화를 위한 정규식 기반 정제 엔진 및 특수 제어 문자 공백 필터 탑재

---

## ⚙️ 환경 변수 설정 (Environment Variables)

애플리케이션을 실행하기 전, 프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 구글 AI 스튜디오에서 발급받은 Gemini API 키를 등록해야 합니다.

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```
## 실행방법
1. 최신 코드 받아오기 (방금 올린 거 가져오는 명령어)
git pull origin main

2. 혹시 모르니 패키지 재설치 
npm install

3. 실행하기
npm run dev

4. 확인하기
브라우저 주소창에 http://localhost:3000 입력해서 들어가면 됨

## 버셀 배포링크
https://vibe-project-mu.vercel.app/



