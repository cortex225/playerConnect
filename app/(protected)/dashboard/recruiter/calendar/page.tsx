"use client";

import { CalendarDays } from "lucide-react";

import { RecruiterCalendar } from "./components/recruiter-calendar";

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
          <CalendarDays className="size-5 text-white" />
        </div>
        <div>
          <h1 className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text font-urban text-2xl font-bold text-transparent">
            Calendrier
          </h1>
          <p className="text-sm text-muted-foreground">
            Matchs auxquels vous etes invite
          </p>
        </div>
      </div>
      <RecruiterCalendar />
    </div>
  );
}
