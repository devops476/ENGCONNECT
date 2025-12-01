import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getClassStatus, formatTime } from "@/lib/utils";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Clock,
} from "lucide-react";
import { stackServerApp } from "@/stack";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileEditDialog } from "@/components/student/profile-edit-dialog";

export default async function StudentProfilePage() {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.primaryEmail! },
    include: {
      studentProfile: {
        include: {
          enrollments: {
            include: {
              batch: true
            }
          },
          attendances: {
            include: {
              session: true
            },
            take: 5,
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  if (!dbUser) {
    return <div>User not found</div>;
  }

  const student = dbUser.studentProfile;
  const enrolledBatches = student?.enrollments.map(e => e.batch) || [];

  // Fetch upcoming classes for enrolled batches
  const batchIds = enrolledBatches.map(b => b.id);
  const upcomingClasses = await prisma.classSession.findMany({
    where: {
      batchId: { in: batchIds },
      startTime: { gte: new Date() },
      status: "SCHEDULED"
    },
    orderBy: { startTime: 'asc' },
    take: 3
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Card */}
        <Card className="md:w-1/3">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={dbUser.avatar || undefined} />
              <AvatarFallback className="text-2xl">
                {dbUser.name?.slice(0, 2).toUpperCase() || "ST"}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{dbUser.name}</h2>
            <Badge variant="secondary" className="mt-2 capitalize">
              {dbUser.role.toLowerCase()}
            </Badge>
            
            <div className="w-full mt-6 space-y-4 text-left">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{dbUser.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student?.phone || "No phone added"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>New York, USA</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>Joined {dbUser.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            <ProfileEditDialog user={{ name: dbUser.name, phone: student?.phone || "" }} />
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="md:w-2/3 space-y-6">
          {/* Enrolled Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Enrolled Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrolledBatches.length > 0 ? (
                  enrolledBatches.map((batch) => (
                    <div key={batch.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{batch.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {batch.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="capitalize badge badge-sm bg-secondary px-2 py-0.5 rounded">
                            {batch.level}
                          </span>
                          <span>Instructor: {batch.instructorName}</span>
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <a href={`/student/classroom/${batch.id}`}>View</a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No enrolled courses yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

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
                {upcomingClasses.length > 0 ? (
                  upcomingClasses.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 rounded-lg text-primary">
                          <span className="text-xs font-bold uppercase">
                            {session.startTime.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold">
                            {session.startTime.getDate()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{session.topic}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Join</Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No upcoming classes scheduled.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
