"use client";
import React, {useState} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Calendar} from "@/components/ui/calendar";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";


export const LittleCalendar = () => {

    const [date, setDate] = useState<Date | undefined>(new Date())

    // Fake data for calendar events
    const calendarEvents = [
        { id: 1, name: "Team A Tryouts", date: new Date(2024, 2, 15) },
        { id: 2, name: "Scouting Meeting", date: new Date(2024, 2, 18) },
        { id: 3, name: "College Fair", date: new Date(2024, 2, 22) },
        { id: 4, name: "Player Interview", date: new Date(2024, 2, 25) },
        { id: 5, name: "Tournament Watch", date: new Date(2024, 2, 28) },
    ]

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                        components={{
                            day: ({ day, date }) => {
                                const event = calendarEvents.find(ev => ev.date.toDateString() === date.toDate().toDateString())
                                return (
                                    <div className="relative">
                                        <Button
                                            variant={date.toDate().toDateString() === day.toDate().toDateString() ? "default" : "ghost"}
                                            className={cn(
                                                "size-9 p-0 font-normal aria-selected:opacity-100",
                                                event && "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-700"
                                            )}
                                        >
                                            {date.toDate().getDate()}
                                        </Button>
                                        {event && (
                                            <div className="absolute bottom-0 left-1/2 size-1 -translate-x-1/2 transform rounded-full bg-blue-600"></div>
                                        )}
                                    </div>
                                )
                            },
                        }}
                    />
                </CardContent>
            </Card>
        </>
    )
}
