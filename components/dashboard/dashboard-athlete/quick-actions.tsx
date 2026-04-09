"use client";

import { useState } from "react";
import { BarChart3, Calendar, Camera } from "lucide-react";

import { AddContentDialogs } from "./add-content-dialogs";

export function QuickActions() {
  const [statsOpen, setStatsOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setStatsOpen(true)}
          className="flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all hover:border-primary/30 hover:bg-accent/50 active:scale-95"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
            <BarChart3 className="size-5 text-white" />
          </div>
          <span className="text-xs font-medium">+ Stats</span>
        </button>

        <button
          onClick={() => setMediaOpen(true)}
          className="flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all hover:border-primary/30 hover:bg-accent/50 active:scale-95"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500">
            <Camera className="size-5 text-white" />
          </div>
          <span className="text-xs font-medium">+ Media</span>
        </button>

        <button
          onClick={() => setMatchOpen(true)}
          className="flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all hover:border-primary/30 hover:bg-accent/50 active:scale-95"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-500">
            <Calendar className="size-5 text-white" />
          </div>
          <span className="text-xs font-medium">+ Match</span>
        </button>
      </div>

      <AddContentDialogs
        statsOpen={statsOpen}
        setStatsOpen={setStatsOpen}
        mediaOpen={mediaOpen}
        setMediaOpen={setMediaOpen}
        matchOpen={matchOpen}
        setMatchOpen={setMatchOpen}
      />
    </>
  );
}
