import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    const publicRoutes = ["/login", "/sign-up", "/handler"];
    if (pathname === "/" || publicRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    try {
        // Get user from Stack Auth
        const user = await stackServerApp.getUser();

        // If not authenticated, redirect to login
        if (!user) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Check user role based on email
        const isAdmin = user.primaryEmail?.endsWith("@engconnect.com") &&
            user.primaryEmail.startsWith("admin");

        // Protect admin routes
        if (pathname.startsWith("/admin") && !isAdmin) {
            // Regular users trying to access admin routes -> redirect to student dashboard
            return NextResponse.redirect(new URL("/student", request.url));
        }

        // Protect student routes (optional - admins can view student pages)
        if (pathname.startsWith("/student") && !isAdmin) {
            // This is fine - students can access their own dashboard
            return NextResponse.next();
        }

        return NextResponse.next();
    } catch (error) {
        console.error("Middleware error:", error);
        // On error, redirect to login to be safe
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
