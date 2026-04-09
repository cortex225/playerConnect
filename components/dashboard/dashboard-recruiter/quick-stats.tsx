import { CheckCircle, Clock, Send, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface QuickStatsProps {
  totalAthletes: number;
  sentInvitations: number;
  acceptedInvitations: number;
  pendingInvitations: number;
}

export const QuickStats = ({
  totalAthletes,
  sentInvitations,
  acceptedInvitations,
  pendingInvitations,
}: QuickStatsProps) => {
  const stats = [
    {
      label: "Athletes disponibles",
      value: totalAthletes,
      icon: Users,
      gradient: "from-blue-500/10 to-primary/10",
      iconColor: "text-blue-500",
    },
    {
      label: "Invitations envoyées",
      value: sentInvitations,
      icon: Send,
      gradient: "from-primary/10 to-purple-600/10",
      iconColor: "text-primary",
    },
    {
      label: "Invitations acceptées",
      value: acceptedInvitations,
      icon: CheckCircle,
      gradient: "from-green-500/10 to-emerald-500/10",
      iconColor: "text-green-500",
    },
    {
      label: "Invitations en attente",
      value: pendingInvitations,
      icon: Clock,
      gradient: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-500",
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className="w-full rounded-2xl border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 font-urban text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-r ${stat.gradient}`}
              >
                <stat.icon className={`size-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
