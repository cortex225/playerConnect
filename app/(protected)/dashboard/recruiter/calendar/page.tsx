"use client";

import { CalendarDays } from "lucide-react";

import { RecruiterCalendar } from "./components/recruiter-calendar";

export default function CalendarPage() {
  return (
    <div className="space-y-4 px-4 pt-2 md:px-0">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary">
          <CalendarDays className="size-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-urban text-2xl font-bold text-foreground">
            Calendrier
          </h1>
          <p className="text-sm text-muted-foreground">
            Matchs auxquels tu es invité
          </p>
        </div>
      </div>
      <RecruiterCalendar />
    </div>
  );
}
