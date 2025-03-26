"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  Lock,
  LogOut,
  Settings,
} from "lucide-react";

import { signOut } from "@/lib/auth-client";
import { ROLES } from "@/lib/constants";
import { useSession } from "@/lib/hooks/use-session";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";

export function UserAccountNav() {
  const router = useRouter();
  const { session, loading } = useSession();

  if (!session || loading) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{ name: session.name || null, image: null }}
          className="size-8"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {session.name && <p className="font-medium">{session.name}</p>}
            {session.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {session.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {/* Menu items basés sur le rôle */}
        {session.role === ROLES.ADMIN ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center space-x-2.5">
                <Lock className="size-4" />
                <p className="text-sm">Admin Dashboard</p>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/admin/settings"
                className="flex items-center space-x-2.5"
              >
                <Settings className="size-4" />
                <p className="text-sm">Settings</p>
              </Link>
            </DropdownMenuItem>
          </>
        ) : session.role === ROLES.ATHLETE ? (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/athlete"
                className="flex items-center space-x-2.5"
              >
                <LayoutDashboard className="size-4" />
                <p className="text-sm">Athlete Dashboard</p>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/athlete/billing"
                className="flex items-center space-x-2.5"
              >
                <CreditCard className="size-4" />
                <p className="text-sm">Billing</p>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/athlete/settings"
                className="flex items-center space-x-2.5"
              >
                <Settings className="size-4" />
                <p className="text-sm">Settings</p>
              </Link>
            </DropdownMenuItem>
          </>
        ) : session.role === ROLES.RECRUITER ? (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/recruiter"
                className="flex items-center space-x-2.5"
              >
                <LayoutDashboard className="size-4" />
                <p className="text-sm">Recruiter Dashboard</p>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/recruiter/billing"
                className="flex items-center space-x-2.5"
              >
                <CreditCard className="size-4" />
                <p className="text-sm">Billing</p>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/recruiter/settings"
                className="flex items-center space-x-2.5"
              >
                <Settings className="size-4" />
                <p className="text-sm">Settings</p>
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}

        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
          <div className="flex items-center space-x-2.5">
            <LogOut className="size-4" />
            <p className="text-sm">Se déconnecter</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
