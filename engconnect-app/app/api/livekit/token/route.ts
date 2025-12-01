import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { stackServerApp } from "@/stack";

export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const roomName = searchParams.get("room");
        const username = user.primaryEmail || "User";

        console.log(`Token request - Room: ${roomName}, User: ${username}, IsAdmin: ${user.primaryEmail?.startsWith("admin@engconnect.com")}`);

        if (!roomName) {
            return NextResponse.json(
                { error: "Missing room name" },
                { status: 400 }
            );
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        if (!apiKey || !apiSecret) {
            return NextResponse.json(
                { error: "Server misconfigured" },
                { status: 500 }
            );
        }

        const at = new AccessToken(apiKey, apiSecret, {
            identity: username,
            name: user.displayName || username,
        });

        const isAdmin = user.primaryEmail?.startsWith("admin@engconnect.com");

        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
            roomAdmin: isAdmin, // Give admin full control
        });

        const token = await at.toJwt();

        return NextResponse.json({
            token,
            serverUrl: process.env.LIVEKIT_URL || "wss://engconnect-l5ybn4jh.livekit.cloud"
        });
    } catch (error) {
        console.error("Error generating token:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
