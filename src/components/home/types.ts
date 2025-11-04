export type LoopItem = {
  id: number;
  title: string;
  loopDate: string;
  completed: boolean;
  totalChecklists: number;
  completedChecklists: number;
};

export type LoopsResponse = {
  success: boolean;
  code: string;
  message: string;
  data: {
    totalProgress: number;
    loops: LoopItem[];
  };
  page?: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
  };
  timestamp: string;
  traceId: string;
};

