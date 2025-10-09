"use client";

import { useMemo, useState } from "react";
import type { Performance, SportType } from "@/types";
import { format } from "date-fns";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { PerformanceForm } from "@/components/forms/performance-form";

interface PerformanceStatsProps {
  positions: Array<{
    id: string;
    name: string;
    sportId: string;
  }>;
  sportType: SportType;
  performances: Performance[];
}

export const PerformanceStats = ({ positions, sportType, performances }: PerformanceStatsProps) => {
  const [open, setOpen] = useState(false);

  // Transformer les données de performance pour le graphique
  const performanceData = useMemo(() => {
    if (!performances || performances.length === 0) {
      return [];
    }

    // Grouper par mois et calculer la moyenne des scores
    const monthlyData = performances.reduce((acc, perf) => {
      const monthYear = format(new Date(perf.date), "MMM yyyy");
      if (!acc[monthYear]) {
        acc[monthYear] = { total: 0, count: 0, date: new Date(perf.date) };
      }
      acc[monthYear].total += perf.score;
      acc[monthYear].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number; date: Date }>);

    // Convertir en tableau et calculer les moyennes
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        performance: Math.round(data.total / data.count),
        date: data.date,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-12); // Garder les 12 derniers mois
  }, [performances]);

  // Calculer la tendance
  const trend = useMemo(() => {
    if (performanceData.length < 2) return { percentage: 0, isUp: true };

    const recent = performanceData.slice(-2);
    const current = recent[1]?.performance || 0;
    const previous = recent[0]?.performance || 1;

    const percentage = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(Math.round(percentage * 10) / 10),
      isUp: percentage >= 0,
    };
  }, [performanceData]);

  const chartConfig: ChartConfig = {
    performance: {
      label: "Performance",
      color: "#2463EB",
    },
  };

  return (
    <>
      <Card className="col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            Performance Summary
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Add Stats</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <VisuallyHidden>
                  <DialogTitle>Ajouter des statistiques de performance</DialogTitle>
                </VisuallyHidden>
                <PerformanceForm
                  positions={positions}
                  sportType={sportType}
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription className="text-sm">
            {performanceData.length > 0
              ? `Showing performance for the last ${performanceData.length} month${performanceData.length > 1 ? "s" : ""}`
              : "No performance data available"}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {performanceData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="mb-2">No performance data yet</p>
                <p className="text-sm">Add your first stats to see your progress!</p>
              </div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="size-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={performanceData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex items-center">
                                <span className="mr-2 size-2 rounded-full bg-[#2463EB]" />
                                <span className="font-medium">
                                  Score: {payload[0].value}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="performance"
                    stroke="#2463EB"
                    fill="#2463EB"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
        <CardFooter>
          {performanceData.length >= 2 && (
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  {trend.isUp ? "Trending up" : "Trending down"} by {trend.percentage}%{" "}
                  {trend.isUp ? (
                    <TrendingUp className="size-4" />
                  ) : (
                    <TrendingDown className="size-4" />
                  )}
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  Based on last {performanceData.length} performances
                </div>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </>
  );
};
