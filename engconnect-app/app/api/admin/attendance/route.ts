import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack";

// GET /api/admin/attendance - Get attendance records for a session
export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json(
                { error: "Session ID is required" },
                { status: 400 }
            );
        }

        const attendances = await prisma.attendance.findMany({
            where: {
                sessionId,
            },
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
        });

        const formattedAttendances = attendances.map((attendance) => ({
            id: attendance.id,
            studentId: attendance.studentId,
            studentName: attendance.student.user.name,
            status: attendance.status.toLowerCase(),
            joinedAt: attendance.joinedAt,
            leftAt: attendance.leftAt,
            duration: attendance.duration,
        }));

        return NextResponse.json(formattedAttendances);
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return NextResponse.json(
            { error: "Failed to fetch attendance" },
            { status: 500 }
        );
    }
}

// POST /api/admin/attendance - Mark attendance for a class session
export async function POST(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, attendances } = body;

        if (!sessionId || !attendances || !Array.isArray(attendances)) {
            return NextResponse.json(
                { error: "Missing or invalid data" },
                { status: 400 }
            );
        }

        // Upsert attendance records
        const results = [];
        for (const record of attendances) {
            const { studentId, status } = record;

            const attendance = await prisma.attendance.upsert({
                where: {
                    sessionId_studentId: {
                        sessionId,
                        studentId,
                    },
                },
                update: {
                    status: status.toUpperCase(),
                    joinedAt: status === "present" ? new Date() : null,
                },
                create: {
                    sessionId,
                    studentId,
                    status: status.toUpperCase(),
                    joinedAt: status === "present" ? new Date() : null,
                },
            });

            results.push(attendance);
        }

        // Recalculate attendance rate for each student
        for (const record of attendances) {
            const { studentId } = record;

            // Get total sessions for batches the student is enrolled in
            const studentEnrollments = await prisma.batchEnrollment.findMany({
                where: {
                    studentId,
                },
                select: {
                    batchId: true,
                },
            });

            const batchIds = studentEnrollments.map((e) => e.batchId);

            // Count total completed sessions
            const totalSessions = await prisma.classSession.count({
                where: {
                    batchId: {
                        in: batchIds,
                    },
                    status: "COMPLETED",
                },
            });

            // Count sessions student attended
            const attendedSessions = await prisma.attendance.count({
                where: {
                    studentId,
                    status: "PRESENT",
                    session: {
                        status: "COMPLETED",
                    },
                },
            });

            // Calculate and update attendance rate
            const attendanceRate =
                totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

            await prisma.student.update({
                where: {
                    id: studentId,
                },
                data: {
                    attendanceRate,
                },
            });
        }

        return NextResponse.json({
            success: true,
            markedCount: results.length,
        });
    } catch (error) {
        console.error("Error marking attendance:", error);
        return NextResponse.json(
            { error: "Failed to mark attendance" },
            { status: 500 }
        );
    }
}
