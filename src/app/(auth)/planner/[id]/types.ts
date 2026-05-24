export type MessageAuthor = "user" | "assistant";

export type RecommendationSchedule = {
  title: string;
  content: string;
  scheduleType: string;
  specificDate?: string;
  daysOfWeek?: string[];
  startDate?: string;
  endDate?: string;
  checklists?: string[];
  loopRuleId?: number;
};

export type ChatMessage = {
  id: string;
  author: MessageAuthor;
  content: string;
};
