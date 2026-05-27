import type { Application } from "@/types/application";

export type DashboardApplicationSource = "Manual" | "Gmail";

export type DashboardApplication = Application & {
  source: DashboardApplicationSource;
};

export type DashboardSummary = {
  totalApplications: number;
  interviews: number;
  assessments: number;
  offers: number;
  pendingReview: number;
};
