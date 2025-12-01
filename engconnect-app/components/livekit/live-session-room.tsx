"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { Loader2 } from "lucide-react";

interface LiveSessionRoomProps {
    roomName: string;
    userName: string;
}

import { useRoomContext } from "@livekit/components-react";

function SessionInfo({ roomName, userName }: { roomName: string, userName: string }) {
    const room = useRoomContext();
    const [numParticipants, setNumParticipants] = useState(0);
    const [connectionState, setConnectionState] = useState("Unknown");

    useEffect(() => {
        if (!room) return;

        const updateStats = () => {
            // Count remote participants + local participant (1)
            setNumParticipants(room.remoteParticipants.size + 1);
            setConnectionState(room.state);
        };

        updateStats();
        
        room.on("participantConnected", updateStats);
        room.on("participantDisconnected", updateStats);
        room.on("connected", updateStats);
        room.on("reconnected", updateStats);
        room.on("disconnected", updateStats);

        return () => {
            room.off("participantConnected", updateStats);
            room.off("participantDisconnected", updateStats);
            room.off("connected", updateStats);
            room.off("reconnected", updateStats);
            room.off("disconnected", updateStats);
        };
    }, [room]);

    if (connectionState !== "connected") return null;

    return (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg pointer-events-none">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white font-medium text-sm">Live</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="text-white/90 text-sm">
                {numParticipants} {numParticipants === 1 ? "Participant" : "Participants"}
            </div>
        </div>
    );
}

export function LiveSessionRoom({ roomName, userName }: LiveSessionRoomProps) {
    const [token, setToken] = useState<string>("");
    const [serverUrl, setServerUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectError, setConnectError] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch(
                    `/api/livekit/token?room=${encodeURIComponent(roomName)}`
                );

                if (!response.ok) {
                    throw new Error("Failed to get access token");
                }

                const data = await response.json();
                setToken(data.token);
                setServerUrl(data.serverUrl);
            } catch (err) {
                console.error("Error fetching token:", err);
                setError("Failed to join session. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, [roomName]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-lg text-muted-foreground">Joining session...</p>
                </div>
            </div>
        );
    }

    if (error || connectError) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
                        <h3 className="text-lg font-semibold text-destructive mb-2">Connection Error</h3>
                        <p className="text-muted-foreground">{error || connectError}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!token) {
        return null;
    }

    return (
        <div className="h-screen w-full">
            <LiveKitRoom
                token={token}
                serverUrl={serverUrl}
                connect={true}
                onError={(err) => {
                    console.error("LiveKit connection error:", err);
                    setConnectError(err.message || "Failed to connect to LiveKit server");
                }}
                data-lk-theme="default"
                className="h-full"
            >
                <VideoConference />
                <RoomAudioRenderer />
                <SessionInfo roomName={roomName} userName={userName} />
            </LiveKitRoom>
        </div>
    );
}
