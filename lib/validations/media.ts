import * as z from "zod";

export const mediaFormSchema = z.object({
  title: z.string().min(3, {
    message: "Le titre doit contenir au moins 3 caractères",
  }),
  description: z.string().optional(),
  file: z.any(),
});

export type MediaFormValues = z.infer<typeof mediaFormSchema>;
