import { ApplicationStatus } from "@/types/application";

const config: Record<ApplicationStatus, { label: string; className: string }> =
  {
    SAVED: { label: "Saved", className: "bg-[#F1EFE8] text-[#444441]" },
    APPLIED: { label: "Applied", className: "bg-[#E6F1FB] text-[#0C447C]" },
    INTERVIEW: { label: "Interview", className: "bg-[#EAF3DE] text-[#27500A]" },
    ASSESSMENT: {
      label: "Assessment",
      className: "bg-[#FAEEDA] text-[#633806]",
    },
    REJECTED: { label: "Rejected", className: "bg-[#FCEBEB] text-[#791F1F]" },
    OFFER: { label: "Offer", className: "bg-[#E1F5EE] text-[#085041]" },
    GHOSTED: { label: "Ghosted", className: "bg-[#F1EFE8] text-[#888780]" },
  };

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}
