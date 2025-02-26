"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { AthleteCalendar } from "./components/athlete-calendar";

export default function CalendarPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Calendrier"
          description="Gérez vos événements et matchs à venir"
        />
      </div>
      <Separator />
      <AthleteCalendar />
    </div>
  );
}
