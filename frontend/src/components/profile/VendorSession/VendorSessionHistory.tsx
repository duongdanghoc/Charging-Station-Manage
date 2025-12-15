import React, { useState } from "react";
import { useGetVendorSessionHistoryQuery } from "@/lib/redux/services/profileApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function VendorSessionHistory() {
  const [page, setPage] = useState(0);
  const [date, setDate] = useState<Date>();
  // Simplified filter for demo
  const { data, isLoading } = useGetVendorSessionHistoryQuery({
    page,
    size: 10,
    from: date ? startOfDay(date).toISOString() : undefined,
    to: date ? endOfDay(date).toISOString() : undefined,
  });

  const sessions = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Session History</h3>
        <div className="flex gap-2">
            <Popover>
            <PopoverTrigger asChild>
                <Button
                variant={"outline"}
                className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Filter by start date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                />
            </PopoverContent>
            </Popover>
            {date && <Button variant="ghost" onClick={() => setDate(undefined)}>Clear</Button>}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start Time</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Energy</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
                  </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No history found.
                  </TableCell>
                </TableRow>
              ) : (
                  sessions.map((session: any) => (
                    <TableRow key={session.sessionId}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                              {format(new Date(session.startTime), "PP")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                              {format(new Date(session.startTime), "p")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                          <div className="flex flex-col">
                              <span>{session.stationName}</span>
                              <span className="text-xs text-muted-foreground">{session.connectorType}</span>
                          </div>
                      </TableCell>
                      <TableCell>
                          <div className="flex flex-col">
                           <span>{session.customerName}</span>
                           <span className="text-xs text-muted-foreground">{session.licensePlate}</span>
                          </div>
                      </TableCell>
                      <TableCell>{session.energyKwh} kWh</TableCell>
                      <TableCell>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(session.cost)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={session.status === "COMPLETED" ? "default" : "destructive"}>
                          {session.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
  
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data || data.data?.last || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
      </div>
    </div>
  );
}
