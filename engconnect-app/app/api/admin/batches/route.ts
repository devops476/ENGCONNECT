import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack";

// GET /api/admin/batches - List all batches
export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const batches = await prisma.batch.findMany({
            include: {
                enrollments: {
                    include: {
                        student: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
                sessions: {
                    where: {
                        startTime: { gte: new Date() },
                    },
                    orderBy: {
                        startTime: "asc",
                    },
                    take: 3,
                },
            },
            orderBy: {
                startDate: "desc",
            },
        });

        const formattedBatches = batches.map((batch) => ({
            id: batch.id,
            name: batch.name,
            level: batch.level.toLowerCase(),
            scheduleDays: batch.scheduleDays,
            scheduleTime: batch.scheduleTime,
            capacity: batch.capacity,
            enrolledCount: batch.enrollments.length,
            instructorName: batch.instructorName,
            startDate: batch.startDate,
            endDate: batch.endDate,
            description: batch.description,
            price: (batch as any).price,
            students: batch.enrollments.map((e) => ({
                id: e.student.id,
                name: e.student.user.name,
                email: e.student.user.email,
            })),
            upcomingSessions: batch.sessions,
        }));

        return NextResponse.json(formattedBatches);
    } catch (error) {
        console.error("Error fetching batches:", error);
        return NextResponse.json(
            { error: "Failed to fetch batches" },
            { status: 500 }
        );
    }
}

// POST /api/admin/batches - Create new batch
export async function POST(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            level,
            scheduleDays,
            scheduleTime,
            capacity,
            instructorName,
            startDate,
            endDate,
            description,
            price,
        } = body;

        // Validate required fields
        if (
            !name ||
            !level ||
            !scheduleDays ||
            !scheduleTime ||
            !capacity ||
            !instructorName ||
            !startDate ||
            !endDate
        ) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const newBatch = await prisma.batch.create({
            data: {
                name,
                level: level.toUpperCase(),
                scheduleDays,
                scheduleTime,
                capacity: parseInt(capacity),
                instructorName,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                description: description || null,
                price: parseFloat(price || "0"),
            } as any,
        });

        return NextResponse.json({
            id: newBatch.id,
            name: newBatch.name,
            level: newBatch.level.toLowerCase(),
            scheduleDays: newBatch.scheduleDays,
            scheduleTime: newBatch.scheduleTime,
            capacity: newBatch.capacity,
            enrolledCount: 0,
            instructorName: newBatch.instructorName,
            startDate: newBatch.startDate,
            endDate: newBatch.endDate,
            description: newBatch.description,
        });
    } catch (error) {
        console.error("Error creating batch:", error);
        return NextResponse.json(
            { error: "Failed to create batch" },
            { status: 500 }
        );
    }
}

// PUT /api/admin/batches?id=xxx - Update batch
export async function PUT(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const batchId = searchParams.get("id");

        if (!batchId) {
            return NextResponse.json(
                { error: "Batch ID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();

        const updatedBatch = await prisma.batch.update({
            where: { id: batchId },
            data: {
                name: body.name,
                level: body.level ? body.level.toUpperCase() : undefined,
                scheduleDays: body.scheduleDays,
                scheduleTime: body.scheduleTime,
                capacity: body.capacity ? parseInt(body.capacity) : undefined,
                instructorName: body.instructorName,
                startDate: body.startDate ? new Date(body.startDate) : undefined,
                endDate: body.endDate ? new Date(body.endDate) : undefined,
                description: body.description,
                price: body.price ? parseFloat(body.price) : undefined,
            } as any,
        });

        return NextResponse.json(updatedBatch);
    } catch (error) {
        console.error("Error updating batch:", error);
        return NextResponse.json(
            { error: "Failed to update batch" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/batches?id=xxx - Delete batch
export async function DELETE(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const batchId = searchParams.get("id");

        if (!batchId) {
            return NextResponse.json(
                { error: "Batch ID is required" },
                { status: 400 }
            );
        }

        await prisma.batch.delete({
            where: { id: batchId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting batch:", error);
        return NextResponse.json(
            { error: "Failed to delete batch" },
            { status: 500 }
        );
    }
}
