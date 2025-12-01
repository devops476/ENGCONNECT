import { Clock, Star, Users, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export async function Courses() {
  const batches: any[] = await prisma.batch.findMany({
    orderBy: { startDate: 'asc' },
    take: 4,
  });

  return (
    <section className="py-20 px-8" id="courses">
      <div className="max-w-[1440px] mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <h2 className="text-foreground text-4xl font-semibold tracking-tight">
            Popular English Courses
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Choose from our comprehensive courses designed to boost your English fluency and confidence.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {batches.map((batch) => (
            <Link href={`/courses/${batch.id}`} key={batch.id} className="block group">
              <div
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all h-full"
              >
                {/* Course Image Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="absolute inset-0 bg-secondary/50" />
                  {batch.coverImage ? (
                    <img src={batch.coverImage} alt={batch.name} className="w-full h-full object-cover relative z-10" />
                  ) : (
                    <BookOpen className="w-16 h-16 text-primary/40 relative z-10" />
                  )}
                  
                  {/* Tag */}
                  <div className={`absolute top-3 left-3 bg-primary px-3 py-1 rounded-full`}>
                    <span className="text-background text-xs font-semibold">
                      New
                    </span>
                  </div>

                  {/* Level Badge */}
                  <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border">
                    <span className="text-foreground text-xs font-medium">
                      {batch.level}
                    </span>
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-foreground text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {batch.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      by {batch.instructorName}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>5.0</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{batch.enrolledCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{batch.scheduleTime}</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-xl font-semibold">
                        ₹{batch.price?.toString() || "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center pt-4">
          <button className="px-8 py-3 bg-secondary border border-border text-foreground rounded-lg hover:bg-card hover:border-primary/30 transition-all font-medium">
            View All Courses
          </button>
        </div>
      </div>
    </section>
  );
}
