"use client";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, RadarChart, Radar } from 'recharts'



export const KPIChart = () => {


    const kpiData = [
        { subject: 'Mon', Performance: 120, fullMark: 150 },
        { subject: 'Tue', Performance: 98, fullMark: 150 },
        { subject: 'Wed', Performance: 86, fullMark: 150 },
        { subject: 'Thu', Performance: 99, fullMark: 150 },
        { subject: 'Fri', Performance: 85, fullMark: 150 },
        { subject: 'Sat', Performance: 65, fullMark: 150 },
        { subject: 'Sun', Performance: 65, fullMark: 150 },
      ]

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    return (
        <>
          {/* KPI Chart */}
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader >
            <CardContent className="flex items-center justify-center">
              <ChartContainer config={{
                Performance: {
                  label: "Performance",
                  color: "#2463EB",
                },
              }} className="h-[250px] w-full">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={kpiData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar name="Performance" dataKey="Performance" stroke="var(--color-Performance)" fill="var(--color-Performance)" fillOpacity={0.6} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
    )
}
