import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack";

// GET /api/admin/payments - List all payments with optional filters
export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const studentId = searchParams.get("studentId");

        const where: any = {};

        if (status && status !== "all") {
            where.status = status.toUpperCase();
        }

        if (studentId) {
            where.studentId = studentId;
        }

        const payments = await prisma.payment.findMany({
            where,
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
            orderBy: {
                date: "desc",
            },
        });

        const formattedPayments = payments.map((payment) => ({
            id: payment.id,
            studentId: payment.studentId,
            studentName: payment.student.user.name,
            studentEmail: payment.student.user.email,
            amount: Number(payment.amount),
            date: payment.date,
            method: payment.method.toLowerCase(),
            status: payment.status.toLowerCase(),
            description: payment.description,
        }));

        return NextResponse.json(formattedPayments);
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json(
            { error: "Failed to fetch payments" },
            { status: 500 }
        );
    }
}

// POST /api/admin/payments - Record new payment
export async function POST(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user || !user.primaryEmail?.startsWith("admin@engconnect.com")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { studentId, amount, method, description, batchId } = body;

        if (!studentId || !amount || !method || !description) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create payment record
        const newPayment = await prisma.payment.create({
            data: {
                studentId,
                amount: parseFloat(amount),
                method: method.toUpperCase(),
                status: "COMPLETED",
                description,
                batchId: batchId || null,
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

        // Update student's total paid and due
        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: {
                totalPaid: {
                    increment: parseFloat(amount),
                },
                totalDue: {
                    decrement: parseFloat(amount),
                },
            },
        });

        // Update payment status if balance is cleared
        if (Number(updatedStudent.totalDue) <= 0) {
            await prisma.student.update({
                where: { id: studentId },
                data: {
                    paymentStatus: "PAID",
                    totalDue: 0,
                },
            });
        }

        return NextResponse.json({
            id: newPayment.id,
            studentId: newPayment.studentId,
            studentName: newPayment.student.user.name,
            amount: Number(newPayment.amount),
            date: newPayment.date,
            method: newPayment.method.toLowerCase(),
            status: newPayment.status.toLowerCase(),
            description: newPayment.description,
        });
    } catch (error) {
        console.error("Error recording payment:", error);
        return NextResponse.json(
            { error: "Failed to record payment" },
            { status: 500 }
        );
    }
}
