import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/server/session";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout pour les pages d'authentification
 * Redirige vers le dashboard si l'utilisateur est déjà connecté
 */
export default async function AuthLayout({ children }: AuthLayoutProps) {
  const user = await getServerSession();

  // Si l'utilisateur est connecté, le rediriger vers le dashboard
  if (user?.isLoggedIn) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {children}
    </div>
  );
}
