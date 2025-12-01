import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";
import { stackServerApp } from "@/stack";
import prisma from "@/lib/prisma";

const livekitHost = process.env.LIVEKIT_URL || "";
const apiKey = process.env.LIVEKIT_API_KEY || "";
const apiSecret = process.env.LIVEKIT_API_SECRET || "";

const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

// POST /api/livekit/room - Create a new LiveKit room
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

        // Get the session from database
        const session = await prisma.classSession.findUnique({
            where: { id: sessionId },
            include: {
                batch: {
                    select: {
                        name: true,
                        capacity: true,
                    },
                },
            },
        });

        if (!session) {
            return NextResponse.json(
                { error: "Session not found" },
                { status: 404 }
            );
        }

        // Ensure we use a robust, short room name (fixes old classes with long names)
        const robustRoomName = `session_${sessionId}`;

        // Update session with robust name AND status
        await prisma.classSession.update({
            where: { id: sessionId },
            data: {
                liveKitRoomName: robustRoomName,
                status: "LIVE",
            },
        });

        console.log(`Starting LiveKit room: ${robustRoomName} (Session: ${sessionId})`);

        // Create LiveKit room
        const room = await roomService.createRoom({
            name: robustRoomName,
            emptyTimeout: 10 * 60, // 10 minutes - room closes if empty
            maxParticipants: session.batch.capacity + 5, // Allow some extra for instructors/admins
        });

        // Get all students enrolled in the batch
        const enrollments = await prisma.batchEnrollment.findMany({
            where: { batchId: session.batchId },
            include: { student: true },
        });

        // Create notifications for all students
        if (enrollments.length > 0) {
            await prisma.notification.createMany({
                data: enrollments.map((enrollment) => ({
                    userId: enrollment.student.userId,
                    type: "CLASS_REMINDER",
                    title: "Class is Now Live! 🔴",
                    message: `Join "${session.topic}" now! The session has started.`,
                    read: false,
                    actionUrl: `/student/classroom/${session.batchId}`,
                })),
            });
        }

        return NextResponse.json({
            success: true,
            room: {
                name: room.name,
                sid: room.sid,
                maxParticipants: room.maxParticipants,
            },
        });
    } catch (error) {
        console.error("Error creating LiveKit room:", error);
        return NextResponse.json(
            { error: "Failed to create room" },
            { status: 500 }
        );
    }
}

// DELETE /api/livekit/room?roomName=xxx - Delete a LiveKit room
export async function DELETE(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const roomName = searchParams.get("roomName");

        if (!roomName) {
            return NextResponse.json(
                { error: "Room name is required" },
                { status: 400 }
            );
        }

        // Delete the LiveKit room (disconnects all participants)
        await roomService.deleteRoom(roomName);

        // Update session status to COMPLETED
        await prisma.classSession.update({
            where: { liveKitRoomName: roomName },
            data: {
                status: "COMPLETED",
            },
        });

        return NextResponse.json({
            success: true,
            message: "Room deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting LiveKit room:", error);
        return NextResponse.json(
            { error: "Failed to delete room" },
            { status: 500 }
        );
    }
}
