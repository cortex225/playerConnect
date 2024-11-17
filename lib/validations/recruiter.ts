import * as z from "zod";

export const recruiterFormSchema = z.object({
  organization: z.string().min(2).max(100),
  position: z.string().min(2).max(50),
  region: z.string().min(2).max(50),
  experience: z.number().min(0).max(50),
});

export type RecruiterFormValues = z.infer<typeof recruiterFormSchema>;
