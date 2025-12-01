import type { Student, Batch, ClassSession, Payment, Attendance, Notification } from "./types";

// Mock Students
export const mockStudents: Student[] = [
    {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        enrolledAt: new Date("2024-01-15"),
        batchIds: ["1", "2"],
        paymentStatus: "paid",
        totalPaid: 500,
        totalDue: 0,
        attendanceRate: 95,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    },
    {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "+1234567891",
        enrolledAt: new Date("2024-02-01"),
        batchIds: ["1"],
        paymentStatus: "pending",
        totalPaid: 200,
        totalDue: 300,
        attendanceRate: 88,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    {
        id: "3",
        name: "Michael Chen",
        email: "michael@example.com",
        phone: "+1234567892",
        enrolledAt: new Date("2024-01-20"),
        batchIds: ["2"],
        paymentStatus: "overdue",
        totalPaid: 100,
        totalDue: 400,
        attendanceRate: 72,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    },
];

// Mock Batches
export const mockBatches: Batch[] = [
    {
        id: "1",
        name: "Business English - Morning",
        level: "intermediate",
        schedule: {
            days: ["Monday", "Wednesday", "Friday"],
            time: "10:00 AM",
        },
        capacity: 15,
        enrolledCount: 12,
        instructorName: "Dr. Emma Williams",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-30"),
        description: "Professional business communication and email writing",
    },
    {
        id: "2",
        name: "Conversational English - Evening",
        level: "beginner",
        schedule: {
            days: ["Tuesday", "Thursday"],
            time: "6:00 PM",
        },
        capacity: 15,
        enrolledCount: 10,
        instructorName: "Prof. James Anderson",
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-07-31"),
        description: "Daily conversation practice and fluency building",
    },
    {
        id: "3",
        name: "Advanced English Grammar",
        level: "advanced",
        schedule: {
            days: ["Monday", "Thursday"],
            time: "4:00 PM",
        },
        capacity: 12,
        enrolledCount: 8,
        instructorName: "Dr. Lisa Brown",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-06-15"),
        description: "Complex grammar structures and academic writing",
    },
];

// Mock Class Sessions
export const mockClassSessions: ClassSession[] = [
    {
        id: "1",
        batchId: "1",
        batchName: "Business English - Morning",
        topic: "Effective Email Communication",
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        liveKitRoomName: "business-english-session-1",
        status: "scheduled",
        instructorName: "Dr. Emma Williams",
        attendees: ["1", "2"],
    },
    {
        id: "2",
        batchId: "2",
        batchName: "Conversational English - Evening",
        topic: "Introducing Yourself Professionally",
        startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago (live)
        endTime: new Date(Date.now() + 30 * 60 * 1000),
        liveKitRoomName: "conversational-english-session-2",
        status: "live",
        instructorName: "Prof. James Anderson",
        attendees: ["1", "3"],
        recordingUrl: "/recordings/session-2",
    },
    {
        id: "3",
        batchId: "1",
        batchName: "Business English - Morning",
        topic: "Meeting Etiquette",
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        liveKitRoomName: "business-english-session-3",
        status: "completed",
        instructorName: "Dr. Emma Williams",
        attendees: ["1", "2"],
        recordingUrl: "/recordings/session-3",
        notes: "Great participation! Focus on using modal verbs next time.",
    },
];

// Mock Payments
export const mockPayments: Payment[] = [
    {
        id: "1",
        studentId: "1",
        studentName: "John Doe",
        amount: 500,
        date: new Date("2024-01-15"),
        method: "card",
        status: "completed",
        batchId: "1",
        description: "Monthly tuition - January 2024",
    },
    {
        id: "2",
        studentId: "2",
        studentName: "Sarah Johnson",
        amount: 200,
        date: new Date("2024-02-01"),
        method: "upi",
        status: "completed",
        batchId: "1",
        description: "Partial payment - Batch enrollment",
    },
    {
        id: "3",
        studentId: "3",
        studentName: "Michael Chen",
        amount: 300,
        date: new Date("2024-02-15"),
        method: "cash",
        status: "pending",
        batchId: "2",
        description: "Monthly tuition - February 2024",
    },
];

// Mock Attendance
export const mockAttendance: Attendance[] = [
    {
        id: "1",
        sessionId: "3",
        studentId: "1",
        status: "present",
        joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        leftAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 55 * 60 * 1000),
        duration: 55,
    },
    {
        id: "2",
        sessionId: "3",
        studentId: "2",
        status: "late",
        joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
        leftAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        duration: 45,
    },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
    {
        id: "1",
        userId: "1",
        type: "class_reminder",
        title: "Class Starting Soon",
        message: "Your Business English class starts in 1 hour",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        actionUrl: "/student/classes",
    },
    {
        id: "2",
        userId: "2",
        type: "payment_due",
        title: "Payment Reminder",
        message: "Your monthly tuition payment of $300 is pending",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: false,
        actionUrl: "/student/profile",
    },
    {
        id: "3",
        userId: "1",
        type: "announcement",
        title: "New Course Available",
        message: "Check out our new Advanced Speaking Skills batch!",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        read: true,
    },
];
