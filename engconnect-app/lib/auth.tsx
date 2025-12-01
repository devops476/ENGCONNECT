"use client";

import { useStackApp, useUser as useStackUser } from "@stackframe/stack";
import type { UserRole } from "@/lib/types";

// Helper function to get user role from Stack metadata
// Note: Stack Auth handles roles differently, but we can store it in client metadata or infer it
export function useUserRole(): UserRole | null {
  const user = useStackUser();
  
  if (!user) return null;
  
  // For now, we'll default to student unless specific email for admin
  // In a real app, you'd use Stack's teams/roles feature or client metadata
  if (user.primaryEmail?.endsWith("@engconnect.com") && user.primaryEmail.startsWith("admin")) {
    return "admin";
  }
  
  return "student";
}

// Helper function to check if user is authenticated
export function useAuth() {
  const user = useStackUser();
  const app = useStackApp();
  const role = useUserRole();

  return {
    user: user ? {
      id: user.id,
      email: user.primaryEmail || "",
      name: user.displayName || "User",
      role: role || "student",
      avatar: user.profileImageUrl || "",
    } : null,
    isAuthenticated: !!user,
    isLoaded: true, // Stack hooks handle loading internally usually, but we can check user state
    logout: () => app.signOut(),
    role,
  };
}

// Helper function to check if user has admin role
export function useIsAdmin(): boolean {
  const role = useUserRole();
  return role === "admin";
}

// Helper function to check if user has student role
export function useIsStudent(): boolean {
  const role = useUserRole();
  return role === "student";
}
