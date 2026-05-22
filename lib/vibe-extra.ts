import type { FeatureItem, PlanData, ScreenItem } from "@/lib/vibe-types";

export interface ToolPromptItem {
  tool: string;
  badge: string;
  description: string;
  prompt: string;
}

export interface PresentationSummary {
  serviceName: string;
  oneLiner: string;
  problem: string;
  target: string;
  mainFeatures: string[];
  expectedEffect: string;
  futurePlan: string;
  oneMinuteScript: string;
}

export interface TodayRouteItem {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
}

export interface PremiumStep3Prompts {
  ui: string[];
  ide: string[];
  db: string;
}

function featureToText(feature: FeatureItem, index: number) {
  const criteria =
    feature.criteria && feature.criteria.length > 0
      ? `\n   완료 기준: ${feature.criteria.join(", ")}`
      : "";

  return `${index + 1}. ${feature.name}
   설명: ${feature.desc}${criteria}`;
}

function screenToText(screen: ScreenItem, index: number) {
  return `${index + 1}. ${screen.name}
   화면 설명: ${screen.desc}`;
}

function getFeatureTexts(plan: PlanData) {
  if (!plan.features || plan.features.length === 0) {
    return ["1. 핵심 기능 3개를 먼저 정리한다"];
  }

  return plan.features.map(featureToText);
}

function getScreenTexts(plan: PlanData) {
  if (!plan.screens || plan.screens.length === 0) {
    return ["1. 메인 화면", "2. 결과 화면"];
  }

  return plan.screens.map(screenToText);
}

function getFeatureNames(plan: PlanData) {
  if (!plan.features || plan.features.length === 0) {
    return ["핵심 기능 정리", "화면 구성", "사용자 문제 해결"];
  }

  return plan.features.map((feature) => feature.name);
}

function buildProjectBrief(plan: PlanData) {
  const features = getFeatureTexts(plan).join("\n\n");
  const screens = getScreenTexts(plan).join("\n\n");

  return `서비스 아이디어:
${plan.idea}

플랫폼:
${plan.platform || "Web 웹사이트"}

수익 모델:
${plan.bm || "첫 버전에서는 수익화보다 MVP 검증 우선"}

문제 정의:
${plan.problem}

대상 사용자:
${plan.target}

핵심 기능:
${features}

필요한 화면:
${screens}`;
}

