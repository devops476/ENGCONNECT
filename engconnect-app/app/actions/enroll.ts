"use server";

import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack";
import { redirect } from "next/navigation";

export async function enrollInCourse(batchId: string) {
    const user = await stackServerApp.getUser();

    if (!user) {
        redirect(`/login?redirect=/courses/${batchId}`);
    }

    // Find or create user in database
    let dbUser = await prisma.user.findUnique({
        where: { email: user.primaryEmail! },
        include: { studentProfile: true },
    });

    if (!dbUser) {
        // Create user in database
        dbUser = await prisma.user.create({
            data: {
                id: user.id,
                email: user.primaryEmail!,
                name: user.displayName || user.primaryEmail!,
                role: "STUDENT",
            },
            include: { studentProfile: true },
        });
    }

    let studentId = dbUser.studentProfile?.id;

    if (!studentId) {
        // Create student profile if missing
        const newStudent = await prisma.student.create({
            data: {
                userId: dbUser.id,
            },
        });
        studentId = newStudent.id;
    }

    // Create enrollment
    await prisma.batchEnrollment.create({
        data: {
            studentId: studentId,
            batchId: batchId,
        },
    });

    // Get batch info for notification
    const batch = await prisma.batch.findUnique({
        where: { id: batchId },
    });

    // Create notification
    await prisma.notification.create({
        data: {
            userId: dbUser.id,
            type: "ANNOUNCEMENT",
            title: "Enrollment Successful",
            message: `You have successfully enrolled in ${batch?.name}. Welcome aboard!`,
            read: false,
            actionUrl: `/student/classroom/${batchId}`,
        },
    });

    redirect("/student");
}
