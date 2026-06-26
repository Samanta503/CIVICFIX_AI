export type DeploymentCheckStatus = "pass" | "warning" | "fail";

export type DeploymentCheckSeverity = "low" | "medium" | "high" | "critical";

export type DeploymentCheck = {
  key: string;
  title: string;
  status: DeploymentCheckStatus;
  message: string;
  severity: DeploymentCheckSeverity;
  meta: Record<string, unknown>;
};

export type DeploymentEnvironment = {
  app_name: string | null;
  app_env: string | null;
  app_debug: boolean;
  app_url: string | null;
  frontend_url: string | null;
  php_version: string;
  laravel_version: string;
  timezone: string | null;
};

export type DeploymentSummary = {
  total_checks: number;
  passed: number;
  warnings: number;
  failed: number;
  score: number;
  readiness_level: "ready" | "needs_review" | "not_ready";
};

export type DeploymentReadinessData = {
  generated_at: string;
  environment: DeploymentEnvironment;
  summary: DeploymentSummary;
  checks: DeploymentCheck[];
  deployment_commands: string[];
  recommended_next_steps: string[];
};

export type DeploymentReadinessResponse = {
  success: boolean;
  message: string;
  data: DeploymentReadinessData;
};