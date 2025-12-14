import React from "react";
import { useGetVendorActiveSessionsQuery } from "@/lib/redux/services/profileApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, Battery, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function VendorActiveSessions() {
  const { data: sessions, isLoading, error } = useGetVendorActiveSessionsQuery(undefined, {
    pollingInterval: 10000, // Poll every 10 seconds for "real-time" feel
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load active sessions. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-6 text-muted-foreground h-40">
                <Zap className="h-8 w-8 mb-2 opacity-50" />
                <p>No active charging sessions currently.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-4">
        <h3 className="text-lg font-medium">Active Sessions ({sessions.length})</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Card key={session.sessionId} className="relative overflow-hidden border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {session.stationName}
                    </CardTitle>
                    <p className="font-bold text-lg">{session.licensePlate}</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 animate-pulse">
                  {session.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <div className="flex items-center text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Duration</span>
                </div>
                <div className="font-medium text-right">
                    {calculateDuration(session.startTime)}
                </div>

                <div className="flex items-center text-muted-foreground">
                    <Zap className="w-4 h-4 mr-1" />
                    <span>Energy</span>
                </div>
                <div className="font-medium text-right">
                    {session.energyKwh} kWh
                </div>

                 <div className="flex items-center text-muted-foreground">
                    <Battery className="w-4 h-4 mr-1" />
                    <span>Cost (Est.)</span>
                </div>
                <div className="font-medium text-right">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(session.cost)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function calculateDuration(startTime: string) {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diff = now - start;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
        return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
}
