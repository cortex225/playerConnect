"use client";

import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const RecruitmentProgress = () => {
  // Fake data for recruiter stats
  const recruiterStats = [
    { name: "Athletes Scouted", value: 150 },
    { name: "Successful Recruits", value: 45 },
    { name: "Ongoing Negotiations", value: 20 },
    { name: "Potential Prospects", value: 85 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recruitment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={recruiterStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {recruiterStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center">
            {recruiterStats.map((entry, index) => (
              <div key={`legend-${index}`} className="mx-2 flex items-center">
                <div
                  className="mr-1 size-3"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-xs">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
