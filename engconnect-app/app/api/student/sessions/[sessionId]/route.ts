import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack";

export const dynamic = 'force-dynamic';

// GET /api/student/sessions/[sessionId] - Get session details for student
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ sessionId: string }> }
) {
    try {
        const params = await props.params;
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sessionId = params.sessionId;

        const session = await prisma.classSession.findUnique({
            where: { id: sessionId },
            include: {
                batch: {
                    select: {
                        name: true,
                        level: true,
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

        return NextResponse.json({
            id: session.id,
            topic: session.topic,
            batchName: session.batch.name,
            batchLevel: session.batch.level,
            startTime: session.startTime,
            endTime: session.endTime,
            status: session.status.toLowerCase(),
            instructorName: session.instructorName,
            liveKitRoomName: session.liveKitRoomName,
        });
    } catch (error) {
        console.error("Error fetching session:", error);
        return NextResponse.json(
            { error: "Failed to fetch session" },
            { status: 500 }
        );
    }
}
