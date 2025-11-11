export interface LoopChecklist {
  id: number;
  content: string;
  completed: boolean;
}

export interface LoopDetail {
  id: number;
  title: string;
  content: string | null;
  loopDate: string;
  progress: number;
  checklists: LoopChecklist[];
  scheduleType?: string;
  daysOfWeek?: string[];
  endDate?: string | null;
}



