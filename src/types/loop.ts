export interface LoopChecklist {
  id: number;
  content: string;
  completed: boolean;
}

export interface LoopRule {
  ruleId: number;
  scheduleType: string;
  daysOfWeek?: string[];
  startDate?: string | null;
  endDate?: string | null;
}

export interface LoopDetail {
  id: number;
  title: string;
  content: string | null;
  loopDate: string;
  progress: number;
  checklists: LoopChecklist[];
  loopRule?: LoopRule;
  // 하위 호환성을 위해 유지
  scheduleType?: string;
  daysOfWeek?: string[];
  startDate?: string | null;
  endDate?: string | null;
  loopRuleId?: number;
}



