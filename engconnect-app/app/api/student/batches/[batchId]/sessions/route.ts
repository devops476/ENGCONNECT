import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack";

// GET /api/student/batches/[batchId]/sessions - Get all sessions for a batch
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ batchId: string }> }
) {
    try {
        const params = await props.params;
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const batchId = params.batchId;

        // Get batch info
        const batch = await prisma.batch.findUnique({
            where: { id: batchId },
            select: {
                name: true,
                level: true,
            },
        });

        if (!batch) {
            return NextResponse.json(
                { error: "Batch not found" },
                { status: 404 }
            );
        }

        // Get sessions for the batch (upcoming and recent)
        const sessions = await prisma.classSession.findMany({
            where: {
                batchId,
                // Only show scheduled, live, or recently completed sessions
                OR: [
                    { status: "SCHEDULED" },
                    { status: "LIVE" },
                    {
                        status: "COMPLETED",
                        endTime: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                        },
                    },
                ],
            },
            orderBy: {
                startTime: "asc",
            },
        });

        return NextResponse.json({
            batch,
            sessions: sessions.map((session) => ({
                id: session.id,
                topic: session.topic,
                startTime: session.startTime,
                endTime: session.endTime,
                status: session.status.toLowerCase(),
                instructorName: session.instructorName,
                liveKitRoomName: session.liveKitRoomName,
            })),
        });
    } catch (error) {
        console.error("Error fetching batch sessions:", error);
        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}
