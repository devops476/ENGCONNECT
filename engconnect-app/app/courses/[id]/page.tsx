import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, CheckCircle, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { stackServerApp } from "@/stack";
import { enrollInCourse } from "@/app/actions/enroll";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const batch: any = await prisma.batch.findUnique({
    where: { id },
  });

  if (!batch) {
    notFound();
  }

  // Check if user is enrolled
  const user = await stackServerApp.getUser();
  let isEnrolled = false;

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.primaryEmail! },
      include: { studentProfile: true },
    });

    if (dbUser?.studentProfile) {
      const enrollment = await prisma.batchEnrollment.findUnique({
        where: {
          studentId_batchId: {
            studentId: dbUser.studentProfile.id,
            batchId: batch.id,
          },
        },
      });
      isEnrolled = !!enrollment;
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-muted">
          {batch.coverImage ? (
            <img
              src={batch.coverImage}
              alt={batch.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-primary/10">
              <BookOpen className="h-24 w-24 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white space-y-2">
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
              {batch.level}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold">{batch.name}</h1>
            <div className="flex items-center gap-4 text-sm md:text-base text-gray-200">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{batch.instructorName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{batch.scheduleTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">About This Course</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {batch.description || "No description provided for this course."}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">What You'll Learn</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Master English Grammar", "Improve Pronunciation", "Build Vocabulary", "Confidence in Speaking"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Schedule</h2>
              <div className="flex flex-wrap gap-2">
                {batch.scheduleDays.map((day: string) => (
                  <Badge key={day} variant="outline" className="text-base py-1 px-3">
                    {day}
                  </Badge>
                ))}
              </div>
              <p className="text-muted-foreground">
                Classes are held at {batch.scheduleTime}.
              </p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Fee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-3xl font-bold text-primary">
                  ₹{batch.price.toString()}
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="font-medium text-foreground">
                      {Math.ceil((batch.endDate.getTime() - batch.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))} Weeks
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level</span>
                    <span className="font-medium text-foreground">{batch.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enrolled</span>
                    <span className="font-medium text-foreground">{batch.enrolledCount} Students</span>
                  </div>
                </div>

                {isEnrolled ? (
                  <Button className="w-full" size="lg" variant="secondary" asChild>
                    <a href="/student">Go to Dashboard</a>
                  </Button>
                ) : (
                  <form action={enrollInCourse.bind(null, batch.id)}>
                    <Button className="w-full" size="lg" type="submit">
                      Enroll Now
                    </Button>
                  </form>
                )}
                
                <p className="text-xs text-center text-muted-foreground">
                  30-day money-back guarantee
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
