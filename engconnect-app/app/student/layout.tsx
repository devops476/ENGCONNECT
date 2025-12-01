"use client";

import { ReactNode, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Calendar,
  Video,
  User,
  Bell,
  LogOut,
} from "lucide-react";
import Loading from "./loading";

const navigation = [
  { name: "Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "My Classes", href: "/student/classes", icon: Calendar },
  { name: "Recordings", href: "/student/recordings", icon: Video },
  { name: "Profile", href: "/student/profile", icon: User },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <StudentLayoutContent>{children}</StudentLayoutContent>
    </Suspense>
  );
}

function StudentLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isLoaded } = useAuth();

  if (!isLoaded) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                EngConnect
              </h2>
              
              <nav className="hidden md:flex items-center gap-6">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">Student</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
              </div>

              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      <nav className="md:hidden border-b border-border bg-card">
        <div className="flex overflow-x-auto p-2 gap-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
