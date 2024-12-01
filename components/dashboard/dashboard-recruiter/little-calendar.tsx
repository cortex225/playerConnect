"use client";

import React, { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const LittleCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Fake data for calendar events
  const calendarEvents = [
    { id: 1, name: "Team A Tryouts", date: new Date(2024, 2, 15) },
    { id: 2, name: "Scouting Meeting", date: new Date(2024, 2, 18) },
    { id: 3, name: "College Fair", date: new Date(2024, 2, 22) },
    { id: 4, name: "Player Interview", date: new Date(2024, 2, 25) },
    { id: 5, name: "Tournament Watch", date: new Date(2024, 2, 28) },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
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
              Day: ({ date, displayMonth }) => {
                const event = calendarEvents.find(
                  (ev) =>
                    ev.date.toDateString() === date.toDateString(),
                );

                return (
                  <div className="relative">
                    <div>{date.getDate()}</div>
                    {event && (
                      <div className="absolute bottom-0 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary"></div>
                    )}
                  </div>
                );
              },
            }}
          />
        </CardContent>
      </Card>
    </>
  );
};