export function buildPremiumStep3Prompts(plan: PlanData): PremiumStep3Prompts {
  const projectBrief = buildProjectBrief(plan);
  const featureNames = getFeatureNames(plan).join(", ");
  const screens = getScreenTexts(plan).join("\n\n");

  return {
    ui: [
      `너는 비전공자 대학생을 위한 웹서비스 UI를 설계하는 시니어 프로덕트 디자이너이자 프론트엔드 개발자야.

아래 기획을 바탕으로 Next.js + React + TypeScript + Tailwind CSS 기준의 반응형 UI 초안을 만들어줘.

${projectBrief}

원하는 결과:
1. 첫 화면에서 서비스 목적이 바로 이해되어야 함
2. 사용자가 무엇을 입력하고, 어떤 결과를 얻는지 명확해야 함
3. 모바일 360px 화면에서도 버튼, 카드, 텍스트가 깨지지 않아야 함
4. 비전공자 대학생이 쓰는 서비스처럼 문구가 쉽고 친근해야 함
5. 발표/과제 제출용으로도 신뢰감 있어 보여야 함

디자인 방향:
- 카드형 레이아웃
- 큼직한 CTA 버튼
- 부드러운 그림자
- 적당한 그라데이션
- 너무 과한 애니메이션은 피하고 정보 구조를 우선
- 빈 상태, 성공 상태, 에러 상태를 화면에 포함

기술 조건:
- Next.js App Router 기준
- React 함수형 컴포넌트
- TypeScript 사용
- Tailwind CSS 사용
- 외부 패키지는 추가하지 말고 기본 React/Tailwind만 사용
- 브라우저 전용 객체는 사용하지 말 것

출력 형식:
1. 화면 구성 요약
2. 컴포넌트 구조 설명
3. 전체 React/TypeScript 코드
4. 모바일 대응 포인트
5. 이후 Cursor에서 기능 연결할 때 넘겨줄 메모`,

      `방금 만든 UI 초안을 더 실제 서비스처럼 다듬어줘.

다듬을 기준:
- 사용자가 처음 방문했을 때 "이 서비스가 무엇인지" 5초 안에 이해되어야 함
- 핵심 기능은 ${featureNames} 중심으로 보여야 함
- 화면 구성은 아래 화면들을 기준으로 해야 함

${screens}

개선 요청:
1. 헤더/히어로/입력 영역/결과 영역/도움말 영역을 명확히 나눠줘
2. 버튼 문구를 초보자도 이해하기 쉽게 바꿔줘
3. 결과 카드에는 제목, 설명, 다음 행동 버튼을 포함해줘
4. 에러가 났을 때 보여줄 안내 문구도 포함해줘
5. 과제 발표에서 보여줘도 어색하지 않게 완성도를 높여줘

주의사항:
- 기존 UI의 핵심 구조는 유지해줘
- 너무 많은 기능을 한 번에 추가하지 마
- 실제 DB 연결은 아직 하지 말고 샘플 데이터로만 구성해줘
- 모바일에서 좌우 스크롤이 생기지 않게 해줘

출력:
- 개선된 전체 코드
- 어떤 부분을 왜 바꿨는지 초보자용 설명
- 다음 단계에서 Cursor에게 요청할 기능 연결 프롬프트`,
    ],

    ide: [
      `너는 Next.js App Router 프로젝트를 안전하게 수정하는 시니어 프론트엔드 개발자야.
나는 개발 초보자라서 한국어로 쉽고 구체적으로 설명해줘.

내 프로젝트에 아래 기획의 기능을 연결하고 싶어.

${projectBrief}

작업 목표:
- 화면만 있는 상태에서 실제로 클릭, 입력, 결과 확인이 되는 MVP로 만들기
- 첫 버전은 DB 없이 useState와 샘플 데이터로 동작하게 만들기
- 나중에 Supabase를 붙일 수 있도록 데이터 구조는 깔끔하게 잡기

수정 원칙:
1. 기존 디자인과 레이아웃을 함부로 삭제하지 마
2. 한 번에 전체 파일을 갈아엎지 말고 필요한 부분만 수정해줘
3. 수정할 파일 목록을 먼저 알려줘
4. 각 파일에서 어디를 찾아 무엇을 바꾸는지 알려줘
5. TypeScript 타입을 명확하게 작성해줘
6. any 사용은 최대한 피하고 interface/type을 만들어줘
7. 로딩 상태, 빈 상태, 에러 상태, 성공 상태를 포함해줘
8. 모바일 360px에서도 깨지지 않게 해줘

구현해줘야 할 것:
- 사용자가 입력하는 상태
- 제출 버튼 클릭 동작
- 결과 카드 렌더링
- 입력값이 비어 있을 때 안내
- 샘플 데이터
- 최소한의 유효성 검사
- 복사 버튼이 필요하다면 navigator.clipboard를 안전하게 사용

브라우저 전용 객체 주의:
- window, document, localStorage, navigator는 서버에서 바로 실행하지 마
- 필요하면 "use client" 컴포넌트에서 useEffect 또는 버튼 클릭 함수 안에서만 사용해줘

출력 형식:
1. 수정할 파일 목록
2. 구현 흐름
3. 전체 교체 코드 또는 부분 교체 코드
4. 초보자가 붙여넣을 위치
5. npm run dev로 확인하는 방법
6. 오류가 날 경우 가장 먼저 확인할 것`,

      `방금 만든 MVP 기능을 더 안정적으로 다듬고 싶어.
아래 기준으로 기존 코드를 리뷰하고 개선해줘.

${projectBrief}

점검 기준:
1. 사용자가 잘못 입력했을 때 친절한 안내가 나오는가?
2. 버튼을 여러 번 눌러도 화면이 이상해지지 않는가?
3. 배열 데이터 렌더링에 key가 안정적으로 들어갔는가?
4. TypeScript 타입이 너무 느슨하지 않은가?
5. 모바일 화면에서 버튼과 카드가 너무 좁아지지 않는가?
6. 나중에 Supabase API를 붙이기 쉬운 구조인가?
7. 컴포넌트가 너무 길면 작은 내부 컴포넌트로 나눌 수 있는가?

원하는 개선:
- 불필요하게 큰 수정은 하지 말 것
- 기존 디자인은 유지
- 버그 가능성이 높은 부분만 우선 수정
- 초보자가 이해할 수 있게 “왜 바꾸는지” 설명

출력 형식:
1. 발견한 문제 목록
2. 우선순위 높은 수정 3개
3. 수정 코드
4. 적용 위치
5. 테스트 체크리스트`,
    ],

    db: `너는 Supabase와 PostgreSQL을 잘 아는 백엔드 설계자야.
나는 Next.js App Router로 MVP를 만들고 있고, 아직 개발 초보자야.
아래 기획을 바탕으로 Supabase에 넣을 수 있는 안전한 데이터베이스 설계를 만들어줘.

${projectBrief}

DB 설계 목표:
- 첫 버전 MVP에 필요한 최소 테이블만 만들기
- 너무 복잡한 로그인/권한/결제 구조는 처음부터 넣지 않기
- 나중에 확장하기 쉬운 컬럼 이름 사용
- Supabase SQL Editor에 붙여넣어 실행 가능한 SQL 작성
- 샘플 데이터까지 포함해서 화면 개발에 바로 활용 가능하게 만들기

원하는 출력:
1. 테이블 구조 설명
2. 각 테이블이 왜 필요한지 설명
3. Supabase SQL Editor에 붙여넣을 전체 SQL
4. 샘플 insert 데이터
5. Next.js에서 데이터를 불러올 때 사용할 TypeScript interface
6. 나중에 로그인 기능을 붙일 때 확장할 방향
7. 초보자가 주의해야 할 보안 체크리스트

SQL 작성 조건:
- create table if not exists 사용
- id는 uuid 기본값 사용
- created_at 컬럼 포함
- updated_at이 필요하면 트리거까지 포함
- 텍스트 컬럼은 너무 짧게 제한하지 말 것
- status, category 같은 값은 처음에는 text로 단순하게 시작
- 개인정보, 결제 정보, 비밀번호는 저장하지 말 것
- RLS는 설명을 먼저 하고, 초보자용 기본 정책 예시를 따로 제시

주의사항:
- 실제 서비스용 민감정보를 샘플 데이터에 넣지 마
- 학교 이메일, 전화번호, 실명 같은 개인정보는 샘플에서 제외
- MVP 기준으로 단순하게 시작하되, 확장 가능성을 설명해줘
- SQL에 주석을 넣어 초보자가 이해할 수 있게 해줘

마지막에는 아래 형식의 실행 순서도 알려줘:
1. Supabase 프로젝트 만들기
2. SQL Editor 열기
3. SQL 붙여넣기
4. Run 실행
5. Table Editor에서 데이터 확인
6. Next.js에서 연결할 때 필요한 환경변수 이름만 안내`,
  };
}

