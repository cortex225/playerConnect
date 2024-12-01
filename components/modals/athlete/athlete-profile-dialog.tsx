"use client";

import React, { useState } from "react";
import { Athlete } from "@/types";
import { X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

type AthleteDialogProps = {
  athlete: Athlete;
  selectedAthlete: Athlete | null;
  onClose: () => void;
};

export default function AthleteProfileDialog({ 
  athlete, 
  selectedAthlete, 
  onClose 
}: AthleteDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  const performanceData = athlete.performances.map((perf, index) => ({
    name: `Performance ${index + 1}`,
    score: perf.score,
    date: perf.date.toLocaleDateString()
  }));

  return (
    <Dialog open={!!selectedAthlete} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-4">
              <Avatar className="size-20">
                <AvatarImage src={athlete.user.image || undefined} alt={athlete.user.name || ""} />
                <AvatarFallback>
                  {athlete.user.name
                    ? athlete.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold">{athlete.user.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{athlete.user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </CardHeader>
          <Separator />
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <p>Sport: {athlete.sport?.name || "Not specified"}</p>
                    <p>Category: {athlete.category?.name || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Latest Performance</h3>
                    {athlete.performances[0] ? (
                      <p>Score: {athlete.performances[0].score.toFixed(2)}</p>
                    ) : (
                      <p>No performance data</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="performance">
                <div className="h-[400px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="details">
                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-2">Performance Details</h3>
                  {athlete.performances.map((perf, index) => (
                    <div key={perf.id} className="mb-2 p-2 border rounded">
                      <p>Performance {index + 1}</p>
                      <p>Score: {perf.score.toFixed(2)}</p>
                      <p>Date: {perf.date.toLocaleDateString()}</p>
                      {perf.position && <p>Position: {perf.position.name}</p>}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
