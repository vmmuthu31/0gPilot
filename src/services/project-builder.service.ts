import "server-only";
import path from "path";
import fs from "fs/promises";
import { emitWorkflowEvent } from "@/server/events/emitter";

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
      const frontendFiles = this.extractCodeBlocks(
        outputs.frontend,
        "tsx|ts|jsx|js|css|html",
      );
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
      const backendFiles = this.extractCodeBlocks(
        outputs.backend,
        "ts|js|json",
      );
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
        await this.writeFile(
          projectDir,
          "contracts/Contract.sol",
          outputs.contracts,
        );
      }
    }

    if (outputs.tests) {
      files["tests/index.test.ts"] = outputs.tests;
      await this.writeFile(projectDir, "tests/index.test.ts", outputs.tests);
    }

    const packageJson = this.buildPackageJson(outputs.prompt);
    files["package.json"] = JSON.stringify(packageJson, null, 2);
    await this.writeFile(
      projectDir,
      "package.json",
      JSON.stringify(packageJson, null, 2),
    );

    const scaffoldFiles = this.buildScaffoldFiles();
    for (const [filename, content] of Object.entries(scaffoldFiles)) {
      if (!files[filename]) {
        files[filename] = content;
        await this.writeFile(projectDir, filename, content);
      }
    }

    return {
      rootDir: projectDir,
      files,
      fileCount: Object.keys(files).length,
    };
  }

  private assertSafeProjectId(projectId: string): void {
    if (!/^[a-zA-Z0-9_-]+$/.test(projectId)) {
      throw new Error(`Invalid projectId: ${projectId}`);
    }
  }

  private assertInsideBase(resolved: string): void {
    const base = path.resolve(OUTPUT_BASE);
    if (!resolved.startsWith(base + path.sep) && resolved !== base) {
      throw new Error("Path traversal attempt detected");
    }
  }

  async getProjectDir(projectId: string): Promise<string> {
    this.assertSafeProjectId(projectId);
    return path.join(OUTPUT_BASE, projectId);
  }

  async listFiles(projectId: string): Promise<string[]> {
    this.assertSafeProjectId(projectId);
    const dir = path.resolve(OUTPUT_BASE, projectId);
    this.assertInsideBase(dir);
    try {
      await fs.stat(dir);
    } catch (e: unknown) {
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code: string }).code === "ENOENT"
      ) {
        return [];
      }
      console.error(`Project directory not found: ${dir}`, e);
      return [];
    }
    return this.walkDir(dir, dir);
  }

  async readFile(
    projectId: string,
    relativePath: string,
  ): Promise<string | null> {
    try {
      this.assertSafeProjectId(projectId);
      const resolved = path.resolve(OUTPUT_BASE, projectId, relativePath);
      this.assertInsideBase(resolved);
      return await fs.readFile(resolved, "utf-8");
    } catch {
      return null;
    }
  }

  private async writeFile(
    projectDir: string,
    relativePath: string,
    content: string,
  ): Promise<void> {
    const fullPath = path.join(projectDir, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");

    try {
      const projectId = path.basename(projectDir);
      const lines = content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        emitWorkflowEvent(projectId, "FILE_LINE", {
          path: relativePath,
          index: i,
          line: lines[i],
        });
      }
    } catch (err) {
      console.error("Failed to emit file lines:", err);
    }
  }

  private extractCodeBlocks(
    text: string,
    extensions: string,
  ): Record<string, string> {
    const files: Record<string, string> = {};
    const extPattern = extensions.split("|").join("|");

    const filenameBlockRegex = new RegExp(
      `(?:###?\\s+([\\w./\\-]+\\.(?:${extPattern}))|\\*\\*([\\w./\\-]+\\.(?:${extPattern}))\\*\\*|([\\w./\\-]+\\.(?:${extPattern})):?\\s*\\n)\\s*\`\`\`(?:${extPattern}|\\w+)?\\n([\\s\\S]*?)\`\`\``,
      "gi",
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
        "gi",
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
        lint: "next lint",
      },
      dependencies: {
        next: "14.2.5",
        react: "^18.3.1",
        "react-dom": "^18.3.1",
        "@rainbow-me/rainbowkit": "^2.1.3",
        wagmi: "^2.10.5",
        viem: "^2.13.6",
        "@tanstack/react-query": "^5.40.0",
        ethers: "^6.13.0",
        "framer-motion": "^11.2.10",
        "lucide-react": "^0.390.0",
        clsx: "^2.1.1",
        "tailwind-merge": "^2.3.0",
        "class-variance-authority": "^0.7.0",
      },
      devDependencies: {
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        typescript: "^5",
        tailwindcss: "^3.4.4",
        autoprefixer: "^10.4.19",
        postcss: "^8.4.38",
        eslint: "^8",
        "eslint-config-next": "14.2.5",
      },
    };
  }

  private buildScaffoldFiles(): Record<string, string> {
    return {
      "next.config.js": [
        "/** @type {import('next').NextConfig} */",
        "const nextConfig = {",
        "  reactStrictMode: true,",
        "  images: { unoptimized: true },",
        "};",
        "module.exports = nextConfig;",
      ].join("\n"),

      "tailwind.config.js": [
        "/** @type {import('tailwindcss').Config} */",
        "module.exports = {",
        "  content: [",
        "    './app/**/*.{js,ts,jsx,tsx,mdx}',",
        "    './components/**/*.{js,ts,jsx,tsx,mdx}',",
        "    './pages/**/*.{js,ts,jsx,tsx,mdx}',",
        "  ],",
        "  theme: { extend: {} },",
        "  plugins: [],",
        "};",
      ].join("\n"),

      "postcss.config.js": [
        "module.exports = {",
        "  plugins: {",
        "    tailwindcss: {},",
        "    autoprefixer: {},",
        "  },",
        "};",
      ].join("\n"),

      "tsconfig.json": JSON.stringify(
        {
          compilerOptions: {
            target: "es5",
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            plugins: [{ name: "next" }],
            paths: { "@/*": ["./*"] },
          },
          include: [
            "next-env.d.ts",
            "**/*.ts",
            "**/*.tsx",
            ".next/types/**/*.ts",
          ],
          exclude: ["node_modules"],
        },
        null,
        2,
      ),

      "app/globals.css": [
        "@tailwind base;",
        "@tailwind components;",
        "@tailwind utilities;",
        "",
        ":root {",
        "  --background: #050816;",
        "  --foreground: #ffffff;",
        "}",
        "",
        "body {",
        "  background: var(--background);",
        "  color: var(--foreground);",
        "  font-family: system-ui, sans-serif;",
        "}",
      ].join("\n"),

      "app/layout.tsx": [
        "import type { Metadata } from 'next';",
        "import './globals.css';",
        "",
        "export const metadata: Metadata = { title: 'Generated App', description: 'Generated by 0GPilot' };",
        "",
        "export default function RootLayout({ children }: { children: React.ReactNode }) {",
        "  return (",
        '    <html lang="en">',
        "      <body>{children}</body>",
        "    </html>",
        "  );",
        "}",
      ].join("\n"),
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
