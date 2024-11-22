"use client";
import React from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {

    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts'
export const RecruitmentProgress = () => {
    // Fake data for recruiter stats
    const recruiterStats = [
        { name: 'Athletes Scouted', value: 150 },
        { name: 'Successful Recruits', value: 45 },
        { name: 'Ongoing Negotiations', value: 20 },
        { name: 'Potential Prospects', value: 85 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Recruitment Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full h-[200px]">
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
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Pie>
                                <Tooltip/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center mt-4">
                        {recruiterStats.map((entry, index) => (
                            <div key={`legend-${index}`} className="flex items-center mx-2">
                                <div className="w-3 h-3 mr-1"
                                     style={{backgroundColor: COLORS[index % COLORS.length]}}
                                ></div>
                                <span className="text-xs">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
