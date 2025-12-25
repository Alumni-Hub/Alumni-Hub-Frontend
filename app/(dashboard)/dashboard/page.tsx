"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { batchmateService } from "@/lib/api/services/batchmate.service"
import { ENGINEERING_FIELDS, type Batchmate } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Globe, Building2, TrendingUp, ChevronRight, MoreHorizontal, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function DashboardPage() {
  const { user } = useAuth()
  const [batchmates, setBatchmates] = useState<Batchmate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch batchmates from API
  useEffect(() => {
    const fetchBatchmates = async () => {
      try {
        setIsLoading(true)
        const data = await batchmateService.getAll()
        setBatchmates(data)
      } catch (error) {
        console.error("Error fetching batchmates:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBatchmates()
  }, [])

  // Filter batchmates based on user role
  const accessibleBatchmates =
    user?.role === "super_admin" ? batchmates : batchmates.filter((b) => b.field === user?.assignedField)

  // Calculate stats
  const totalAlumni = accessibleBatchmates.length
  const countriesCount = new Set(accessibleBatchmates.map((b) => b.country).filter(Boolean)).size
  const workplacesCount = new Set(accessibleBatchmates.map((b) => b.workingPlace).filter(Boolean)).size

  // Get active fields count (fields that have at least one batchmate)
  const activeFieldsCount = new Set(batchmates.map((b) => b.field)).size

  const fieldStats = ENGINEERING_FIELDS.map((field) => ({
    field,
    count: batchmates.filter((b) => b.field === field).length,
  })).filter(stat => stat.count > 0) // Only show fields with data

  const recentBatchmates = accessibleBatchmates
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Calculate attendance statistics
  const attendanceStats = {
    total: accessibleBatchmates.length,
    present: accessibleBatchmates.filter(b => b.attendance === "Present").length,
    absent: accessibleBatchmates.filter(b => b.attendance === "Absent").length,
    notMarked: accessibleBatchmates.filter(b => !b.attendance).length,
  }

  const stats = [
    {
      title: "Total Alumni",
      value: isLoading ? "..." : totalAlumni,
      description: user?.role === "super_admin" ? "Across all fields" : `In ${user?.assignedField}`,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Fields",
      value: isLoading ? "..." : (user?.role === "super_admin" ? activeFieldsCount : 1),
      description: "Engineering branches",
      icon: UserCheck,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Countries",
      value: isLoading ? "..." : countriesCount,
      description: "Global presence",
      icon: Globe,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Workplaces",
      value: isLoading ? "..." : workplacesCount,
      description: "Organizations",
      icon: Building2,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance Statistics */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Attendance Overview</CardTitle>
          <CardDescription>Current attendance status of batchmates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : attendanceStats.total}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Present</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{isLoading ? "..." : attendanceStats.present}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <X className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Absent</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{isLoading ? "..." : attendanceStats.absent}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <MoreHorizontal className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Not Marked</p>
                <p className="text-2xl font-bold text-muted-foreground">{isLoading ? "..." : attendanceStats.notMarked}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Field Distribution */}
        {user?.role === "super_admin" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Field Distribution</CardTitle>
              <CardDescription>Alumni count per engineering field</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Loading field distribution...</p>
                ) : fieldStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
                ) : (
                  fieldStats.map((stat) => (
                    <div key={stat.field} className="flex items-center gap-3">
                      <div className="w-32 text-sm text-muted-foreground truncate">{stat.field}</div>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(stat.count / Math.max(...fieldStats.map((s) => s.count))) * 100}%` }}
                        />
                      </div>
                      <div className="w-8 text-sm font-medium text-right">{stat.count}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Alumni */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Alumni</CardTitle>
              <CardDescription>Latest additions to the network</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/batchmates" className="text-primary">
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading recent alumni...</p>
              ) : recentBatchmates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No alumni added yet</p>
              ) : (
                recentBatchmates.map((batchmate) => (
                  <div key={batchmate.id} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{batchmate.callingName?.charAt(0) || '?'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{batchmate.fullName || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {batchmate.field || 'N/A'} • {batchmate.country || "Unknown location"}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">{batchmate.workingPlace || "N/A"}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className={`bg-card border-border ${user?.role !== "super_admin" ? "lg:col-span-1" : ""}`}>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                className="justify-start h-auto py-4 bg-secondary/30 border-border hover:bg-secondary/50"
                asChild
              >
                <Link href="/dashboard/batchmates/new">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Add Batchmate</p>
                      <p className="text-xs text-muted-foreground">Create new record</p>
                    </div>
                  </div>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-4 bg-secondary/30 border-border hover:bg-secondary/50"
                asChild
              >
                <Link href="/dashboard/search">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <TrendingUp className="h-4 w-4 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Global Search</p>
                      <p className="text-xs text-muted-foreground">Find alumni</p>
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
