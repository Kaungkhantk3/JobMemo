import { z } from "zod";

export const applicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  jobUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
  status: z.enum([
    "SAVED",
    "APPLIED",
    "INTERVIEW",
    "ASSESSMENT",
    "REJECTED",
    "OFFER",
    "GHOSTED",
  ]),
  currentStatus: z
    .enum([
      "SAVED",
      "APPLIED",
      "INTERVIEW",
      "ASSESSMENT",
      "REJECTED",
      "OFFER",
      "GHOSTED",
    ])
    .optional(),
  source: z.string().optional(),
  appliedAt: z.string().optional().or(z.literal("")),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
