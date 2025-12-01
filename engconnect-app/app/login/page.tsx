"use client";

import { SignIn } from "@stackframe/stack";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <GraduationCap className="w-24 h-24 mb-6 animate-pulse" />
          <h1 className="text-5xl font-bold mb-4">EngConnect</h1>
          <p className="text-xl opacity-90 text-center max-w-md">
            Master English fluency with expert tutors and live interactive classes
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">200+</div>
              <div className="text-sm opacity-80">Expert Tutors</div>
            </div>
            <div>
              <div className="text-4xl font-bold">15K+</div>
              <div className="text-sm opacity-80">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold">95%</div>
              <div className="text-sm opacity-80">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Stack Sign In */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-6">
            <ThemeToggle />
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-muted-foreground">Sign in to continue your learning journey</p>
          </div>

          <div className="flex justify-center w-full">
            <SignIn fullPage={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
