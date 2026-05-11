import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import { plannerNode } from "./nodes/planner.node";
import { frontendNode } from "./nodes/frontend.node";
import { contractNode } from "./nodes/contract.node";
import { auditNode } from "./nodes/audit.node";
import { deployNode } from "./nodes/deploy.node";

const GraphState = Annotation.Root({
  prompt: Annotation<string>(),

  architecture: Annotation<string>(),

  frontend: Annotation<string>(),

  contracts: Annotation<string>(),

  audit: Annotation<string>(),

  deployment: Annotation<string>(),

  status: Annotation<string>(),

  error: Annotation<string>(),
});

export function createWorkflow() {
  const workflow = new StateGraph(GraphState)

    .addNode("planner", plannerNode)

    .addNode("frontend", frontendNode)

    .addNode("contracts", contractNode)

    .addNode("audit", auditNode)

    .addNode("deployment", deployNode)

    .addEdge(START, "planner")

    .addEdge("planner", "frontend")

    .addEdge("planner", "contracts")

    .addEdge("contracts", "audit")

    .addEdge("frontend", "deployment")

    .addEdge("audit", "deployment")

    .addEdge("deployment", END);

  return workflow.compile();
}

export async function executeWorkflow(prompt: string) {
  try {
    const graph = createWorkflow();

    const result = await graph.invoke({
      prompt,
    });

    return {
      success: true,

      result,
    };
  } catch (error: unknown) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Workflow execution failed";
    return {
      success: false,

      error: message || "Workflow execution failed",
    };
  }
}
