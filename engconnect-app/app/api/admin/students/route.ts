import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack";

// GET /api/admin/students - List all students with optional filters
export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const paymentStatus = searchParams.get("paymentStatus");

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { user: { name: { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
                { phone: { contains: search, mode: "insensitive" } },
            ];
        }

        if (paymentStatus && paymentStatus !== "all") {
            where.paymentStatus = paymentStatus.toUpperCase();
        }

        const students = await prisma.student.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                enrollments: {
                    include: {
                        batch: {
                            select: {
                                name: true,
                                level: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                enrolledAt: "desc",
            },
        });

        // Format response
        const formattedStudents = students.map((student) => ({
            id: student.id,
            userId: student.userId,
            name: student.user.name || "N/A",
            email: student.user.email,
            phone: student.phone || "N/A",
            avatar: student.user.avatar || "",
            enrolledAt: student.enrolledAt,
            paymentStatus: student.paymentStatus.toLowerCase(),
            totalPaid: Number(student.totalPaid),
            totalDue: Number(student.totalDue),
            attendanceRate: student.attendanceRate,
            batches: student.enrollments.map((e) => e.batch),
        }));

        return NextResponse.json(formattedStudents);
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json(
            { error: "Failed to fetch students" },
            { status: 500 }
        );
    }
}

// POST /api/admin/students - Create new student
export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { email, name, phone, totalDue } = body;

        // Validate required fields
        if (!email || !name) {
            return NextResponse.json(
                { error: "Email and name are required" },
                { status: 400 }
            );
        }

        // First, create user record (this would typically be done via Stack Auth)
        // For now, we'll create a placeholder user entry
        const newUser = await prisma.user.create({
            data: {
                id: `student_${Date.now()}`, // Temporary ID until Stack Auth user is created
                email,
                name,
                role: "STUDENT",
            },
        });

        // Create student profile
        const newStudent = await prisma.student.create({
            data: {
                userId: newUser.id,
                phone: phone || null,
                totalDue: totalDue || 0,
                paymentStatus: totalDue > 0 ? "PENDING" : "PAID",
            },
            include: {
                user: true,
            },
        });

        return NextResponse.json({
            id: newStudent.id,
            userId: newStudent.userId,
            name: newStudent.user.name,
            email: newStudent.user.email,
            phone: newStudent.phone,
            enrolledAt: newStudent.enrolledAt,
            paymentStatus: newStudent.paymentStatus.toLowerCase(),
            totalPaid: Number(newStudent.totalPaid),
            totalDue: Number(newStudent.totalDue),
            attendanceRate: newStudent.attendanceRate,
        });
    } catch (error) {
        console.error("Error creating student:", error);
        return NextResponse.json(
            { error: "Failed to create student" },
            { status: 500 }
        );
    }
}

// PUT /api/admin/students?id=xxx - Update student
export async function PUT(request: NextRequest) {
    try {
        // Verify admin authentication
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get("id");

        if (!studentId) {
            return NextResponse.json(
                { error: "Student ID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { name, phone, totalDue, paymentStatus } = body;

        // Update user name if provided
        if (name) {
            const student = await prisma.student.findUnique({
                where: { id: studentId },
            });

            if (student) {
                await prisma.user.update({
                    where: { id: student.userId },
                    data: { name },
                });
            }
        }

        // Update student record
        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: {
                phone: phone !== undefined ? phone : undefined,
                totalDue: totalDue !== undefined ? totalDue : undefined,
                paymentStatus: paymentStatus
                    ? (paymentStatus.toUpperCase() as any)
                    : undefined,
            },
            include: {
                user: true,
            },
        });

        return NextResponse.json({
            id: updatedStudent.id,
            userId: updatedStudent.userId,
            name: updatedStudent.user.name,
            email: updatedStudent.user.email,
            phone: updatedStudent.phone,
            paymentStatus: updatedStudent.paymentStatus.toLowerCase(),
            totalPaid: Number(updatedStudent.totalPaid),
            totalDue: Number(updatedStudent.totalDue),
        });
    } catch (error) {
        console.error("Error updating student:", error);
        return NextResponse.json(
            { error: "Failed to update student" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/students?id=xxx - Delete student
export async function DELETE(request: NextRequest) {
    try {
        // Verify admin authentication
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get("id");

        if (!studentId) {
            return NextResponse.json(
                { error: "Student ID is required" },
                { status: 400 }
            );
        }

        // Get student to also delete user
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Delete student (cascade will handle related records)
        await prisma.student.delete({
            where: { id: studentId },
        });

        // Delete user record
        await prisma.user.delete({
            where: { id: student.userId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting student:", error);
        return NextResponse.json(
            { error: "Failed to delete student" },
            { status: 500 }
        );
    }
}
