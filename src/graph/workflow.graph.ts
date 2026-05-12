import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { emitWorkflowEvent } from "@/server/events/emitter";
import { db } from "@/db";

import { validateNode } from "./nodes/validate.node";
import { plannerNode } from "./nodes/planner.node";
import { frontendNode } from "./nodes/frontend.node";
import { contractNode } from "./nodes/contract.node";
import { auditNode } from "./nodes/audit.node";
import { backendNode } from "./nodes/backend.node";
import { buildJoinNode } from "./nodes/build_join.node";
import { testingNode } from "./nodes/testing.node";
import { deployNode } from "./nodes/deploy.node";
import { deploySkippedNode } from "./nodes/deploy_skipped.node";
import { analyticsNode } from "./nodes/analytics.node";
import { memoryNode } from "./nodes/memory.node";
import { retrieveMemoryNode } from "./nodes/retrieve_memory.node";
import { githubNode } from "./nodes/github.node";
import { vercelNode } from "./nodes/vercel.node";

import { WorkflowState } from "./state";

const GraphState = Annotation.Root({
  projectId: Annotation<string>(),
  prompt: Annotation<string>(),
  architecture: Annotation<string>(),
  frontend: Annotation<string>(),
  contracts: Annotation<string>(),
  audit: Annotation<string>(),
  deployment: Annotation<string>(),
  backend: Annotation<string>(),
  tests: Annotation<string>(),
  analytics: Annotation<string>(),
  memoryHash: Annotation<string>(),
  status: Annotation<string>(),
  error: Annotation<string>(),
});

function createProjectId(): string {
  const maybeCrypto = globalThis.crypto;
  if (maybeCrypto?.randomUUID) {
    return maybeCrypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createWorkflow() {
  const workflow = new StateGraph(GraphState)
    .addNode("validate", validateNode)
    .addNode("planner", plannerNode)
    .addNode("frontend", frontendNode)
    .addNode("contracts", contractNode)
    .addNode("audit", auditNode)
    .addNode("backend", backendNode)
    .addNode("build_join", buildJoinNode)
    .addNode("testing", testingNode)
    .addNode("deployment", deployNode)
    .addNode("deployment_skipped", deploySkippedNode)
    .addNode("github", githubNode)
    .addNode("vercel", vercelNode)
    .addNode("analytics", analyticsNode)
    .addNode("memory", memoryNode)
    .addNode("retrieve_memory", retrieveMemoryNode)

    .addEdge(START, "retrieve_memory")
    .addEdge("retrieve_memory", "validate")
    .addEdge("validate", "planner")
    .addEdge("planner", "frontend")
    .addEdge("planner", "contracts")
    .addEdge("contracts", "audit")
    .addEdge("contracts", "backend")
    .addEdge(["frontend", "audit", "backend"], "build_join")
    .addEdge("build_join", "testing")
    .addConditionalEdges(
      "testing",
      (state: WorkflowState) =>
        state.error ? "deployment_skipped" : "deployment",
      ["deployment", "deployment_skipped"],
    )
    .addEdge("deployment", "github")
    .addEdge("deployment_skipped", "github")
    .addEdge("github", "vercel")
    .addEdge("vercel", "analytics")
    .addEdge("analytics", "memory")
    .addEdge("memory", END);

  return workflow.compile();
}

export async function executeWorkflow(prompt: string, projectId?: string) {
  try {
    const graph = createWorkflow();
    const pId = projectId ?? createProjectId();

    await db.project.update({
      where: { id: pId },
      data: { status: "RUNNING" },
    }).catch(() => {});

    const stream = await graph.stream({ projectId: pId, prompt });

    let finalState: Partial<WorkflowState> | null = null;

    for await (const chunk of stream) {
      const nodeName = Object.keys(chunk)[0];
      finalState = (chunk as Record<string, Partial<WorkflowState>>)[nodeName];

      emitWorkflowEvent(pId, `NODE_COMPLETED:${nodeName}`, {
        status: finalState?.status || "Completed",
        error: finalState?.error,
      });

      await db.execution.create({
        data: {
          projectId: pId,
          userId: (await db.project.findUnique({ where: { id: pId }, select: { userId: true } }))?.userId ?? "",
          node: nodeName,
          status: finalState?.error ? "FAILED" : "COMPLETED",
          log: finalState?.status,
          error: finalState?.error,
          completedAt: new Date(),
        },
      }).catch(() => {});
    }

    const finalStatus = finalState?.error ? "FAILED" : "COMPLETED";

    await db.project.update({
      where: { id: pId },
      data: {
        status: finalStatus,
        memoryHash: finalState?.memoryHash,
      },
    }).catch(() => {});

    return { success: true, result: finalState };
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Workflow execution failed";

    await db.project.update({
      where: { id: projectId ?? "" },
      data: { status: "FAILED" },
    }).catch(() => {});

    return { success: false, error: message || "Workflow execution failed" };
  }
}
