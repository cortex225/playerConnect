import { CategoryLevel, DominantFoot, DominantHand, Gender, ProgramType } from "@prisma/client";
import * as z from "zod";

export const athleteFormSchema = z.object({
  gender: z.nativeEnum(Gender),
  age: z.number().min(5).max(50),
  city: z.string().min(2).max(50),
  height: z.number().min(100).max(250), // en cm
  weight: z.number().min(30).max(150), // en kg
  dominantHand: z.nativeEnum(DominantHand),
  dominantFoot: z.nativeEnum(DominantFoot),
  programType: z.nativeEnum(ProgramType),
  categoryId: z.string().optional(),
  sportId: z.string(),
  positions: z.array(z.string()), // IDs des positions
});

export type AthleteFormValues = z.infer<typeof athleteFormSchema>;
