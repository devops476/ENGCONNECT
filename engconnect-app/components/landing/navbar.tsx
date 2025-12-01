"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Suspense, useEffect, useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, LayoutDashboard, User } from "lucide-react";

function NavbarAuth() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <Link href="/login">
          <Button variant="ghost" className="hidden md:block">
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button className="shadow-lg shadow-primary/20">
            Get Started
          </Button>
        </Link>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Link href="/login">
          <Button variant="ghost" className="hidden md:block">
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button className="shadow-lg shadow-primary/20">
            Get Started
          </Button>
        </Link>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem asChild>
          <Link href={user?.role === "admin" ? "/admin" : "/student"}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={user?.role === "admin" ? "/admin/profile" : "/student/profile"}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-[1440px] mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl tracking-tight font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              ENGCONNECT
            </span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#courses" className="text-muted-foreground hover:text-foreground transition-colors">
              Courses
            </a>
            <a href="#live-classes" className="text-muted-foreground hover:text-foreground transition-colors">
              Live Sessions
            </a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Suspense fallback={<Button variant="ghost" size="sm" disabled>Loading...</Button>}>
              <NavbarAuth />
            </Suspense>
          </div>
        </div>
      </div>
    </nav>
  );
}
