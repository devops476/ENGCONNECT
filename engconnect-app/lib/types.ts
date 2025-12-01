// User and Authentication Types
export type UserRole = "admin" | "student";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
}

// Student Types
export interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    enrolledAt: Date;
    batchIds: string[];
    paymentStatus: "paid" | "pending" | "overdue";
    totalPaid: number;
    totalDue: number;
    attendanceRate: number;
    avatar?: string;
}

// Batch Types
export interface Batch {
    id: string;
    name: string;
    level: "beginner" | "intermediate" | "advanced";
    schedule: {
        days: string[]; // e.g., ["Monday", "Wednesday", "Friday"]
        time: string; // e.g., "10:00 AM"
    };
    capacity: number;
    enrolledCount: number;
    instructorName: string;
    startDate: Date;
    endDate: Date;
    description: string;
}

// Class Session Types
export interface ClassSession {
    id: string;
    batchId: string;
    batchName: string;
    topic: string;
    startTime: Date;
    endTime: Date;
    liveKitRoomName: string;
    liveKitToken?: string;
    status: "scheduled" | "live" | "completed" | "cancelled";
    instructorName: string;
    attendees: string[]; // student IDs
    recordingUrl?: string;
    notes?: string;
}

// Payment Types
export interface Payment {
    id: string;
    studentId: string;
    studentName: string;
    amount: number;
    date: Date;
    method: "cash" | "card" | "upi" | "bank_transfer";
    status: "completed" | "pending" | "failed";
    batchId?: string;
    description: string;
}

// Attendance Types
export interface Attendance {
    id: string;
    sessionId: string;
    studentId: string;
    status: "present" | "absent" | "late";
    joinedAt?: Date;
    leftAt?: Date;
    duration?: number; // in minutes
}

// Notification Types
export interface Notification {
    id: string;
    userId: string;
    type: "class_reminder" | "payment_due" | "announcement" | "attendance";
    title: string;
    message: string;
    createdAt: Date;
    read: boolean;
    actionUrl?: string;
}

// Dashboard Stats Types
export interface AdminStats {
    totalStudents: number;
    activeBatches: number;
    todaysClasses: number;
    monthlyRevenue: number;
}

export interface StudentStats {
    classesAttended: number;
    totalClasses: number;
    attendanceRate: number;
    currentStreak: number;
}
