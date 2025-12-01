"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Clock, Users, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentClassesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrolledBatches, setEnrolledBatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchEnrolledClasses = async () => {
      try {
        const response = await fetch("/api/student/dashboard");
        if (response.ok) {
          const data = await response.json();
          setEnrolledBatches(data.enrolledBatches || []);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledClasses();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Classes</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your enrolled courses
          </p>
        </div>
        <Button asChild>
          <a href="/courses">Browse More Courses</a>
        </Button>
      </div>

      {enrolledBatches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Classes Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              You haven't enrolled in any courses yet. Browse our catalog to get started!
            </p>
            <Button asChild>
              <a href="/courses">Explore Courses</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledBatches.map((batch) => (
            <Card key={batch.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2 capitalize">
                      {batch.level}
                    </Badge>
                    <CardTitle className="line-clamp-2">{batch.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Instructor: {batch.instructorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{batch.scheduleDays?.join(", ") || "Schedule TBA"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{batch.scheduleTime || "Time TBA"}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-3">
                    Enrolled {new Date(batch.enrolledAt).toLocaleDateString()}
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={() => router.push(`/student/classroom/${batch.id}`)}
                  >
                    Go to Classroom
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
