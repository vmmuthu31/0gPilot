import "server-only";

const VERCEL_API = "https://api.vercel.com";

export interface VercelDeployOptions {
  repoFullName: string;
  projectName: string;
  vercelToken: string;
  teamId?: string;
  envVars?: Record<string, string>;
}

export interface VercelDeployResult {
  success: boolean;
  deploymentUrl?: string;
  projectId?: string;
  error?: string;
}

class VercelService {
  private headers(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  private teamQuery(teamId?: string): string {
    return teamId ? `?teamId=${teamId}` : "";
  }

  async createProject(
    token: string,
    repoFullName: string,
    projectName: string,
    teamId?: string
  ): Promise<{ projectId: string } | null> {
    try {
      const [owner, repo] = repoFullName.split("/");

      const res = await fetch(`${VERCEL_API}/v9/projects${this.teamQuery(teamId)}`, {
        method: "POST",
        headers: this.headers(token),
        body: JSON.stringify({
          name: projectName,
          gitRepository: {
            type: "github",
            repo: repoFullName,
            sourceless: false,
          },
          framework: "nextjs",
          installCommand: "npm install",
          buildCommand: "npm run build",
          outputDirectory: ".next",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Vercel createProject failed:", body);
        return null;
      }

      const data = await res.json();
      void owner; void repo;
      return { projectId: data.id };
    } catch (err) {
      console.error("Vercel createProject error:", err);
      return null;
    }
  }

  async triggerDeploy(
    token: string,
    projectName: string,
    teamId?: string
  ): Promise<{ deploymentUrl: string } | null> {
    try {
      const res = await fetch(`${VERCEL_API}/v13/deployments${this.teamQuery(teamId)}`, {
        method: "POST",
        headers: this.headers(token),
        body: JSON.stringify({
          name: projectName,
          target: "production",
          gitSource: { type: "github" },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Vercel triggerDeploy failed:", body);
        return null;
      }

      const data = await res.json();
      return { deploymentUrl: `https://${data.url}` };
    } catch (err) {
      console.error("Vercel triggerDeploy error:", err);
      return null;
    }
  }

  async setEnvVars(
    token: string,
    projectId: string,
    envVars: Record<string, string>,
    teamId?: string
  ): Promise<boolean> {
    try {
      const entries = Object.entries(envVars).map(([key, value]) => ({
        key,
        value,
        type: "encrypted" as const,
        target: ["production", "preview", "development"],
      }));

      const res = await fetch(
        `${VERCEL_API}/v10/projects/${projectId}/env${this.teamQuery(teamId)}`,
        {
          method: "POST",
          headers: this.headers(token),
          body: JSON.stringify(entries),
        }
      );

      return res.ok;
    } catch {
      return false;
    }
  }

  async deployFromGitHub(options: VercelDeployOptions): Promise<VercelDeployResult> {
    const safeName = options.projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 52);

    const project = await this.createProject(
      options.vercelToken,
      options.repoFullName,
      safeName,
      options.teamId
    );

    if (!project) {
      return { success: false, error: "Failed to create Vercel project" };
    }

    if (options.envVars && Object.keys(options.envVars).length > 0) {
      await this.setEnvVars(
        options.vercelToken,
        project.projectId,
        options.envVars,
        options.teamId
      );
    }

    const deploy = await this.triggerDeploy(
      options.vercelToken,
      safeName,
      options.teamId
    );

    if (!deploy) {
      return {
        success: false,
        projectId: project.projectId,
        error: "Project created but deployment trigger failed",
      };
    }

    return {
      success: true,
      deploymentUrl: deploy.deploymentUrl,
      projectId: project.projectId,
    };
  }
}

export const vercelService = new VercelService();
