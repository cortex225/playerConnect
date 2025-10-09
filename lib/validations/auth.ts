import * as z from "zod";

export const userAuthSchema = z.object({
  email: z.string().email(),
});

export const loginSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide",
  }),
  password: z.string().min(1, {
    message: "Le mot de passe est requis",
  }),
  role: z.enum(["ATHLETE", "RECRUITER"], {
    required_error: "Veuillez sélectionner un rôle",
  }),
});

export const registerSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide",
  }),
  password: z.string().min(8, {
    message: "Le mot de passe doit contenir au moins 8 caractères",
  }),
  role: z.enum(["ATHLETE", "RECRUITER"], {
    required_error: "Veuillez sélectionner un rôle",
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
