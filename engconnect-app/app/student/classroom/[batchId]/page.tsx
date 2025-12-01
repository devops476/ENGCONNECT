import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, FileText, MessageSquare, User, BookOpen } from "lucide-react";
import { formatTime } from "@/lib/utils";

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const user = await stackServerApp.getUser();
  if (!user) redirect("/login");

  let dbUser = await prisma.user.findUnique({
    where: { email: user.primaryEmail! },
    include: { studentProfile: true },
  });

  // Create user if doesn't exist
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.primaryEmail!,
        name: user.displayName || user.primaryEmail!,
        role: "STUDENT",
      },
      include: { studentProfile: true },
    });
  }

  // Create student profile if doesn't exist
  if (!dbUser.studentProfile) {
    await prisma.student.create({
      data: { userId: dbUser.id },
    });
    
    // Reload with student profile
    dbUser = await prisma.user.findUnique({
      where: { email: user.primaryEmail! },
      include: { studentProfile: true },
    });
  }

  if (!dbUser || !dbUser.studentProfile) {
    redirect("/student");
  }

  // Verify enrollment
  const enrollment = await prisma.batchEnrollment.findUnique({
    where: {
      studentId_batchId: {
        studentId: dbUser.studentProfile.id,
        batchId: batchId,
      },
    },
  });

  if (!enrollment) {
    // Not enrolled, redirect to course page
    redirect(`/courses/${batchId}`);
  }

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      sessions: {
        orderBy: { startTime: "asc" },
        include: {
          attendances: {
            where: { studentId: dbUser.studentProfile.id }
          }
        }
      },
    },
  });

  if (!batch) notFound();

  const upcomingSessions = batch.sessions.filter(s => new Date(s.startTime) > new Date());
  const pastSessions = batch.sessions.filter(s => new Date(s.startTime) <= new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline">{batch.level}</Badge>
            <span className="text-sm text-muted-foreground">{batch.scheduleDays.join(", ")} @ {batch.scheduleTime}</span>
          </div>
          <h1 className="text-3xl font-bold">{batch.name}</h1>
          <p className="text-muted-foreground">Instructor: {batch.instructorName}</p>
        </div>
        <Button variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" /> Class Chat
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About this Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                    {batch.description || "No description available."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Session</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingSessions.length > 0 ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/10">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 rounded-lg text-primary">
                          <span className="text-xs font-bold uppercase">
                            {upcomingSessions[0].startTime.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold">
                            {upcomingSessions[0].startTime.getDate()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{upcomingSessions[0].topic}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatTime(upcomingSessions[0].startTime)} - {formatTime(upcomingSessions[0].endTime)}
                            </span>
                          </div>
                        </div>
                        <Button asChild>
                          <a href={`/student/classroom/${batchId}/${upcomingSessions[0].id}`} target="_blank">
                            Join Class
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No upcoming sessions scheduled.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Attendance</span>
                    <span className="font-medium">
                      {Math.round((batch.sessions.filter(s => s.attendances.length > 0 && s.attendances[0].status === 'PRESENT').length / Math.max(pastSessions.length, 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full" 
                      style={{ width: `${Math.round((batch.sessions.filter(s => s.attendances.length > 0 && s.attendances[0].status === 'PRESENT').length / Math.max(pastSessions.length, 1)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You have attended {batch.sessions.filter(s => s.attendances.length > 0 && s.attendances[0].status === 'PRESENT').length} out of {pastSessions.length} completed sessions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>View past and upcoming sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {batch.sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg ${
                        new Date(session.startTime) < new Date() ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                      }`}>
                        <span className="text-xs font-bold uppercase">
                          {session.startTime.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold">
                          {session.startTime.getDate()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {session.topic}
                          {session.status === 'LIVE' && (
                            <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                          )}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(session.startTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {session.instructorName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.recordingUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer">
                            <Video className="mr-2 h-4 w-4" /> Recording
                          </a>
                        </Button>
                      )}
                      {session.status === 'LIVE' || (new Date(session.startTime) > new Date() && new Date(session.startTime).getTime() - Date.now() < 15 * 60 * 1000) ? (
                        <Button size="sm" asChild>
                          <a href={`/student/classroom/${batchId}/${session.id}`} target="_blank">
                            Join Live
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Resources</CardTitle>
              <CardDescription>Notes and materials from your classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {batch.sessions.filter(s => s.notes).map((session) => (
                  <div key={session.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{session.topic} Notes</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {session.notes}
                      </p>
                      <Button variant="link" className="px-0 h-auto mt-2">
                        View Notes
                      </Button>
                    </div>
                  </div>
                ))}
                {batch.sessions.filter(s => s.notes).length === 0 && (
                  <p className="text-muted-foreground col-span-2 text-center py-8">
                    No resources uploaded yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
