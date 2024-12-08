import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "ADMIN") {
      redirect("/admin");
    } else if (user.role === "ATHLETE") {
      redirect("/dashboard/athlete");
    } else if (user.role === "RECRUITER") {
      redirect("/dashboard/recruiter");
    }
  }

  return <div className="min-h-screen">{children}</div>;
}
