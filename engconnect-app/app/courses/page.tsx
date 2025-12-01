import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Clock, Search, Users, Star } from "lucide-react";
import Link from "next/link";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { q?: string; level?: string };
}) {
  const query = searchParams.q || "";
  const level = searchParams.level || "";

  const batches = await prisma.batch.findMany({
    where: {
      AND: [
        { name: { contains: query, mode: "insensitive" } },
        level ? { level: level as any } : {},
      ],
    },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Explore Our Courses
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the perfect course to upgrade your English skills. From beginner basics to advanced business communication.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-9"
              defaultValue={query}
              name="q"
            />
          </div>
          <form className="flex gap-2">
            <select
              name="level"
              defaultValue={level}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            <Button type="submit">Filter</Button>
          </form>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <Card key={batch.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-muted">
                {batch.coverImage ? (
                  <img
                    src={batch.coverImage}
                    alt={batch.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-primary/10">
                    <BookOpen className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                <Badge className="absolute top-4 right-4" variant="secondary">
                  {batch.level}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{batch.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {batch.description || "No description available."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{batch.enrolledCount} enrolled</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{batch.scheduleTime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">Instructor:</span>
                  <span className="text-muted-foreground">{batch.instructorName}</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-4">
                <div className="text-lg font-bold">
                  ₹{batch.price.toString()}
                </div>
                <Button asChild>
                  <Link href={`/courses/${batch.id}`}>Enroll Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {batches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
