"use client";

import { useMemo } from "react";
import type { Performance } from "@/types";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface KPIChartProps {
  performances: Performance[];
}

export const KPIChart = ({ performances }: KPIChartProps) => {
  // Transformer les données KPI pour le graphique radar
  const kpiData = useMemo(() => {
    if (!performances || performances.length === 0) {
      return [];
    }

    // Prendre les 5 dernières performances
    const recentPerformances = performances.slice(0, 5);

    // Collecter tous les KPIs uniques
    const allKPIs = new Map<string, { total: number; count: number }>();

    recentPerformances.forEach((perf) => {
      perf.KPI.forEach((kpi) => {
        const existing = allKPIs.get(kpi.name) || { total: 0, count: 0 };
        allKPIs.set(kpi.name, {
          total: existing.total + kpi.value,
          count: existing.count + 1,
        });
      });
    });

    // Calculer les moyennes et formater pour le graphique
    return Array.from(allKPIs.entries()).map(([name, data]) => ({
      subject: name.charAt(0).toUpperCase() + name.slice(1),
      Performance: Math.round(data.total / data.count),
      fullMark: 150,
    }));
  }, [performances]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Key Performance Indicators</CardTitle>
        <CardDescription className="text-sm">
          {kpiData.length > 0
            ? "Average stats from recent performances"
            : "No KPI data available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {kpiData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-center text-muted-foreground">
            <div>
              <p className="mb-2">No KPI data yet</p>
              <p className="text-sm">Add performance stats to see your KPIs!</p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={{
              Performance: {
                label: "Performance",
                color: "#2463EB",
              },
            }}
            className="h-[250px] w-full"
          >
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={kpiData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar
                name="Performance"
                dataKey="Performance"
                stroke="var(--color-Performance)"
                fill="var(--color-Performance)"
                fillOpacity={0.6}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
