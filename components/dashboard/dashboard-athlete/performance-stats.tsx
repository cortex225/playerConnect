"use client";

import { TrendingUp } from "lucide-react";
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
import { useState } from "react";
import { createPerformance } from "@/actions/create-performance";
import { PerformanceForm } from "@/components/forms/performance-form";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

export const PerformanceStats = ({ positions, sportType }) => {
  const [open, setOpen] = useState(false);
  const performanceData = [
    { month: "January", performance: 186 },
    { month: "February", performance: 305 },
    { month: "March", performance: 237 },
    { month: "April", performance: 273 },
    { month: "May", performance: 309 },
    { month: "June", performance: 314 },
    { month: "July", performance: 294 },
    { month: "August", performance: 287 },
    { month: "September", performance: 326 },
    { month: "October", performance: 347 },
    { month: "November", performance: 339 },
    { month: "December", performance: 358 },
  ];
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
                <PerformanceForm
                  positions={positions}
                  sportType={sportType}
                  onSubmit={async (values) => {
                    await createPerformance(values);
                    setOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription className="text-sm">
            Showing total performance for the year
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
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
                  tickFormatter={(value) => value.slice(0, 3)}
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
                                {payload[0].value}
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
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                Trending up by 5.2% this month <TrendingUp className="size-4" />
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                January - December 2024
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};
