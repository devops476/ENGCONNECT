"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LiveSessionRoom } from "@/components/livekit/live-session-room";
import { Loader2 } from "lucide-react";

export default function AdminLiveSessionPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const [session, setSession] = useState<any>(null);
    const [userName, setUserName] = useState<string>("Instructor");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                // Fetch session details using the admin API
                const sessionResponse = await fetch(`/api/admin/classes?id=${sessionId}`);
                if (!sessionResponse.ok) {
                    throw new Error("Failed to fetch session");
                }
                const sessions = await sessionResponse.json();
                const sessionData = sessions.find((s: any) => s.id === sessionId);
                
                if (!sessionData) {
                    throw new Error("Session not found");
                }
                
                setSession(sessionData);

                // Fetch user info
                const userResponse = await fetch("/api/user");
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUserName(userData.name || "Instructor");
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
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-lg text-muted-foreground">Loading session...</p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
                        <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
                        <p className="text-muted-foreground">{error || "Session not found"}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (session.status !== "live") {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-2">Session Not Live</h2>
                    <p className="text-muted-foreground">
                        This session is currently {session.status}. 
                        {session.status === "scheduled" && " Please start the session first."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full">
            <LiveSessionRoom 
                roomName={session.liveKitRoomName} 
                userName={userName}
            />
        </div>
    );
}
