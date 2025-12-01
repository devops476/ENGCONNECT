import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack";

// GET /api/admin/classes - List all class sessions with optional status filter
export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const where: any = {};

        if (status && status !== "all") {
            where.status = status.toUpperCase();
        }

        const sessions = await prisma.classSession.findMany({
            where,
            include: {
                batch: {
                    select: {
                        name: true,
                        level: true,
                    },
                },
                attendances: {
                    include: {
                        student: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                startTime: "desc",
            },
        });

        const formattedSessions = sessions.map((session) => ({
            id: session.id,
            batchId: session.batchId,
            batchName: session.batch.name,
            topic: session.topic,
            startTime: session.startTime,
            endTime: session.endTime,
            status: session.status.toLowerCase(),
            instructorName: session.instructorName,
            liveKitRoomName: session.liveKitRoomName,
            recordingUrl: session.recordingUrl,
            notes: session.notes,
            attendees: session.attendances.map((a) => ({
                studentId: a.studentId,
                name: a.student.user.name,
                status: a.status.toLowerCase(),
                joinedAt: a.joinedAt,
                duration: a.duration,
            })),
            attendanceCount: session.attendances.filter((a) => a.status === "PRESENT")
                .length,
        }));

        return NextResponse.json(formattedSessions);
    } catch (error) {
        console.error("Error fetching class sessions:", error);
        return NextResponse.json(
            { error: "Failed to fetch class sessions" },
            { status: 500 }
        );
    }
}

// POST /api/admin/classes - Schedule new class session
export async function POST(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            batchId,
            topic,
            startTime,
            endTime,
            instructorName,
            notes,
        } = body;

        if (!batchId || !topic || !startTime || !endTime || !instructorName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const newSession = await prisma.classSession.create({
            data: {
                batchId,
                topic,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                instructorName,
                liveKitRoomName: "", // Placeholder, will be updated after ID is generated
                notes: notes || null,
                status: "SCHEDULED",
            },
            include: {
                batch: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        // Generate LiveKit room name using the new session ID
        const roomName = `session_${newSession.id}`;

        // Update the session with the generated room name
        await prisma.classSession.update({
            where: { id: newSession.id },
            data: { liveKitRoomName: roomName },
        });

        // Get all students enrolled in the batch
        const enrollments = await prisma.batchEnrollment.findMany({
            where: { batchId },
            include: { student: true },
        });

        // Create notifications for all students
        if (enrollments.length > 0) {
            await prisma.notification.createMany({
                data: enrollments.map((enrollment) => ({
                    userId: enrollment.student.userId,
                    type: "CLASS_REMINDER",
                    title: "New Class Scheduled",
                    message: `A new class "${topic}" has been scheduled for ${new Date(startTime).toLocaleString()}.`,
                    read: false,
                    actionUrl: `/student/classroom/${batchId}`,
                })),
            });
        }

        return NextResponse.json({
            id: newSession.id,
            batchId: newSession.batchId,
            batchName: newSession.batch.name,
            topic: newSession.topic,
            startTime: newSession.startTime,
            endTime: newSession.endTime,
            status: newSession.status.toLowerCase(),
            instructorName: newSession.instructorName,
            liveKitRoomName: roomName,
        });
    } catch (error) {
        console.error("Error creating class session:", error);
        return NextResponse.json(
            { error: "Failed to create class session" },
            { status: 500 }
        );
    }
}

// PUT /api/admin/classes?id=xxx - Update class session
export async function PUT(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("id");

        if (!sessionId) {
            return NextResponse.json(
                { error: "Session ID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();

        const updatedSession = await prisma.classSession.update({
            where: { id: sessionId },
            data: {
                topic: body.topic,
                startTime: body.startTime ? new Date(body.startTime) : undefined,
                endTime: body.endTime ? new Date(body.endTime) : undefined,
                instructorName: body.instructorName,
                status: body.status ? body.status.toUpperCase() : undefined,
                notes: body.notes,
                recordingUrl: body.recordingUrl,
            },
        });

        return NextResponse.json(updatedSession);
    } catch (error) {
        console.error("Error updating class session:", error);
        return NextResponse.json(
            { error: "Failed to update class session" },
            { status: 500 }
        );
    }
}
