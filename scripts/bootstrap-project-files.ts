import "dotenv/config";
import { projectBuilderService } from "../src/services/project-builder.service";
import { db } from "../src/db";

const PROJECT_ID = process.argv[2];

if (!PROJECT_ID) {
  console.error("Usage: npx tsx scripts/bootstrap-project-files.ts <projectId>");
  process.exit(1);
}

async function main() {
  const project = await db.project.findUnique({
    where: { id: PROJECT_ID },
  });

  if (!project) {
    console.error(`Project ${PROJECT_ID} not found`);
    process.exit(1);
  }

  console.log(`Bootstrapping scaffold for: ${project.prompt.slice(0, 60)}...`);

  await projectBuilderService.build({
    projectId: project.id,
    prompt: project.prompt,
    architecture: `# NFT Marketplace Architecture\n\nThis is an NFT marketplace built on 0G Chain with Next.js.\n\n## Components\n- Frontend: Next.js with TypeScript\n- Smart Contracts: Solidity (ERC-721, Marketplace)\n- Blockchain: 0G Chain`,
    frontend: undefined,
    backend: undefined,
    contracts: undefined,
    tests: undefined,
    template: project.template ?? undefined,
  });

  const files = await projectBuilderService.listFiles(project.id);
  console.log(`✅ Written ${files.length} scaffold files:`);
  files.forEach((f) => console.log(`  - ${f}`));

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
