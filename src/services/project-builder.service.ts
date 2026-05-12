import "server-only";
import path from "path";
import fs from "fs/promises";

export interface AgentOutputs {
  projectId: string;
  prompt: string;
  architecture?: string;
  frontend?: string;
  backend?: string;
  contracts?: string;
  tests?: string;
}

export interface BuiltProject {
  rootDir: string;
  files: Record<string, string>;
  fileCount: number;
}

const OUTPUT_BASE = path.join(process.cwd(), "generated");

class ProjectBuilderService {
  async build(outputs: AgentOutputs): Promise<BuiltProject> {
    const projectDir = path.join(OUTPUT_BASE, outputs.projectId);

    await fs.mkdir(projectDir, { recursive: true });

    const files: Record<string, string> = {};

    const readme = this.buildReadme(outputs);
    files["README.md"] = readme;
    await this.writeFile(projectDir, "README.md", readme);

    if (outputs.frontend) {
      const frontendFiles = this.extractCodeBlocks(outputs.frontend, "tsx|ts|jsx|js|css|html");
      for (const [filename, content] of Object.entries(frontendFiles)) {
        const dest = `app/${filename}`;
        files[dest] = content;
        await this.writeFile(projectDir, dest, content);
      }

      if (Object.keys(frontendFiles).length === 0) {
        files["app/page.tsx"] = outputs.frontend;
        await this.writeFile(projectDir, "app/page.tsx", outputs.frontend);
      }
    }

    if (outputs.backend) {
      const backendFiles = this.extractCodeBlocks(outputs.backend, "ts|js|json");
      for (const [filename, content] of Object.entries(backendFiles)) {
        const dest = `api/${filename}`;
        files[dest] = content;
        await this.writeFile(projectDir, dest, content);
      }

      if (Object.keys(backendFiles).length === 0) {
        files["api/server.ts"] = outputs.backend;
        await this.writeFile(projectDir, "api/server.ts", outputs.backend);
      }
    }

    if (outputs.contracts) {
      const contractFiles = this.extractCodeBlocks(outputs.contracts, "sol");
      for (const [filename, content] of Object.entries(contractFiles)) {
        const dest = `contracts/${filename}`;
        files[dest] = content;
        await this.writeFile(projectDir, dest, content);
      }

      if (Object.keys(contractFiles).length === 0) {
        files["contracts/Contract.sol"] = outputs.contracts;
        await this.writeFile(projectDir, "contracts/Contract.sol", outputs.contracts);
      }
    }

    if (outputs.tests) {
      files["tests/index.test.ts"] = outputs.tests;
      await this.writeFile(projectDir, "tests/index.test.ts", outputs.tests);
    }

    const packageJson = this.buildPackageJson(outputs.prompt);
    files["package.json"] = JSON.stringify(packageJson, null, 2);
    await this.writeFile(projectDir, "package.json", JSON.stringify(packageJson, null, 2));

    return {
      rootDir: projectDir,
      files,
      fileCount: Object.keys(files).length,
    };
  }

  async getProjectDir(projectId: string): Promise<string> {
    return path.join(OUTPUT_BASE, projectId);
  }

  async listFiles(projectId: string): Promise<string[]> {
    const dir = path.join(OUTPUT_BASE, projectId);
    return this.walkDir(dir, dir);
  }

  async readFile(projectId: string, relativePath: string): Promise<string | null> {
    try {
      const filePath = path.join(OUTPUT_BASE, projectId, relativePath);
      return await fs.readFile(filePath, "utf-8");
    } catch {
      return null;
    }
  }

  private async writeFile(
    projectDir: string,
    relativePath: string,
    content: string
  ): Promise<void> {
    const fullPath = path.join(projectDir, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
  }

  private extractCodeBlocks(
    text: string,
    extensions: string
  ): Record<string, string> {
    const files: Record<string, string> = {};
    const extPattern = extensions.split("|").join("|");

    const filenameBlockRegex = new RegExp(
      `(?:###?\\s+([\\w./\\-]+\\.(?:${extPattern}))|\\*\\*([\\w./\\-]+\\.(?:${extPattern}))\\*\\*|([\\w./\\-]+\\.(?:${extPattern})):?\\s*\\n)\\s*\`\`\`(?:${extPattern}|\\w+)?\\n([\\s\\S]*?)\`\`\``,
      "gi"
    );

    let match;
    while ((match = filenameBlockRegex.exec(text)) !== null) {
      const filename = (match[1] || match[2] || match[3])?.trim();
      const content = match[4]?.trim();
      if (filename && content) {
        files[filename] = content;
      }
    }

    if (Object.keys(files).length === 0) {
      const genericBlockRegex = new RegExp(
        `\`\`\`(?:${extPattern}|\\w+)?\\n([\\s\\S]*?)\`\`\``,
        "gi"
      );
      let idx = 0;
      const extList = extensions.split("|");
      while ((match = genericBlockRegex.exec(text)) !== null) {
        const ext = extList[idx % extList.length];
        files[`file_${idx}.${ext}`] = match[1].trim();
        idx++;
      }
    }

    return files;
  }

  private buildReadme(outputs: AgentOutputs): string {
    const lines: string[] = [
      `# Generated Project`,
      ``,
      `**Prompt:** ${outputs.prompt}`,
      ``,
      `**Project ID:** \`${outputs.projectId}\``,
      ``,
      `---`,
      ``,
      `## Architecture`,
      ``,
      outputs.architecture || "_No architecture generated._",
      ``,
    ];
    return lines.join("\n");
  }

  private buildPackageJson(prompt: string) {
    const name = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join("-");

    return {
      name: name || "generated-project",
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
      },
      dependencies: {
        next: "^14.0.0",
        react: "^18.0.0",
        "react-dom": "^18.0.0",
      },
    };
  }

  private async walkDir(base: string, current: string): Promise<string[]> {
    const entries = await fs.readdir(current, { withFileTypes: true });
    const results: string[] = [];
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        results.push(...(await this.walkDir(base, full)));
      } else {
        results.push(path.relative(base, full));
      }
    }
    return results;
  }
}

export const projectBuilderService = new ProjectBuilderService();
