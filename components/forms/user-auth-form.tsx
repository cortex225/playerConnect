"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  LoginFormData,
  loginSchema,
  RegisterFormData,
  registerSchema,
} from "@/lib/auth-config";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/shared/icons";
import { authClient } from "@/lib/auth-client";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "login" | "register";
}

export function UserAuthForm({
  className,
  type = "login",
  ...props
}: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(type === "login" ? loginSchema : registerSchema),
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();

  async function onSubmit(data: LoginFormData | RegisterFormData) {
    setIsLoading(true);

    try {
      if (type === "login") {
        const { email, password, role } = data as LoginFormData;
        await authClient.login({
          email,
          password,
          role,
          redirectTo:
            searchParams?.get("from") || `/dashboard/${role.toLowerCase()}`,
        });
        toast.success("Connexion réussie");
      } else {
        const { email, password, name, role } = data as RegisterFormData;
        await authClient.register({
          email,
          password,
          name,
          role,
          redirectTo: `/dashboard/${role.toLowerCase()}`,
        });
        toast.success("Compte créé avec succès");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        type === "login" ? "Échec de la connexion" : "Échec de l'inscription",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          {type === "register" && (
            <div className="grid gap-1">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                placeholder="John Doe"
                type="text"
                autoCapitalize="none"
                autoComplete="name"
                autoCorrect="off"
                disabled={isLoading}
                {...register("name")}
              />
              {errors?.name && (
                <p className="px-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete={
                type === "login" ? "current-password" : "new-password"
              }
              autoCorrect="off"
              disabled={isLoading}
              {...register("password")}
            />
            {errors?.password && (
              <p className="px-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="role">Rôle</Label>
            <select
              id="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
              {...register("role")}
            >
              <option value="">Sélectionnez un rôle</option>
              <option value="ATHLETE">Athlète</option>
              <option value="RECRUITER">Recruteur</option>
            </select>
            {errors?.role && (
              <p className="px-1 text-xs text-red-600">{errors.role.message}</p>
            )}
          </div>

          <button className={cn(buttonVariants())} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            {type === "register" ? "S'inscrire" : "Se connecter"}
          </button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou continuer avec
          </span>
        </div>
      </div>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }))}
        onClick={async () => {
          setIsGoogleLoading(true);
          try {
            await authClient.loginWithGoogle({
              redirectTo: searchParams?.get("from") || "/dashboard",
            });
          } catch (error) {
            console.error("Erreur Google:", error);
            toast.error("Échec de la connexion avec Google");
          } finally {
            setIsGoogleLoading(false);
          }
        }}
        disabled={isLoading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Icons.spinner className="mr-2 size-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 size-4" />
        )}{" "}
        Google
      </button>
    </div>
  );
}
