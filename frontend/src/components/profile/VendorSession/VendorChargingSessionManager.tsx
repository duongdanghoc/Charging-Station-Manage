import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VendorActiveSessions from "./VendorActiveSessions";
import VendorSessionHistory from "./VendorSessionHistory";

export default function VendorChargingSessionManager() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Charging Session Monitor</h2>
        <p className="text-muted-foreground">
          Monitor your active sessions in real-time and review charging history.
        </p>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <VendorActiveSessions />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <VendorSessionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
