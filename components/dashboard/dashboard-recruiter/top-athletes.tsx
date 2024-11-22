"use client";
import React from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {

    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell, LineChart, Line,
} from 'recharts'
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
export const TopAthletes = () => {
    // Fake data for athletes
    const athletes = [
        { id: 1, name: "John Doe", sport: "Basketball", age: 22, rating: 4.5, image: "/placeholder.svg?height=100&width=100", recentPerformance: [85, 92, 78, 88, 95] },
        { id: 2, name: "Jane Smith", sport: "Soccer", age: 20, rating: 4.8, image: "/placeholder.svg?height=100&width=100", recentPerformance: [90, 88, 92, 95, 89] },
        { id: 3, name: "Mike Johnson", sport: "Tennis", age: 25, rating: 4.2, image: "/placeholder.svg?height=100&width=100", recentPerformance: [82, 85, 80, 88, 86] },
        { id: 4, name: "Emily Brown", sport: "Swimming", age: 19, rating: 4.7, image: "/placeholder.svg?height=100&width=100", recentPerformance: [95, 93, 97, 94, 96] },
        { id: 5, name: "Chris Wilson", sport: "Basketball", age: 23, rating: 4.4, image: "/placeholder.svg?height=100&width=100", recentPerformance: [87, 84, 90, 86, 89] },
    ]
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    return (
        <>
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Top Athletes</CardTitle>
                    <CardDescription>Recent performance trends of top-rated athletes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {athletes.slice(0, 3).map((athlete) => (
                            <div key={athlete.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={athlete.image} alt={athlete.name} />
                                    <AvatarFallback>{athlete.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{athlete.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {athlete.sport}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">Rating: {athlete.rating}</div>
                                <div className="w-[80px] ml-4">
                                    <ResponsiveContainer width="100%" height={30}>
                                        <LineChart data={athlete.recentPerformance.map((value, index) => ({ name: index, value }))}>
                                            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
