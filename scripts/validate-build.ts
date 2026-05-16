import { projectBuilderService } from "../src/services/project-builder.service";

async function run() {
  const outputs = {
    projectId: `validate_nextjs_${Date.now()}`,
    prompt: "Validate nextjs scaffold",
    frontend: "",
    backend: "",
    contracts: "",
    tests: "",
    template: "nextjs",
  } as Record<string, string>;

  console.log("Building project with id:", outputs.projectId);
  const res = await projectBuilderService.build(outputs);
  console.log("Built", res.fileCount, "files at", res.rootDir);
  console.log("Files:");
  for (const f of Object.keys(res.files)) {
    console.log(" -", f);
  }
}

run().catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
