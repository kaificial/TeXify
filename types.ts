
export interface ConversionResult {
  latex: string;
  confidence: number;
}

export enum AppState {
  IDLE = 'IDLE',
  DRAWING = 'DRAWING',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  RESULT = 'BOOM'
}
