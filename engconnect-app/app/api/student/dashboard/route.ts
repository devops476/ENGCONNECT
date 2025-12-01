import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack";

// GET /api/student/dashboard - Get student dashboard data
export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find student by Stack Auth user ID
        const student = await prisma.student.findUnique({
            where: {
                userId: user.id,
            },
            include: {
                user: true,
                enrollments: {
                    include: {
                        batch: {
                            include: {
                                sessions: {
                                    where: {
                                        startTime: {
                                            gte: new Date(),
                                        },
                                    },
                                    orderBy: {
                                        startTime: "asc",
                                    },
                                    take: 5,
                                },
                            },
                        },
                    },
                },
                payments: {
                    orderBy: {
                        date: "desc",
                    },
                    take: 10,
                },
                attendances: {
                    where: {
                        session: {
                            status: "COMPLETED",
                        },
                    },
                    include: {
                        session: {
                            select: {
                                topic: true,
                                startTime: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 10,
                },
            },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Get upcoming classes from all enrolled batches
        const upcomingClasses = student.enrollments.flatMap((enrollment) =>
            enrollment.batch.sessions.map((session) => ({
                id: session.id,
                topic: session.topic,
                batchName: enrollment.batch.name,
                batchLevel: enrollment.batch.level.toLowerCase(),
                startTime: session.startTime,
                endTime: session.endTime,
                instructorName: session.instructorName,
                status: session.status.toLowerCase(),
            }))
        );

        // Sort upcoming classes by start time
        upcomingClasses.sort(
            (a, b) => a.startTime.getTime() - b.startTime.getTime()
        );

        return NextResponse.json({
            student: {
                id: student.id,
                name: student.user.name,
                email: student.user.email,
                phone: student.phone,
                avatar: student.user.avatar,
                enrolledAt: student.enrolledAt,
            },
            stats: {
                attendanceRate: student.attendanceRate,
                paymentStatus: student.paymentStatus.toLowerCase(),
                totalPaid: Number(student.totalPaid),
                totalDue: Number(student.totalDue),
                creditBalance: Number((student as any).creditBalance || 0),
            },
            enrolledBatches: student.enrollments.map((enrollment) => ({
                id: enrollment.batch.id,
                name: enrollment.batch.name,
                level: enrollment.batch.level.toLowerCase(),
                scheduleDays: enrollment.batch.scheduleDays,
                scheduleTime: enrollment.batch.scheduleTime,
                instructorName: enrollment.batch.instructorName,
                enrolledAt: enrollment.enrolledAt,
            })),
            upcomingClasses: upcomingClasses.slice(0, 5),
            recentPayments: student.payments.map((payment) => ({
                id: payment.id,
                amount: Number(payment.amount),
                date: payment.date,
                method: payment.method.toLowerCase(),
                status: payment.status.toLowerCase(),
                description: payment.description,
            })),
            recentAttendances: student.attendances.map((attendance) => ({
                id: attendance.id,
                sessionTopic: attendance.session.topic,
                sessionDate: attendance.session.startTime,
                status: attendance.status.toLowerCase(),
                duration: attendance.duration,
            })),
        });
    } catch (error) {
        console.error("Error fetching student dashboard:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
