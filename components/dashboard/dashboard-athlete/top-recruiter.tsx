"use client";
import React, { useEffect, useState } from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts'
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import { getTopAthletes } from "@/actions/get-athlete";
import { Athlete } from "@/types";
import { Star } from "lucide-react";

export const TopAthletes = () => {
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAthletes = async () => {
            try {
                const data = await getTopAthletes();
                setAthletes(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des athlètes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAthletes();
    }, []);

    if (loading) {
        return (
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Top Athletes</CardTitle>
                    <CardDescription>Loading...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Top Athletes</CardTitle>
                <CardDescription>Top performing athletes based on their best scores</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {athletes.map((athlete) => {
                        const bestPerformance = athlete.performances[0];
                        const name = athlete.user?.name || "Unknown Athlete";
                        
                        return (
                            <div key={athlete.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={athlete.user?.image || ""} alt={name} />
                                    <AvatarFallback>
                                        {name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {athlete.sport?.name || "Unknown Sport"}
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`size-4 ${
                                                    star <= (bestPerformance?.score || 0) / 20
                                                        ? "text-yellow-400"
                                                        : "text-gray-300"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {bestPerformance?.KPI && (
                                    <div className="ml-4 w-[80px]">
                                        <ResponsiveContainer width="100%" height={30}>
                                            <LineChart data={bestPerformance.KPI.map((kpi, index) => ({ 
                                                name: index, 
                                                value: parseFloat(kpi.value) 
                                            }))}>
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="value" 
                                                    stroke="#8884d8" 
                                                    strokeWidth={2} 
                                                    dot={false} 
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
