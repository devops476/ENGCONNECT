import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";

// POST /api/admin/classes/start-live - Start a scheduled class session as live
export async function POST(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json(
                { error: "Session ID is required" },
                { status: 400 }
            );
        }

        // Call the LiveKit room creation API
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/livekit/room`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Pass through authentication - in production, use proper auth headers
                Cookie: request.headers.get("cookie") || "",
            },
            body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(
                { error: error.error || "Failed to start live session" },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            message: "Session started successfully",
            room: data.room,
        });
    } catch (error) {
        console.error("Error starting live session:", error);
        return NextResponse.json(
            { error: "Failed to start live session" },
            { status: 500 }
        );
    }
}
