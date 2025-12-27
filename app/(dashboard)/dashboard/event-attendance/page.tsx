"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, Users, QrCode, Hand, Calendar, TrendingUp } from "lucide-react"
import { eventService, Event } from "@/lib/api/services/event.service"
import { eventAttendanceService, EventAttendance } from "@/lib/api/services/event-attendance.service"
import { batchmateService } from "@/lib/api/services/batchmate.service"
import { useToast } from "@/hooks/use-toast"

export default function EventAttendancePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [attendances, setAttendances] = useState<EventAttendance[]>([])
  const [batchmates, setBatchmates] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [statistics, setStatistics] = useState<any>(null)

  useEffect(() => {
    loadEvents()
    loadBatchmates()
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      loadEventAttendances()
      loadStatistics()
    }
  }, [selectedEventId])

  const loadEvents = async () => {
    try {
      const data = await eventService.getAll()
      setEvents(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      })
    }
  }

  const loadBatchmates = async () => {
    try {
      const data = await batchmateService.getAll()
      setBatchmates(data)
    } catch (error) {
      console.error("Failed to load batchmates:", error)
    }
  }

  const loadEventAttendances = async () => {
    try {
      setLoading(true)
      const data = await eventAttendanceService.getEventAttendances(Number(selectedEventId))
      setAttendances(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load attendances",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const stats = await eventService.getStatistics(Number(selectedEventId))
      setStatistics(stats.statistics)
    } catch (error) {
      console.error("Failed to load statistics:", error)
    }
  }

  const handleMarkAttendance = async (batchmateId: number, status: "Present" | "Absent" | "Pending") => {
    try {
      await eventAttendanceService.markManualAttendance(Number(selectedEventId), batchmateId, status)
      toast({
        title: "Success",
        description: `Attendance marked as ${status}`,
      })
      loadEventAttendances()
      loadStatistics()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      })
    }
  }

  const filteredAttendances = useMemo(() => {
    let result = attendances

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((a) => {
        const batchmateName = a.batchmate?.fullName || a.batchmate?.callingName || ""
        return batchmateName.toLowerCase().includes(term)
      })
    }

    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter)
    }

    if (methodFilter !== "all") {
      result = result.filter((a) => a.attendanceMethod === methodFilter)
    }

    return result
  }, [attendances, searchTerm, statusFilter, methodFilter])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      Present: { variant: "default", className: "bg-green-500" },
      Absent: { variant: "destructive", className: "" },
      Pending: { variant: "secondary", className: "" },
    }
    return <Badge {...(variants[status] || variants.Pending)}>{status}</Badge>
  }

  const getMethodBadge = (method: string) => {
    const variants: Record<string, any> = {
      QR_SCAN: { icon: QrCode, label: "QR Scan", className: "bg-blue-500 text-white" },
      MANUAL: { icon: Hand, label: "Manual", className: "bg-purple-500 text-white" },
      NOT_MARKED: { icon: null, label: "Not Marked", className: "bg-gray-400 text-white" },
    }
    const config = variants[method] || variants.NOT_MARKED
    const Icon = config.icon
    return (
      <Badge className={config.className}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Attendance Tracking</h1>
        <p className="text-muted-foreground">
          Track attendance marked via QR code scans and manual marking
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{statistics.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{statistics.present}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">QR Scanned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{statistics.qrScanned}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Manual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Hand className="h-4 w-4 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">{statistics.manual}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
          <CardDescription>Choose an event to view and manage attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Event</Label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {event.name} - {new Date(event.eventDate).toLocaleDateString()}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedEventId && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="QR_SCAN">QR Scan</SelectItem>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="NOT_MARKED">Not Marked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records ({filteredAttendances.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredAttendances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Marked At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendances.map((attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {attendance.batchmate?.fullName || attendance.batchmate?.callingName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {attendance.batchmate?.mobile}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(attendance.status)}</TableCell>
                        <TableCell>{getMethodBadge(attendance.attendanceMethod)}</TableCell>
                        <TableCell>
                          {attendance.markedAt
                            ? new Date(attendance.markedAt).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={attendance.status}
                            onValueChange={(value) =>
                              handleMarkAttendance(
                                attendance.batchmate?.id,
                                value as "Present" | "Absent" | "Pending"
                              )
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Present">Present</SelectItem>
                              <SelectItem value="Absent">Absent</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
