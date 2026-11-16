import * as React from "react";

import { cn } from "@/lib/utils";

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div
      className={cn("grid grid-cols-[minmax(0,1fr)] items-start", className)}
      {...props}
    >
      {children}
    </div>
  );
}
