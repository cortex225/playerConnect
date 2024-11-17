import { CategoryLevel, DivisionLevel, Gender } from "@prisma/client";
import * as z from "zod";

export const athleteFormSchema = z.object({
  gender: z.nativeEnum(Gender),
  age: z.number().min(5).max(50),
  city: z.string().min(2).max(50),
  height: z.number().min(100).max(250), // en cm
  weight: z.number().min(30).max(150), // en kg
  teamName: z.string().min(2).max(50),
  sportId: z.string(), // ID du sport plutôt que l'enum
  divisionLevel: z.nativeEnum(DivisionLevel),
  categoryLevel: z.nativeEnum(CategoryLevel),
});

export type AthleteFormValues = z.infer<typeof athleteFormSchema>;
