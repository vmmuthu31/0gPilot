export interface WorkflowState {
  prompt: string;

  architecture?: string;

  frontend?: string;

  contracts?: string;

  audit?: string;

  deployment?: string;

  memoryHash?: string;

  status?: string;

  error?: string;
}
