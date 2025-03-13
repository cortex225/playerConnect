"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { RecruiterCalendar } from "./components/recruiter-calendar";

export default function CalendarPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Calendrier"
          description="Consultez les matchs auxquels vous êtes invité"
        />
      </div>
      <Separator />
      <RecruiterCalendar />
    </div>
  );
}
