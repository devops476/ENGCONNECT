import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
});

console.log("Stack Server App Initialized", {
    projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    hasServerKey: !!process.env.STACK_SECRET_SERVER_KEY,
});