export function buildToolPrompts(plan: PlanData): ToolPromptItem[] {
  const premium = buildPremiumStep3Prompts(plan);
  const projectBrief = buildProjectBrief(plan);

  return [
    {
      tool: "v0",
      badge: "UI 화면 생성",
      description: "첫 화면과 주요 컴포넌트 디자인을 빠르게 만들 때 사용합니다.",
      prompt: premium.ui.join("\n\n---\n\n"),
    },
    {
      tool: "Lovable",
      badge: "MVP 앱 생성",
      description: "아이디어를 하루 안에 확인 가능한 서비스 초안으로 만들 때 사용합니다.",
      prompt: `너는 Lovable에서 하루 안에 검증 가능한 MVP를 만드는 제품 설계자야.
아래 기획을 바탕으로 실제로 클릭 가능한 웹앱 초안을 만들어줘.

${projectBrief}

MVP 원칙:
- 로그인, 결제, 실시간 채팅은 꼭 필요하지 않으면 제외
- 첫 버전은 핵심 기능 3개 이내로 제한
- 사용자가 첫 화면에서 바로 무엇을 해야 하는지 알 수 있어야 함
- 샘플 데이터로 동작하는 화면을 먼저 완성
- 나중에 Supabase를 붙일 수 있게 데이터 구조를 단순하게 정리

요구사항:
1. 화면 구조를 먼저 설명해줘
2. 핵심 사용자 흐름을 단계별로 정리해줘
3. 구현할 기능과 제외할 기능을 구분해줘
4. 초보자가 수정하기 쉬운 파일 구조로 만들어줘
5. 모바일 화면도 반드시 고려해줘
6. 배포 전 체크리스트를 포함해줘

금지사항:
- 처음부터 너무 많은 기능을 넣지 마
- 민감정보나 API 키를 코드에 넣지 마
- 복잡한 인증 구조를 임의로 추가하지 마`,
    },
    {
      tool: "Cursor",
      badge: "기존 코드 수정",
      description: "이미 만든 프로젝트에 기능을 붙이거나 고칠 때 사용합니다.",
      prompt: premium.ide.join("\n\n---\n\n"),
    },
    {
      tool: "Replit Agent",
      badge: "실행/배포 도움",
      description: "프로젝트를 실행 가능한 상태로 정리하고 배포까지 이어갈 때 사용합니다.",
      prompt: `너는 Replit Agent에서 초보자의 Next.js 프로젝트를 실행 가능한 상태로 정리하는 개발 도우미야.

${projectBrief}

요청:
1. 프로젝트 실행 방법을 단계별로 안내해줘
2. 필요한 패키지가 있다면 왜 필요한지 설명해줘
3. 환경변수가 필요하면 변수 이름만 알려주고 실제 값은 절대 만들지 마
4. 로컬 실행과 배포 실행의 차이를 설명해줘
5. 자주 나는 오류와 해결 방법을 정리해줘
6. Vercel 또는 Replit 배포 전 체크리스트를 만들어줘

주의:
- API 키를 코드에 직접 넣지 마
- .env.local 파일 내용은 GitHub에 올리지 않도록 안내해줘
- 초보자가 따라 할 수 있게 명령어와 확인 방법을 함께 적어줘`,
    },
    {
      tool: "ChatGPT",
      badge: "에러 해결 질문",
      description: "에러 메시지를 붙여넣고 해결 순서를 받을 때 사용합니다.",
      prompt: `너는 Next.js App Router 프로젝트를 함께 고치는 시니어 프론트엔드 개발자야.
나는 개발 초보자라서 한국어로 쉽게 설명해줘.

프로젝트 정보:
${projectBrief}

사용 기술:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Vercel 배포

현재 하려던 일:
${plan.features?.[0]?.name || "기능 구현"}

에러 메시지:
여기에 실제 터미널 에러 또는 브라우저 콘솔 에러를 붙여넣기

원하는 답변:
1. 이 에러가 왜 발생했는지 쉽게 설명
2. 가장 먼저 확인할 파일
3. 수정해야 할 코드 패턴
4. 최소 수정 코드 예시
5. npm run dev 또는 npm run build로 다시 확인하는 방법
6. 같은 오류를 다시 피하는 방법

주의:
- 기존 기능을 삭제하지 마
- 전체 파일을 갈아엎으라고 하지 말고 최소 수정부터 제안해줘
- 환경변수 값이나 API 키는 절대 코드에 하드코딩하지 마`,
    },
  ];
}

