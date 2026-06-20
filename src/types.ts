
export enum AppState {
  IDLE = 'IDLE',
  DRAWING = 'DRAWING',
  PROCESSING = 'PROCESSING',
  RESULT = 'BOOM'
}

export interface HistoryItem {
  id: string;
  latex: string;
  timestamp: number;
  image?: string;
}

export type ProcessingMode = 'local' | 'cloud';
