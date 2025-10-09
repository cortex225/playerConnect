export const ROLES = {
  ADMIN: "ADMIN",
  ATHLETE: "ATHLETE",
  RECRUITER: "RECRUITER",
  USER: "USER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Permissions par rôle
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    "create:user",
    "delete:user",
    "read:user",
    "update:user",
    "manage:roles",
    "view:analytics",
    "manage:system",
  ],
  [ROLES.ATHLETE]: [
    "view:profile",
    "update:profile",
    "create:media",
    "delete:media",
    "manage:events",
    "view:recruiters",
    "respond:invitations",
    "update:performance",
  ],
  [ROLES.RECRUITER]: [
    "view:profile",
    "update:profile",
    "view:athletes",
    "send:invitations",
    "manage:invitations",
    "view:events",
    "create:notes",
  ],
  [ROLES.USER]: ["view:profile", "update:profile"],
} as const;
