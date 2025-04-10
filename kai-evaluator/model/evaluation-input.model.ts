export interface Incident {
  message: string;
  codeSnip: string;
  lineNumber: number;
}

export interface FileEvaluationInput {
  originalContent: string;
  incidents: Incident[];
  updatedContent: string;
}