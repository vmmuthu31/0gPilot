export interface WorkflowState {
  projectId?: string;

  prompt: string;

  architecture?: string;

  frontend?: string;

  contracts?: string;

  audit?: string;

  backend?: string;

  databaseDesign?: string;

  tests?: string;

  analytics?: string;

  memoryHash?: string;

  status?: string;

  error?: string;
}
