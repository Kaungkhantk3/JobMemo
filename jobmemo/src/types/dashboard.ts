import type { Application } from "@/types/application";

export type DashboardApplicationSource = "Manual" | "Gmail";

export type DashboardApplication = Application & {
  source: DashboardApplicationSource;
};
