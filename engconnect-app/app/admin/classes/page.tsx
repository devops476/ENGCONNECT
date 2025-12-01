"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Users, MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ClassFormDialog } from "@/components/admin/class-form-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { CalendarView } from "@/components/ui/calendar-view";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "scheduled" | "live" | "completed">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/admin/classes?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartLive = async (sessionId: string) => {
    try {
      const response = await fetch("/api/admin/classes/start-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Session is now live! Opening video conference...",
        });
        
        // Open video conference in new tab
        window.open(`/admin/live-session/${sessionId}`, '_blank');
        
        fetchClasses(); // Refresh the list
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to start session",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error starting live session:", error);
      toast({
        title: "Error",
        description: "Failed to start session",
        variant: "destructive",
      });
    }
  };

  const handleEndLive = async (sessionId: string) => {
    try {
      const response = await fetch("/api/admin/classes/end-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Session ended successfully",
        });
        fetchClasses(); // Refresh the list
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to end session",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error ending live session:", error);
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">Schedule and manage class sessions</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Schedule New Class
        </Button>
      </div>

      <div className="flex gap-2">
        {(["all", "scheduled", "live", "completed"] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium">No classes found</h3>
              <p className="text-muted-foreground mt-1">Schedule your first class to get started.</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                Schedule Class
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((session) => (
                <Card key={session.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            session.status === "live" ? "destructive" : 
                            session.status === "completed" ? "secondary" : "default"
                          } className="capitalize">
                            {session.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{session.batchName}</span>
                        </div>
                        <h3 className="text-xl font-semibold">{session.topic}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(session.startTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{session.attendanceCount} Attended</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {session.status === "scheduled" && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleStartLive(session.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Video className="mr-2 h-4 w-4" /> Go Live Now
                          </Button>
                        )}
                        {session.status === "live" && (
                          <>
                            <div className="flex items-center gap-2">
                              <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                              </div>
                              <span className="text-sm font-medium text-red-600">LIVE</span>
                            </div>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => window.open(`/admin/live-session/${session.id}`, '_blank')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Video className="mr-2 h-4 w-4" /> Join Session
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleEndLive(session.id)}
                            >
                              End Session
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Mark Attendance</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Cancel Class</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView 
            events={classes.map((c) => ({
              id: c.id,
              title: c.topic,
              start: new Date(c.startTime),
              end: new Date(c.endTime),
              status: c.status,
              type: "class"
            }))} 
          />
        </TabsContent>
      </Tabs>

      <ClassFormDialog 
        open={dialogOpen}
 
        onOpenChange={setDialogOpen}
        onSuccess={fetchClasses}
      />
    </div>
  );
}
