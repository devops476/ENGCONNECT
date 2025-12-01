"use client";

import { Play, Star, MessageCircle, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-primary text-sm font-medium">
                Trusted by 15,000+ English learners
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-foreground text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
                Master English Fluency with Expert Tutors
              </h1>
              <p className="text-muted-foreground text-lg lg:text-xl max-w-xl leading-relaxed">
                Learn from native speakers, practice real conversations, and speak English confidently in just 3 months.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              <div className="space-y-1">
                <p className="text-foreground text-3xl font-semibold">200+</p>
                <p className="text-muted-foreground text-sm">Expert Tutors</p>
              </div>
              <div className="space-y-1">
                <p className="text-foreground text-3xl font-semibold">100+</p>
                <p className="text-muted-foreground text-sm">Daily Live Sessions</p>
              </div>
              <div className="space-y-1">
                <p className="text-foreground text-3xl font-semibold">95%</p>
                <p className="text-muted-foreground text-sm">Fluency Achievement</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/login">
                <Button size="lg" className="shadow-lg shadow-primary/20">
                  Start Learning Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right Image/Visual */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl">
              <div className="aspect-[4/3] relative bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop"
                  alt="English conversation learning"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              {/* Floating card - Live Session Indicator */}
              <div className="absolute top-6 left-6 bg-card/90 backdrop-blur-xl border border-border rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold">Live Now</p>
                    <p className="text-muted-foreground text-xs">Business English Conversation</p>
                  </div>
                </div>
              </div>

              {/* Floating card - Active Learners */}
              <div className="absolute bottom-6 right-6 bg-card/90 backdrop-blur-xl border border-border rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground text-lg font-semibold">15,000+</p>
                    <p className="text-muted-foreground text-xs">Active Learners</p>
                  </div>
                </div>
              </div>

              {/* Floating card - Global Access */}
              <div className="absolute top-1/2 -right-4 bg-card/90 backdrop-blur-xl border border-border rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-accent" />
                  <span className="text-foreground text-xs font-semibold">Learn from anywhere</span>
                </div>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
