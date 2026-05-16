import path from "path";
import fs from "fs/promises";
import { emitWorkflowEvent } from "@/server/events/emitter";
import { db } from "@/db";
import {
  deriveProjectStack,
  type ProjectStackProfile,
} from "@/src/lib/project-generation";

export interface AgentOutputs {
  projectId: string;
  prompt: string;
  architecture?: string;
  frontend?: string;
  backend?: string;
  contracts?: string;
  tests?: string;
  template?: string;
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
    const projectMeta = await db.project
      .findUnique({
        where: { id: outputs.projectId },
        select: {
          prompt: true,
          template: true,
          framework: true,
          blockchain: true,
        },
      })
      .catch(() => null);
    const stack = deriveProjectStack({
      prompt: projectMeta?.prompt ?? outputs.prompt,
      template: projectMeta?.template ?? outputs.template,
      framework: projectMeta?.framework,
      blockchain: projectMeta?.blockchain,
    });

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
        const dest = this.resolveFrontendDestination(filename, stack);
        files[dest] = content;
        await this.writeFile(projectDir, dest, content);
      }

      if (Object.keys(frontendFiles).length === 0) {
        const fallbackPath =
          stack.runtime === "react-native"
            ? "App.tsx"
            : stack.runtime === "contracts"
              ? "frontend/app/page.tsx"
              : "app/page.tsx";
        files[fallbackPath] = outputs.frontend;
        await this.writeFile(projectDir, fallbackPath, outputs.frontend);
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

    files["package.json"] = JSON.stringify(
      this.buildBasePackageJson(outputs.prompt),
      null,
      2,
    );

    const scaffoldFiles = this.buildScaffoldFiles(stack);
    for (const [filename, content] of Object.entries(scaffoldFiles)) {
      const nextContent =
        filename === "package.json"
          ? this.mergePackageJson(files["package.json"], content)
          : files[filename] ?? content;
      files[filename] = nextContent;
      await this.writeFile(projectDir, filename, nextContent);
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

  private buildBasePackageJson(prompt: string) {
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
      scripts: {},
      dependencies: {},
      devDependencies: {},
    };
  }

  private buildScaffoldFiles(stack: ProjectStackProfile): Record<string, string> {
    const files: Record<string, string> = {
      ".gitignore": [
        "node_modules/",
        ".next/",
        "dist/",
        "generated/",
        "*.log",
      ].join("\n"),
    };

    if (stack.runtime === "nextjs") {
      Object.assign(files, this.buildNextjsScaffold());
    }

    if (stack.runtime === "react-native") {
      Object.assign(files, this.buildReactNativeScaffold());
    }

    if (stack.includeHardhat) {
      Object.assign(files, this.buildHardhatScaffold());
    }

    return files;
  }

  private buildNextjsScaffold(): Record<string, string> {
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
      "app/page.tsx": [
        "import Link from 'next/link';",
        "",
        "export default function Page() {",
        "  return (",
        '    <main className="max-w-4xl mx-auto p-8">',
        '      <h1 className="text-3xl font-bold mb-4">Generated Next.js App</h1>',
        '      <p className="text-lg text-slate-300 mb-6">This app was generated by 0gPilot.</p>',
        '      <Link href="/api/hello">API: /api/hello</Link>',
        "    </main>",
        "  );",
        "}",
      ].join("\n"),

      "app/page.module.css": [".container { padding: 24px; }"].join("\n"),

      "components/Navbar.tsx": [
        "export default function Navbar() {",
        "  return (",
        '    <nav className="w-full py-4 border-b border-white/5">',
        '      <div className="max-w-6xl mx-auto px-4">0gPilot Generated</div>',
        "    </nav>",
        "  );",
        "}",
      ].join("\n"),

      "components/Footer.tsx": [
        "export default function Footer() {",
        "  return (",
        '    <footer className="w-full py-6 text-center text-sm text-slate-400">',
        "      © Generated by 0gPilot",
        "    </footer>",
        "  );",
        "}",
      ].join("\n"),

      "next-env.d.ts":
        '/// <reference types="next" />\n/// <reference types="next/types/global" />',
      "package.json": JSON.stringify(
        {
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
            lint: "eslint .",
          },
          dependencies: {
            next: "16.2.6",
            react: "19.2.4",
            "react-dom": "19.2.4",
            "@rainbow-me/rainbowkit": "^2.2.11",
            wagmi: "^2.19.5",
            viem: "^2.48.11",
            "@tanstack/react-query": "^5.100.10",
            ethers: "^6.16.0",
            "framer-motion": "^12.38.0",
            "lucide-react": "^1.14.0",
            clsx: "^2.1.1",
            "tailwind-merge": "^3.6.0",
            "class-variance-authority": "^0.7.1",
          },
          devDependencies: {
            "@types/node": "^20",
            "@types/react": "^19",
            "@types/react-dom": "^19",
            typescript: "^5",
            tailwindcss: "^4",
            "@tailwindcss/postcss": "^4",
            eslint: "^9",
            "eslint-config-next": "16.2.6",
          },
        },
        null,
        2,
      ),
    };
  }

  private buildHardhatScaffold(): Record<string, string> {
    return {
      "hardhat.config.js": [
        "require('@nomicfoundation/hardhat-toolbox');",
        "module.exports = {",
        "  solidity: '0.8.19',",
        "};",
      ].join("\n"),
      "contracts/Contract.sol": [
        "// SPDX-License-Identifier: MIT",
        "pragma solidity ^0.8.19;",
        "\ncontract Contract {",
        '  string public name = "GeneratedContract";',
        "}",
      ].join("\n"),
      "scripts/deploy.js": [
        "async function main() {",
        "  const [deployer] = await ethers.getSigners();",
        "  console.log('Deploying contracts with account:', deployer.address);",
        "  const Contract = await ethers.getContractFactory('Contract');",
        "  const deployed = await Contract.deploy();",
        "  console.log('Contract deployed to:', deployed.address);",
        "}",
        "",
        "main().catch((error) => {",
        "  console.error(error);",
        "  process.exitCode = 1;",
        "});",
      ].join("\n"),
      "test/Contract.test.js": [
        "const { expect } = require('chai');",
        "describe('Contract', function () {",
        "  it('has a name', async function () {",
        "    const Contract = await ethers.getContractFactory('Contract');",
        "    const deployed = await Contract.deploy();",
        "    expect(await deployed.name()).to.equal('GeneratedContract');",
        "  });",
        "});",
      ].join("\n"),
      "README_SOLIDITY.md": [
        "# Solidity Project",
        "",
        "This project includes a minimal Hardhat setup with one example contract.",
        "",
        "Run tests:",
        "",
        "```sh",
        "npm install",
        "npx hardhat test",
        "```",
      ].join("\n"),
      ".env.example": [
        "# RPC URL for deployment (Infura/Alchemy)",
        "# PROVIDER_URL=https://polygon-rpc.com",
      ].join("\n"),
      "package.json": JSON.stringify(
        {
          scripts: {
            test: "npx hardhat test",
            "contract:compile": "npx hardhat compile",
            "contract:deploy": "npx hardhat run scripts/deploy.js",
          },
          devDependencies: {
            hardhat: "^2.22.0",
            "@nomicfoundation/hardhat-toolbox": "^5.0.0",
          },
        },
        null,
        2,
      ),
    };
  }

  private buildReactNativeScaffold(): Record<string, string> {
    return {
      "App.tsx": [
        "import React from 'react';",
        "import { SafeAreaView, Text } from 'react-native';",
        "\nexport default function App() {",
        "  return (",
        "    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>",
        "      <Text>Generated React Native App</Text>",
        "    </SafeAreaView>",
        "  );",
        "}",
      ].join("\n"),
      "package.json": JSON.stringify(
        {
          scripts: {
            start: "expo start",
            android: "expo start --android",
            ios: "expo start --ios",
          },
          dependencies: {
            expo: "^53.0.0",
            react: "19.2.4",
            "react-native": "0.79.5",
          },
        },
        null,
        2,
      ),
      "app.json": JSON.stringify(
        {
          expo: {
            name: "Generated Mobile App",
            slug: "generated-mobile-app",
            sdkVersion: "53.0.0",
          },
        },
        null,
        2,
      ),
      "README_MOBILE.md": [
        "# React Native (Expo) Project",
        "",
        "This is a minimal Expo React Native starter generated by 0gPilot.",
        "",
        "Run:",
        "```sh",
        "npm install",
        "expo start",
        "```",
      ].join("\n"),
      "babel.config.js": [
        "module.exports = function(api) {",
        "  api.cache(true);",
        "  return { presets: ['babel-preset-expo'] };",
        "};",
      ].join("\n"),
    };
  }

  private mergePackageJson(baseContent: string, patchContent: string): string {
    const base = JSON.parse(baseContent) as Record<string, unknown>;
    const patch = JSON.parse(patchContent) as Record<string, unknown>;

    const merged = {
      ...base,
      ...patch,
      scripts: {
        ...(typeof base.scripts === "object" && base.scripts ? base.scripts : {}),
        ...(typeof patch.scripts === "object" && patch.scripts ? patch.scripts : {}),
      },
      dependencies: {
        ...(typeof base.dependencies === "object" && base.dependencies
          ? base.dependencies
          : {}),
        ...(typeof patch.dependencies === "object" && patch.dependencies
          ? patch.dependencies
          : {}),
      },
      devDependencies: {
        ...(typeof base.devDependencies === "object" && base.devDependencies
          ? base.devDependencies
          : {}),
        ...(typeof patch.devDependencies === "object" && patch.devDependencies
          ? patch.devDependencies
          : {}),
      },
    };

    return JSON.stringify(merged, null, 2);
  }

  private resolveFrontendDestination(
    filename: string,
    stack: ProjectStackProfile,
  ): string {
    if (filename.includes("/")) {
      return filename;
    }

    if (stack.runtime === "react-native") {
      return filename === "App.tsx" ? filename : `src/${filename}`;
    }

    if (stack.runtime === "contracts") {
      return `frontend/${filename}`;
    }

    return `app/${filename}`;
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
