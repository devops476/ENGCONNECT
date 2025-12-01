import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { stackServerApp } from "@/stack";

// This would typically be in a separate config file or env vars
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PROJECT_NUMBER = process.env.GOOGLE_PROJECT_NUMBER;
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

export async function POST(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();

        // Only admins should be able to create calendar events
        const isAdmin = user?.primaryEmail?.endsWith("@engconnect.com") &&
            user?.primaryEmail.startsWith("admin");

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, startTime, endTime, attendees } = body;

        // Mock implementation if credentials are missing
        if (!GOOGLE_PRIVATE_KEY || !GOOGLE_CLIENT_EMAIL) {
            console.log("Google Calendar credentials missing, skipping API call");
            return NextResponse.json({
                success: true,
                eventId: "mock-event-id-" + Date.now(),
                message: "Event created (mocked)"
            });
        }

        const jwtClient = new google.auth.JWT(
            GOOGLE_CLIENT_EMAIL,
            undefined,
            GOOGLE_PRIVATE_KEY,
            SCOPES
        );

        const calendar = google.calendar({ version: "v3", auth: jwtClient });

        const event = {
            summary: title,
            description: description,
            start: {
                dateTime: new Date(startTime).toISOString(),
                timeZone: "UTC", // Adjust as needed
            },
            end: {
                dateTime: new Date(endTime).toISOString(),
                timeZone: "UTC",
            },
            attendees: attendees?.map((email: string) => ({ email })),
            conferenceData: {
                createRequest: {
                    requestId: "sample123",
                    conferenceSolutionKey: { type: "hangoutsMeet" },
                },
            },
        };

        const response = await calendar.events.insert({
            calendarId: GOOGLE_CALENDAR_ID || "primary",
            requestBody: event,
            conferenceDataVersion: 1,
        });

        return NextResponse.json({
            success: true,
            eventId: response.data.id,
            meetLink: response.data.hangoutLink
        });

    } catch (error) {
        console.error("Error creating calendar event:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
