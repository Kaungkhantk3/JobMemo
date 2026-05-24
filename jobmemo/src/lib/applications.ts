import type { ApplicationStatus } from "@/types/application";
import type { GmailJobStatus } from "@/types/gmail";

export type ReviewDecision = ApplicationStatus | "IGNORE";

export function normalizeApplicationText(value?: string | null) {
  return value?.trim().replace(/\s+/g, " ").toLowerCase() ?? "";
}

export function normalizeApplicationStatus(
  status?: string | null,
): ApplicationStatus | null {
  if (!status) {
    return null;
  }

  const normalized = status.trim().toUpperCase();

  switch (normalized) {
    case "APPLIED":
    case "INTERVIEW":
    case "ASSESSMENT":
    case "REJECTED":
    case "OFFER":
    case "SAVED":
    case "GHOSTED":
      return normalized as ApplicationStatus;
    default:
      return null;
  }
}

export function normalizeReviewDecision(
  status?: string | null,
): ReviewDecision | null {
  if (!status) {
    return null;
  }

  const normalized = status.trim().toUpperCase();

  if (normalized === "IGNORE") {
    return "IGNORE";
  }

  return normalizeApplicationStatus(normalized);
}

export function applicationStatusFromGmailStatus(
  status?: GmailJobStatus | null,
): ApplicationStatus | null {
  switch (status) {
    case "APPLIED":
    case "INTERVIEW":
    case "ASSESSMENT":
    case "OFFER":
      return status;
    case "REJECTION":
      return "REJECTED";
    default:
      return null;
  }
}

export function gmailStatusFromReviewDecision(
  status?: ReviewDecision | null,
): GmailJobStatus | null {
  switch (status) {
    case "APPLIED":
    case "INTERVIEW":
    case "ASSESSMENT":
    case "OFFER":
      return status;
    case "REJECTED":
      return "REJECTION";
    default:
      return null;
  }
}

export function applicationStatusLabel(status: ApplicationStatus) {
  switch (status) {
    case "APPLIED":
      return "Applied";
    case "INTERVIEW":
      return "Interview invited";
    case "ASSESSMENT":
      return "Assessment received";
    case "REJECTED":
      return "Rejected";
    case "OFFER":
      return "Offer received";
    case "SAVED":
      return "Saved";
    case "GHOSTED":
      return "Ghosted";
  }
}

export function applicationEventTypeForStatus(status: ApplicationStatus) {
  return status;
}

export function applicationEventTitleForStatus(
  status: ApplicationStatus,
  company: string,
  role: string,
) {
  const label = applicationStatusLabel(status);
  return role ? `${label}: ${company} · ${role}` : `${label}: ${company}`;
}

export function mergeApplicationRecords<T extends { id: string }>(
  current: T[],
  incoming: T,
) {
  const index = current.findIndex((item) => item.id === incoming.id);

  if (index === -1) {
    return [incoming, ...current];
  }

  return current.map((item) => (item.id === incoming.id ? incoming : item));
}
