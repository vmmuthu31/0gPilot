export interface WorkflowState {
  projectId?: string;

  prompt: string;

  template?: string;

  architecture?: string;

  frontend?: string;

  contracts?: string;

  audit?: string;

  backend?: string;

  deployment?: string;

  databaseDesign?: string;

  tests?: string;

  analytics?: string;

  memoryHash?: string;

  status?: string;

  error?: string;
}
