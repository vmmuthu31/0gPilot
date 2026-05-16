export interface ExecutionLike {
  id?: string;
  node: string;
  status: string;
  log?: string | null;
  error?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface ProjectGenerationContext {
  prompt?: string | null;
  template?: string | null;
  framework?: string | null;
  blockchain?: string | null;
  status?: string | null;
  filesCount?: number;
  executions?: ExecutionLike[];
}

export type ProjectRuntime = "nextjs" | "react-native" | "contracts";

export interface ProjectStackProfile {
  runtime: ProjectRuntime;
  includeHardhat: boolean;
  previewMode: "web" | "terminal";
  labels: {
    runtime: string;
    contract: string;
    initialization: string;
    frontend: string;
    testing: string;
    deploy: string;
  };
}

export type PhaseState =
  | "completed"
  | "running"
  | "pending"
  | "failed"
  | "skipped";

export interface GenerationPhase {
  id: string;
  node?: string;
  title: string;
  description: string;
  state: PhaseState;
  log?: string | null;
  error?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

function normalize(value?: string | null): string {
  return value?.trim().toLowerCase() ?? "";
}

export function deriveProjectStack(
  context: Pick<
    ProjectGenerationContext,
    "prompt" | "template" | "framework" | "blockchain"
  >,
): ProjectStackProfile {
  const template = normalize(context.template);
  const framework = normalize(context.framework);
  const blockchain = normalize(context.blockchain);
  const prompt = normalize(context.prompt);

  const runtime: ProjectRuntime =
    template === "react-native" || template === "mobile"
      ? "react-native"
      : template === "solidity" || template === "contracts"
        ? "contracts"
        : framework.includes("react native")
          ? "react-native"
          : framework.includes("solidity")
            ? "contracts"
            : "nextjs";

  const includeHardhat =
    runtime === "contracts" ||
    Boolean(blockchain) ||
    prompt.includes("contract") ||
    prompt.includes("dapp") ||
    prompt.includes("blockchain");

  const runtimeLabel =
    runtime === "react-native"
      ? "React Native"
      : runtime === "contracts"
        ? "Hardhat"
        : "Next.js";

  const contractLabel = includeHardhat ? "Hardhat" : "Contracts";
  const initialization =
    runtime === "contracts"
      ? "Initialize Hardhat contract workspace"
      : includeHardhat
        ? `Initialize ${runtimeLabel} + Hardhat workspace`
        : `Initialize ${runtimeLabel} workspace`;

  return {
    runtime,
    includeHardhat,
    previewMode: runtime === "nextjs" ? "web" : "terminal",
    labels: {
      runtime: runtimeLabel,
      contract: contractLabel,
      initialization,
      frontend:
        runtime === "react-native"
          ? "Generate React Native application"
          : runtime === "contracts"
            ? "Generate companion app surface"
            : "Generate Next.js application",
      testing:
        includeHardhat && runtime !== "contracts"
          ? `${runtimeLabel} + Hardhat test coverage`
          : includeHardhat
            ? "Hardhat test coverage"
            : `${runtimeLabel} test coverage`,
      deploy:
        runtime === "contracts"
          ? "Prepare contract deployment"
          : includeHardhat
            ? "Prepare app + contract deployment"
            : "Prepare deployment",
    },
  };
}

function buildPhaseBlueprints(stack: ProjectStackProfile): Omit<GenerationPhase, "state">[] {
  return [
    {
      id: "project_init",
      title: stack.labels.initialization,
      description:
        stack.runtime === "contracts"
          ? "Create the contract scaffold, dependencies, scripts, and baseline config before agent outputs land."
          : stack.includeHardhat
            ? `Set up the ${stack.labels.runtime} app shell alongside the Hardhat contract workspace so generation starts on the right foundation.`
            : `Create the ${stack.labels.runtime} app shell and baseline configuration before agent generation continues.`,
    },
    {
      id: "retrieve_memory",
      node: "retrieve_memory",
      title: "Retrieve memory context",
      description: "Look up similar previous builds to condition the generation run.",
    },
    {
      id: "validate",
      node: "validate",
      title: "Validate request",
      description: "Sanity-check the prompt and workflow inputs before generation starts.",
    },
    {
      id: "planner",
      node: "planner",
      title: "Plan architecture",
      description: "Define the system architecture, modules, and implementation shape for this stack.",
    },
    {
      id: "frontendNode",
      node: "frontendNode",
      title: stack.labels.frontend,
      description:
        stack.runtime === "react-native"
          ? "Generate the mobile UI, flows, and app structure for the requested experience."
          : stack.runtime === "contracts"
            ? "Generate any companion interface or user-facing entry points needed around the contracts."
            : "Generate the web UI, routes, and frontend interactions for the requested product.",
    },
    {
      id: "contractsNode",
      node: "contractsNode",
      title: `Generate ${stack.labels.contract} contracts`,
      description:
        stack.includeHardhat
          ? "Create the contract layer, deployment scripts, and onchain integration surface."
          : "Create the contract layer required by the requested product.",
    },
    {
      id: "database",
      node: "database",
      title: "Design persistence",
      description: "Define the data model and persistence plan for the generated project.",
    },
    {
      id: "auditNode",
      node: "auditNode",
      title: "Run contract audit pass",
      description: "Audit the generated contract layer for obvious correctness and safety issues.",
    },
    {
      id: "backendNode",
      node: "backendNode",
      title: "Generate backend services",
      description: "Create the APIs, server workflows, and integration logic around the product.",
    },
    {
      id: "build_join",
      node: "build_join",
      title: "Assemble generated files",
      description: "Join agent outputs into the final project tree and write the production scaffold.",
    },
    {
      id: "testing",
      node: "testing",
      title: `Generate ${stack.labels.testing}`,
      description: "Create the testing surface needed to validate the generated project.",
    },
    {
      id: "deployNode",
      node: "deployNode",
      title: stack.labels.deploy,
      description:
        stack.runtime === "contracts"
          ? "Prepare deployment artifacts and metadata for the generated contract stack."
          : "Prepare deployment artifacts and environment assumptions for the generated project.",
    },
    {
      id: "github",
      node: "github",
      title: "Publish repository",
      description: "Push the assembled project to the connected Git provider when credentials are available.",
    },
    {
      id: "vercel",
      node: "vercel",
      title:
        stack.runtime === "nextjs"
          ? "Deploy web app"
          : "Publish preview target",
      description:
        stack.runtime === "nextjs"
          ? "Deploy the generated web experience when a Vercel integration is connected."
          : "Attempt the configured preview/deployment handoff when the stack supports it.",
    },
    {
      id: "analyticsNode",
      node: "analyticsNode",
      title: "Generate analytics plan",
      description: "Produce the analytics and observability recommendations for the shipped project.",
    },
    {
      id: "memory",
      node: "memory",
      title: "Persist project memory",
      description: "Store the finished project memory and register the execution trail.",
    },
  ];
}

function getExecutionState(execution: ExecutionLike): PhaseState {
  if (execution.status === "FAILED" || execution.error) return "failed";
  if (/skipped/i.test(execution.log ?? "")) return "skipped";
  return "completed";
}

export function buildGenerationPhases(
  context: ProjectGenerationContext,
): GenerationPhase[] {
  const stack = deriveProjectStack(context);
  const blueprints = buildPhaseBlueprints(stack);
  const executions = context.executions ?? [];
  const executionMap = new Map(executions.map((execution) => [execution.node, execution]));
  const workflowActive =
    context.status === "PENDING" || context.status === "RUNNING" || context.status === "DEPLOYING";
  const initComplete = (context.filesCount ?? 0) > 0 || executions.some((execution) => execution.node === "build_join" || execution.node === "github");

  const firstIncompleteIndex = blueprints.findIndex((phase) => {
    if (phase.id === "project_init") return !initComplete;
    return !executionMap.has(phase.node ?? "");
  });

  return blueprints.map((phase, index) => {
    if (phase.id === "project_init") {
      const state: PhaseState = initComplete
        ? "completed"
        : workflowActive
          ? "running"
          : "pending";

      return {
        ...phase,
        state,
      };
    }

    const execution = executionMap.get(phase.node ?? "");
    if (execution) {
      return {
        ...phase,
        state: getExecutionState(execution),
        log: execution.log,
        error: execution.error,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
      };
    }

    const isCurrent = workflowActive && firstIncompleteIndex === index && initComplete;
    return {
      ...phase,
      state: isCurrent ? "running" : "pending",
    };
  });
}

export function getCurrentGenerationPhase(
  context: ProjectGenerationContext,
): GenerationPhase | null {
  const phases = buildGenerationPhases(context);
  return phases.find((phase) => phase.state === "running") ?? null;
}

export function isRunnablePreviewStack(
  context: Pick<ProjectGenerationContext, "template" | "framework" | "blockchain" | "prompt">,
): boolean {
  return deriveProjectStack(context).previewMode === "web";
}
