"use client";

import { StackHandler } from "@stackframe/stack";

import { useRouter } from "next/navigation";

export default function Handler() {
  const router = useRouter();

  return (
    <StackHandler
      fullPage
      // @ts-ignore - onSignIn is valid but types might be outdated
      onSignIn={async (user: any) => {
        console.log("Sign in successful", user);
        // Determine redirect based on role
        const isAdmin = user.primaryEmail?.endsWith("@engconnect.com") && 
                        user.primaryEmail.startsWith("admin");
        
        // Redirect to appropriate dashboard
        const target = isAdmin ? "/admin" : "/student";
        console.log("Redirecting to:", target);
        router.push(target);
      }}
    />
  );
}
