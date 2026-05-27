import { ApplicationStatus } from "@/types/application";

const config: Record<ApplicationStatus, { label: string; bgVar: string; textVar: string }> =
  {
    SAVED: { label: "Saved", bgVar: "var(--color-status-saved-bg)", textVar: "var(--color-status-saved-text)" },
    APPLIED: { label: "Applied", bgVar: "var(--color-status-applied-bg)", textVar: "var(--color-status-applied-text)" },
    INTERVIEW: { label: "Interview", bgVar: "var(--color-status-interview-bg)", textVar: "var(--color-status-interview-text)" },
    ASSESSMENT: { label: "Assessment", bgVar: "var(--color-status-assessment-bg)", textVar: "var(--color-status-assessment-text)" },
    REJECTED: { label: "Rejected", bgVar: "var(--color-status-rejected-bg)", textVar: "var(--color-status-rejected-text)" },
    OFFER: { label: "Offer", bgVar: "var(--color-status-offer-bg)", textVar: "var(--color-status-offer-text)" },
    GHOSTED: { label: "Ghosted", bgVar: "var(--color-status-ghosted-bg)", textVar: "var(--color-status-ghosted-text)" },
  };

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, bgVar, textVar } = config[status];
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide whitespace-nowrap transition-all"
      style={{ backgroundColor: bgVar, color: textVar }}
    >
      {label}
    </span>
  );
}
