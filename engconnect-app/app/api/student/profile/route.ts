import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack";

export async function PUT(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone } = body;

        // Update User name
        await prisma.user.update({
            where: { email: user.primaryEmail! },
            data: { name },
        });

        // Update Student phone
        // First check if student profile exists, if not create it (though it should exist)
        const dbUser = await prisma.user.findUnique({
            where: { email: user.primaryEmail! },
            include: { studentProfile: true },
        });

        if (dbUser) {
            if (dbUser.studentProfile) {
                await prisma.student.update({
                    where: { id: dbUser.studentProfile.id },
                    data: { phone },
                });
            } else {
                await prisma.student.create({
                    data: {
                        userId: dbUser.id,
                        phone,
                    },
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
