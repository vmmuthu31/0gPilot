import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySession, extractBearerToken } from "@/server/auth/session";
import { db } from "@/db";

export const dynamic = "force-dynamic";

const REGISTERED_AGENTS = [
  {
    id: "planner",
    name: "Planner Agent",
    capability: "planner",
    description: "Decomposes user prompts into detailed project architectures.",
    status: "active",
    model: "Llama-3.3-70B-Instruct",
  },
  {
    id: "frontend",
    name: "Frontend Agent",
    capability: "frontend",
    description: "Generates Next.js + TailwindCSS UI components and pages.",
    status: "active",
    model: "Llama-3.3-70B-Instruct",
  },
  {
    id: "contract",
    name: "Contract Agent",
    capability: "contract",
    description: "Writes audited Solidity smart contracts for 0G Chain.",
    status: "active",
    model: "Llama-3.3-70B-Instruct",
  },
  {
    id: "audit",
    name: "Audit Agent",
    capability: "audit",
    description: "Reviews contracts for security vulnerabilities and gas optimisations.",
    status: "active",
    model: "Llama-3.3-70B-Instruct",
  },
  {
    id: "backend",
    name: "Backend Agent",
    capability: "backend",
    description: "Scaffolds Node.js API routes, database schemas, and service layers.",
    status: "active",
    model: "Llama-3.3-70B-Instruct",
  },
  {
    id: "database",
    name: "Database Agent",
    capability: "database",
    description: "Designs PostgreSQL schemas, migrations, and Prisma models.",
    status: "active",
    model: "Llama-3.3-70B-Instruct",
  },
  {
    id: "testing",
    name: "Testing Agent",
    capability: "testing",
    description: "Generates unit tests (Jest) and Hardhat contract tests.",
    status: "active",
    model: "Llama-3.3-70B-Instruct",
  },
  {
    id: "deploy",
    name: "Deploy Agent",
    capability: "deploy",
    description: "Compiles Solidity and deploys contracts to 0G Chain autonomously.",
    status: "active",
    model: "Llama-3.3-70B-Instruct",
  },
];

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("Authorization"));
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: { code: "INVALID_TOKEN" } }, { status: 401 });
  }

  const recentExecutions = await db.execution.groupBy({
    by: ["node"],
    where: { userId: session.userId },
    _count: { id: true },
  }).catch(() => []);

  const executionMap = new Map(
    recentExecutions.map((e) => [e.node, e._count.id]),
  );

  const agents = REGISTERED_AGENTS.map((agent) => ({
    ...agent,
    runsForUser: executionMap.get(agent.capability) ?? 0,
  }));

  return NextResponse.json({ agents });
}
