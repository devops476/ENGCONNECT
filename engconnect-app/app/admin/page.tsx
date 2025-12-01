"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Users, BookOpen, Calendar, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

// Types for dashboard data
interface DashboardStats {
  totalStudents: number;
  activeBatches: number;
  todayClasses: number;
  monthlyRevenue: number;
  upcomingClasses: any[];
  recentStudents: any[];
  paymentSummary: {
    collected: number;
    pending: number;
    overdue: number;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeBatches: 0,
    todayClasses: 0,
    monthlyRevenue: 0,
    upcomingClasses: [],
    recentStudents: [],
    paymentSummary: {
      collected: 0,
      pending: 0,
      overdue: 0,
    },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data from multiple endpoints in parallel
        const [studentsRes, batchesRes, classesRes, paymentsRes] = await Promise.all([
          fetch("/api/admin/students"),
          fetch("/api/admin/batches"),
          fetch("/api/admin/classes?status=scheduled"),
          fetch("/api/admin/payments"),
        ]);

        if (studentsRes.ok && batchesRes.ok && classesRes.ok && paymentsRes.ok) {
          const students = await studentsRes.json();
          const batches = await batchesRes.json();
          const classes = await classesRes.json();
          const payments = await paymentsRes.json();

          // Calculate stats
          const today = new Date();
          const todayClasses = classes.filter((c: any) => {
            const classDate = new Date(c.startTime);
            return (
              classDate.getDate() === today.getDate() &&
              classDate.getMonth() === today.getMonth() &&
              classDate.getFullYear() === today.getFullYear()
            );
          }).length;

          const currentMonthRevenue = payments
            .filter((p: any) => {
              const paymentDate = new Date(p.date);
              return (
                paymentDate.getMonth() === today.getMonth() &&
                paymentDate.getFullYear() === today.getFullYear() &&
                p.status === "completed"
              );
            })
            .reduce((sum: number, p: any) => sum + p.amount, 0);

          const pendingPayments = students.reduce(
            (sum: number, s: any) => sum + (s.paymentStatus === "pending" ? s.totalDue : 0),
            0
          );
          
          const overduePayments = students.reduce(
            (sum: number, s: any) => sum + (s.paymentStatus === "overdue" ? s.totalDue : 0),
            0
          );

          setStats({
            totalStudents: students.length,
            activeBatches: batches.length,
            todayClasses,
            monthlyRevenue: currentMonthRevenue,
            upcomingClasses: classes.slice(0, 5),
            recentStudents: students.slice(0, 5),
            paymentSummary: {
              collected: currentMonthRevenue,
              pending: pendingPayments,
              overdue: overduePayments,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Active Batches",
      value: stats.activeBatches,
      icon: BookOpen,
      trend: "+2",
      trendUp: true,
    },
    {
      title: "Today's Classes",
      value: stats.todayClasses,
      icon: Calendar,
      trend: "On Schedule",
      trendUp: true,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue),
      icon: DollarSign,
      trend: "+18%",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name?.split(" ")[0] || "Admin"}! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                {stat.trendUp && <TrendingUp className="h-3 w-3 text-green-500" />}
                <span className={stat.trendUp ? "text-green-500" : ""}>{stat.trend}</span>
                <span>from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.upcomingClasses.length === 0 ? (
              <p className="text-muted-foreground">No upcoming classes</p>
            ) : (
              stats.upcomingClasses.map((session: any) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold">{session.topic}</h4>
                    <p className="text-sm text-muted-foreground">{session.batchName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {session.attendees?.length || 0} students
                    </div>
                    <button className="text-sm text-primary hover:underline">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Payment Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentStudents.length === 0 ? (
                <p className="text-muted-foreground">No students found</p>
              ) : (
                stats.recentStudents.map((student: any) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      student.paymentStatus === "paid"
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : student.paymentStatus === "pending"
                        ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                        : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                    }`}>
                      {student.paymentStatus}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Collected (This Month)</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(stats.paymentSummary.collected)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-semibold text-yellow-600">
                  {formatCurrency(stats.paymentSummary.pending)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Overdue</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(stats.paymentSummary.overdue)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
