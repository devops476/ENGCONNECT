import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import prisma from "@/lib/prisma";

// POST /api/admin/classes/end-live - End a live class session
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

        // Get the session
        const session = await prisma.classSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            return NextResponse.json(
                { error: "Session not found" },
                { status: 404 }
            );
        }

        // Delete the LiveKit room
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/livekit/room?roomName=${session.liveKitRoomName}`,
            {
                method: "DELETE",
                headers: {
                    Cookie: request.headers.get("cookie") || "",
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(
                { error: error.error || "Failed to end session" },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Session ended successfully",
        });
    } catch (error) {
        console.error("Error ending live session:", error);
        return NextResponse.json(
            { error: "Failed to end session" },
            { status: 500 }
        );
    }
}
