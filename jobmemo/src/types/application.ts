export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "INTERVIEW"
  | "ASSESSMENT"
  | "REJECTED"
  | "OFFER"
  | "GHOSTED";

export interface Application {
  id: string;
  company: string;
  position: string;
  jobUrl?: string | null;
  status: ApplicationStatus;
  notes?: string | null;
  appliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  type: string;
  title: string;
  emailSubject?: string | null;
  createdAt: string;
}

export interface CreateApplicationInput {
  company: string;
  position: string;
  jobUrl?: string;
  status: ApplicationStatus;
  notes?: string;
  appliedAt?: string;
}

export type UpdateApplicationInput = Partial<CreateApplicationInput>;