export function buildPresentationSummary(plan: PlanData): PresentationSummary {
  const featureNames = getFeatureNames(plan);

  const serviceName =
    plan.idea.trim().length > 0
      ? plan.idea.trim().split(/[,.!?。]/)[0].slice(0, 18)
      : "나의 바이브 프로젝트";

  return {
    serviceName,
    oneLiner: `${plan.target}를 위한 문제 해결형 웹서비스입니다.`,
    problem: plan.problem,
    target: plan.target,
    mainFeatures: featureNames.slice(0, 3),
    expectedEffect:
      "사용자는 복잡한 과정을 줄이고, 필요한 정보를 더 빠르게 확인할 수 있습니다.",
    futurePlan:
      "첫 버전에서는 핵심 기능만 제공하고, 이후 사용자 피드백을 바탕으로 로그인, 저장, 공유 기능을 확장할 수 있습니다.",
    oneMinuteScript: `안녕하세요. 저희가 기획한 서비스는 "${serviceName}"입니다. 이 서비스는 ${plan.target}가 겪는 문제를 해결하기 위해 만들었습니다. 핵심 기능은 ${featureNames
      .slice(0, 3)
      .join(", ")}입니다. 처음부터 모든 기능을 넣기보다, 하루 안에 만들 수 있는 MVP 형태로 시작해 실제 사용자 반응을 확인하는 것을 목표로 합니다. 앞으로는 사용자 피드백을 반영해 저장, 공유, 개인화 기능으로 확장할 계획입니다.`,
  };
}

export function getTodayRouteItems(): TodayRouteItem[] {
  return [
    {
      id: "narrow-idea",
      title: "아이디어를 한 문장으로 줄이기",
      description:
        "너무 큰 앱이 되지 않도록 누구의 어떤 문제를 해결하는지 한 문장으로 정리합니다.",
      estimatedMinutes: 10,
    },
    {
      id: "pick-features",
      title: "핵심 기능 3개만 고르기",
      description:
        "로그인, 결제, 채팅처럼 어려운 기능은 첫 버전에서 빼고 꼭 필요한 기능만 남깁니다.",
      estimatedMinutes: 15,
    },
    {
      id: "make-ui",
      title: "v0 또는 Lovable로 첫 화면 만들기",
      description:
        "도구별 프롬프트를 복사해서 첫 화면과 기본 구조를 생성합니다.",
      estimatedMinutes: 30,
    },
    {
      id: "run-code",
      title: "Cursor 또는 Replit에서 코드 실행하기",
      description:
        "생성된 코드를 실행하고, 화면이 브라우저에서 열리는지 확인합니다.",
      estimatedMinutes: 30,
    },
    {
      id: "fix-error",
      title: "에러 메시지 하나씩 해결하기",
      description:
        "에러가 나면 전체를 바꾸지 말고 첫 번째 에러부터 해결합니다.",
      estimatedMinutes: 40,
    },
    {
      id: "check-mobile",
      title: "모바일 화면 확인하기",
      description:
        "브라우저 개발자 도구에서 360px 화면으로 깨지는 부분이 없는지 확인합니다.",
      estimatedMinutes: 15,
    },
    {
      id: "deploy",
      title: "Vercel에 배포하기",
      description:
        "GitHub에 올린 뒤 Vercel로 배포하고, 친구에게 링크를 공유해 테스트를 받습니다.",
      estimatedMinutes: 30,
    },
  ];
}