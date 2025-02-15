import Link from "next/link";
import {
  CreditCard,
  LayoutDashboard,
  Lock,
  LogOut,
  Settings,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { ExtendedUser } from "@/types/next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";

export function UserAccountNav({ user }: { user: ExtendedUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{ name: user.name || null, image: user.image || null }}
          className="size-9 border"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {/* Menu items basés sur le rôle */}
        {user.role === "ADMIN" ? (
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
        ) : user.role === "ATHLETE" ? (
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
        ) : user.role === "RECRUITER" ? (
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
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault();
            signOut({
              callbackUrl: `${window.location.origin}/landing`,
            });
          }}
        >
          <div className="flex items-center space-x-2.5">
            <LogOut className="size-4" />
            <p className="text-sm">Log out</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
