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

function featureToText(feature: FeatureItem, index: number) {
  const criteria =
    feature.criteria && feature.criteria.length > 0
      ? `\n   확인 기준: ${feature.criteria.join(", ")}`
      : "";

  return `${index + 1}. ${feature.name}: ${feature.desc}${criteria}`;
}

function screenToText(screen: ScreenItem, index: number) {
  return `${index + 1}. ${screen.name}: ${screen.desc}`;
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

export function buildToolPrompts(plan: PlanData): ToolPromptItem[] {
  const features = getFeatureTexts(plan).join("\n");
  const screens = getScreenTexts(plan).join("\n");

  return [
    {
      tool: "v0",
      badge: "UI 화면 생성",
      description: "첫 화면과 주요 컴포넌트 디자인을 빠르게 만들 때 사용합니다.",
      prompt: `다음 서비스의 반응형 웹 UI를 만들어줘.

서비스 아이디어:
${plan.idea}

대상 사용자:
${plan.target}

필요한 화면:
${screens}

핵심 기능:
${features}

요구사항:
- Next.js App Router 기준
- React + TypeScript 사용
- Tailwind CSS 사용
- 모바일 360px에서도 깨지지 않게 구성
- 비전공자 대학생이 이해하기 쉬운 한국어 문구 사용
- 카드, 배지, 큰 버튼을 활용해 친근하지만 신뢰감 있는 디자인으로 만들어줘
- 아직 실제 DB 연결은 하지 말고, 우선 화면과 샘플 데이터 중심으로 만들어줘`,
    },
    {
      tool: "Lovable",
      badge: "MVP 앱 생성",
      description: "아이디어를 하루 안에 확인 가능한 서비스 초안으로 만들 때 사용합니다.",
      prompt: `아래 아이디어를 바탕으로 하루 안에 만들 수 있는 MVP 웹앱을 설계하고 구현해줘.

서비스 아이디어:
${plan.idea}

문제 정의:
${plan.problem}

대상 사용자:
${plan.target}

핵심 기능:
${features}

필요한 화면:
${screens}

주의사항:
- 처음 버전은 너무 복잡하게 만들지 말고 핵심 기능만 구현
- 로그인, 결제, 실시간 채팅은 꼭 필요하지 않으면 제외
- 초보자가 수정하기 쉬운 구조로 만들어줘
- 화면에서 바로 이해되는 한국어 문구를 사용해줘
- 배포 전에 확인해야 할 체크리스트도 함께 알려줘`,
    },
    {
      tool: "Cursor",
      badge: "기존 코드 수정",
      description: "이미 만든 프로젝트에 기능을 붙이거나 고칠 때 사용합니다.",
      prompt: `내 Next.js 프로젝트에 아래 기능을 추가하고 싶어.

서비스 아이디어:
${plan.idea}

추가하고 싶은 핵심 기능:
${features}

필요한 화면:
${screens}

수정 방식:
- 기존 기능과 디자인을 삭제하지 말아줘
- 변경할 파일을 먼저 알려줘
- TypeScript 기준으로 작성해줘
- 브라우저 전용 객체(window, localStorage, document)는 안전하게 사용해줘
- 에러 상태, 로딩 상태, 빈 상태를 고려해줘
- 초보자도 따라 할 수 있게 적용 순서를 설명해줘
- 한 번에 전체를 갈아엎지 말고 최소한의 파일만 수정해줘`,
    },
    {
      tool: "Replit Agent",
      badge: "실행/배포 도움",
      description: "프로젝트를 실행 가능한 상태로 정리하고 배포까지 이어갈 때 사용합니다.",
      prompt: `다음 웹서비스 MVP를 실행 가능한 프로젝트로 정리해줘.

아이디어:
${plan.idea}

핵심 기능:
${features}

필요한 화면:
${screens}

요청:
- 실행 방법을 단계별로 알려줘
- 필요한 환경변수가 있다면 이름만 알려주고 실제 값은 예시로 만들지 마
- 초보자가 자주 만나는 오류와 해결 방법을 같이 정리해줘
- 배포 전 확인할 항목을 체크리스트로 만들어줘
- 처음에는 무료 배포와 무료 DB 사용을 기준으로 안내해줘`,
    },
    {
      tool: "ChatGPT",
      badge: "에러 해결 질문",
      description: "에러 메시지를 붙여넣고 해결 순서를 받을 때 사용합니다.",
      prompt: `아래 프로젝트를 만들다가 에러가 발생했어. 초보자도 이해할 수 있게 설명하고 고치는 순서를 알려줘.

프로젝트 아이디어:
${plan.idea}

사용 기술:
Next.js App Router, React, TypeScript, Tailwind CSS

현재 하려던 기능:
${plan.features?.[0]?.name || "기능 구현"}

에러 메시지:
여기에 에러 메시지를 붙여넣기

원하는 답변:
1. 이 에러가 무슨 뜻인지
2. 어느 파일을 확인해야 하는지
3. 가장 먼저 고칠 부분
4. 수정 코드 예시
5. 다시 실행해서 확인하는 방법`,
    },
  ];
}

export function buildPresentationSummary(plan: PlanData): PresentationSummary {
  const featureNames =
    plan.features && plan.features.length > 0
      ? plan.features.map((feature) => feature.name)
      : ["핵심 기능 정리", "화면 구성", "사용자 문제 해결"];

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