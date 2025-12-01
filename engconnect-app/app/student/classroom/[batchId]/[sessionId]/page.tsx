"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LiveSessionRoom } from "@/components/livekit/live-session-room";
import { Loader2 } from "lucide-react";

export default function SessionRoomPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const [session, setSession] = useState<any>(null);
    const [userName, setUserName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                // Fetch session details
                const sessionResponse = await fetch(`/api/student/sessions/${sessionId}`);
                if (!sessionResponse.ok) {
                    throw new Error("Failed to fetch session");
                }
                const sessionData = await sessionResponse.json();
                setSession(sessionData);

                // Fetch user info
                const userResponse = await fetch("/api/user");
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUserName(userData.name || userData.email || "Student");
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load session. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchSessionData();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Unable to Join Session</h2>
                    <p className="text-muted-foreground">{error || "Session not found"}</p>
                </div>
            </div>
        );
    }

    if (session.status !== "live") {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-2">Session Not Live</h2>
                    <p className="text-muted-foreground">
                        This session is currently {session.status}. 
                        {session.status === "scheduled" && " Please wait for the instructor to start the session."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <LiveSessionRoom 
            roomName={session.liveKitRoomName} 
            userName={userName}
        />
    );
}
