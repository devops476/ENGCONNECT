"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { Video, Calendar as CalendarIcon, TrendingUp, Award, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { CalendarView } from "@/components/ui/calendar-view";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/student/dashboard");
        if (response.ok) {
          const dashboardData = await response.json();
          setData(dashboardData);
        }
      } catch (error) {
        console.error("Error fetching student dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Welcome to EngConnect!</h2>
        <p className="text-muted-foreground text-center max-w-md">
          It looks like your student profile hasn't been set up yet. 
          Please contact your administrator to get enrolled in a batch.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋</h1>
          <p className="text-muted-foreground mt-1">Ready for another great learning session?</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900 rounded-full">
          <Award className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
            {data.stats.attendanceRate >= 90 ? "Top Performer 🔥" : "Keep Learning 📚"}
          </span>
        </div>
      </div>

      {/* Tabs for Dashboard / Calendar */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Enrolled Batches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.enrolledBatches.length}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <span>Active courses</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Attendance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(data.stats.attendanceRate)}%</div>
                <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      data.stats.attendanceRate >= 90 ? "bg-green-500" : 
                      data.stats.attendanceRate >= 75 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${data.stats.attendanceRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Available Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{data.stats.creditBalance || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Use for course enrollment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Upcoming Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.upcomingClasses.length === 0 ? (
                  <p className="text-muted-foreground">No upcoming classes scheduled</p>
                ) : (
                  data.upcomingClasses.map((session: any) => {
                    const isLive = session.status === "live";

                    return (
                      <div
                        key={session.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors gap-4"
                      >
                        <div className="space-y-2">
                          {isLive && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full">
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              LIVE NOW
                            </span>
                          )}
                          <h4 className="font-semibold">{session.topic}</h4>
                          <p className="text-sm text-muted-foreground">{session.batchName}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatDate(new Date(session.startTime))}</span>
                            <span>{formatTime(new Date(session.startTime))}</span>
                            <span>Instructor: {session.instructorName}</span>
                          </div>
                        </div>
                        <Button
                          className={isLive ? "bg-green-600 hover:bg-green-700" : ""}
                          disabled={!isLive}
                          asChild={isLive}
                        >
                          {isLive ? (
                            <a href={`/student/classroom/${session.batchId}/${session.id}`} target="_blank">
                              <Video className="h-4 w-4 mr-2" />
                              Join Now
                            </a>
                          ) : (
                            <>
                              <Video className="h-4 w-4 mr-2" />
                              Starts Soon
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentAttendances.length === 0 ? (
                    <p className="text-muted-foreground">No attendance records yet</p>
                  ) : (
                    data.recentAttendances.map((attendance: any) => (
                      <div key={attendance.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{attendance.sessionTopic}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(attendance.sessionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {attendance.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentPayments.length === 0 ? (
                    <p className="text-muted-foreground">No payment history</p>
                  ) : (
                    data.recentPayments.map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            ${payment.amount}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {payment.method}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView 
            events={data.upcomingClasses.map((c: any) => ({
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
    </div>
  );
}

