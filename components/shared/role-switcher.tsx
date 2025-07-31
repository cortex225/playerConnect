"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, User } from "lucide-react";

import { ROLES } from "@/lib/constants";
import { useAuth } from "@/lib/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_LABELS = {
  [ROLES.ATHLETE]: "Athlète",
  [ROLES.RECRUITER]: "Recruteur",
  [ROLES.ADMIN]: "Administrateur",
  [ROLES.USER]: "Utilisateur",
} as const;

const ROLE_DASHBOARDS = {
  [ROLES.ATHLETE]: "/dashboard/athlete",
  [ROLES.RECRUITER]: "/dashboard/recruiter",
  [ROLES.ADMIN]: "/dashboard",
} as const;

export function RoleSwitcher() {
  const { user, updateRole, loading } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) return null;

  const availableRoles = [ROLES.ATHLETE, ROLES.RECRUITER];

  const handleRoleChange = async (newRole: string) => {
    if (newRole === user.role || isUpdating) return;

    setIsUpdating(true);
    try {
      const success = await updateRole(newRole);
      if (success) {
        // Rediriger vers le dashboard correspondant
        const dashboard =
          ROLE_DASHBOARDS[newRole as keyof typeof ROLE_DASHBOARDS];
        if (dashboard) {
          router.push(dashboard);
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Erreur lors du changement de rôle:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3">
          <Avatar className="size-6">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="px-2 py-1.5 text-sm font-semibold">Changer de rôle</div>
        <DropdownMenuSeparator />
        {availableRoles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleRoleChange(role)}
            disabled={isUpdating || loading}
            className="flex items-center justify-between"
          >
            <span>{ROLE_LABELS[role]}</span>
            {user.role === role && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
