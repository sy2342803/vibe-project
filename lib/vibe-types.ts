export type Theme = "light" | "dark";
export type MentorTone = "kind" | "tsundere";
export type ChatToolType = "plan" | "error" | "prompt" | "mock" | "commit" | "guide";

export interface FeatureItem {
  id: string;
  name: string;
  desc: string;
  criteria: string[];
}

export interface ScreenItem {
  id: string;
  name: string;
  desc: string;
}

export interface PlanContent {
  summary: string;
  problem: string;
  target: string;
  userStories: string[];
  features: FeatureItem[];
  screens: ScreenItem[];
  prompts: {
    ui: string[];
    ide: string[];
    db: string;
  };
}

export interface PlanData extends PlanContent {
  id: string;
  timestamp: string;
  idea: string;
  platform: string;
  bm: string;
}

export interface ErrorGuideData {
  cause: string;
  explanation: string;
  solution: string;
  steps: string[];
  prompt: string;
}

export interface PromptCoachData {
  original: string;
  improved: string;
  reasons: string[];
  tips: string[];
}

export interface MockDataResult {
  jsonCode: string;
}

export interface CommitResult {
  message: string;
}
