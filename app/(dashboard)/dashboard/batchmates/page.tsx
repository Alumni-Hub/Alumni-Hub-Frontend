"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { batchmateService } from "@/lib/api/services/batchmate.service"
import { ENGINEERING_FIELDS, type Batchmate } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter, X, Users, UserCheck } from "lucide-react"
import { toast } from "sonner"

export default function BatchmatesPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [fieldFilter, setFieldFilter] = useState<string>("all")
  const [countryFilter, setCountryFilter] = useState<string>("all")
  const [phoneConfirmationFilter, setPhoneConfirmationFilter] = useState<string>("all")
  const [attendanceFilter, setAttendanceFilter] = useState<string>("all")
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
        toast.error("Failed to load batchmates")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBatchmates()
  }, [])

  // Handle attendance update
  const handleAttendanceChange = async (batchmateId: string, attendance: "Present" | "Absent") => {
    try {
      await batchmateService.update(batchmateId, { attendance })
      setBatchmates(prevBatchmates =>
        prevBatchmates.map(b =>
          (b.documentId || b.id) === batchmateId ? { ...b, attendance } : b
        )
      )
      toast.success(`Attendance marked as ${attendance}`)
    } catch (error) {
      console.error("Error updating attendance:", error)
      toast.error("Failed to update attendance")
    }
  }

  // Handle phone confirmation update
  const handlePhoneConfirmationChange = async (batchmateId: string, phoneConfirmation: "Yes" | "No") => {
    try {
      await batchmateService.update(batchmateId, { phoneConfirmation })
      setBatchmates(prevBatchmates =>
        prevBatchmates.map(b =>
          (b.documentId || b.id) === batchmateId ? { ...b, phoneConfirmation } : b
        )
      )
      toast.success(`Phone confirmation marked as ${phoneConfirmation}`)
    } catch (error) {
      console.error("Error updating phone confirmation:", error)
      toast.error("Failed to update phone confirmation")
    }
  }

  // Filter batchmates based on user role and filters
  const filteredBatchmates = useMemo(() => {
    let result =
      user?.role === "super_admin" ? batchmates : batchmates.filter((b) => b.field === user?.assignedField)

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (b) =>
          b.callingName.toLowerCase().includes(term) ||
          b.fullName.toLowerCase().includes(term) ||
          b.email.toLowerCase().includes(term) ||
          (b.nickName && b.nickName.toLowerCase().includes(term)),
      )
    }

    if (fieldFilter !== "all") {
      result = result.filter((b) => b.field === fieldFilter)
    }

    if (countryFilter !== "all") {
      result = result.filter((b) => b.country === countryFilter)
    }

    if (phoneConfirmationFilter !== "all") {
      result = result.filter((b) => b.phoneConfirmation === phoneConfirmationFilter)
    }

    if (attendanceFilter !== "all") {
      result = result.filter((b) => b.attendance === attendanceFilter)
    }

    // Sort by phone confirmation: "Yes" at the top
    result.sort((a, b) => {
      if (a.phoneConfirmation === "Yes" && b.phoneConfirmation !== "Yes") return -1
      if (a.phoneConfirmation !== "Yes" && b.phoneConfirmation === "Yes") return 1
      return 0
    })

    return result
  }, [user, batchmates, searchTerm, fieldFilter, countryFilter, phoneConfirmationFilter, attendanceFilter])

  const availableCountries = useMemo(() => {
    return [...new Set(batchmates.map((b) => b.country).filter(Boolean))].sort() as string[]
  }, [batchmates])

  const clearFilters = () => {
    setSearchTerm("")
    setFieldFilter("all")
    setCountryFilter("all")
    setPhoneConfirmationFilter("all")
    setAttendanceFilter("all")
  }

  const hasFilters = searchTerm || fieldFilter !== "all" || countryFilter !== "all" || phoneConfirmationFilter !== "all" || attendanceFilter !== "all"

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const stats = {
      total: filteredBatchmates.length,
      phoneConfirmedYes: filteredBatchmates.filter(b => b.phoneConfirmation === "Yes").length,
      phoneConfirmedNo: filteredBatchmates.filter(b => b.phoneConfirmation === "No").length,
      phoneNotMarked: filteredBatchmates.filter(b => !b.phoneConfirmation).length,
      present: filteredBatchmates.filter(b => b.attendance === "Present").length,
      absent: filteredBatchmates.filter(b => b.attendance === "Absent").length,
      notMarked: filteredBatchmates.filter(b => !b.attendance).length,
    }
    return stats
  }, [filteredBatchmates])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Batchmates</h2>
          <p className="text-muted-foreground">
            Manage alumni records {user?.role !== "super_admin" && `for ${user?.assignedField} field`}
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/batchmates/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Batchmate
          </Link>
        </Button>
      </div>

      {/* Attendance Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{attendanceStats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone: Yes</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attendanceStats.phoneConfirmedYes}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone: No</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{attendanceStats.phoneConfirmedNo}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <X className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Not Called</p>
                <p className="text-2xl font-bold text-muted-foreground">{attendanceStats.phoneNotMarked}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceStats.present}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceStats.absent}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <X className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Not Marked</p>
                <p className="text-2xl font-bold text-muted-foreground">{attendanceStats.notMarked}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or nickname..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {user?.role === "super_admin" && (
                <Select value={fieldFilter} onValueChange={setFieldFilter}>
                  <SelectTrigger className="w-[160px] bg-input border-border">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Fields</SelectItem>
                    {ENGINEERING_FIELDS.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-[160px] bg-input border-border">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-60">
                  <SelectItem value="all">All Countries</SelectItem>
                  {availableCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={phoneConfirmationFilter} onValueChange={setPhoneConfirmationFilter}>
                <SelectTrigger className="w-[160px] bg-input border-border">
                  <SelectValue placeholder="Phone Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Phone</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>

              <Select value={attendanceFilter} onValueChange={setAttendanceFilter}>
                <SelectTrigger className="w-[160px] bg-input border-border">
                  <SelectValue placeholder="Attendance" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Attendance</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Field</TableHead>
                    <TableHead className="font-semibold">Country</TableHead>
                    <TableHead className="font-semibold">Workplace</TableHead>
                    <TableHead className="font-semibold">Phone Confirm</TableHead>
                    <TableHead className="font-semibold">Attendance</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center">
                        <p className="text-muted-foreground">Loading batchmates...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredBatchmates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center">
                        <p className="text-muted-foreground">No batchmates found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBatchmates.map((batchmate) => (
                      <TableRow key={batchmate.id} className="hover:bg-secondary/20">
                        <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-sm font-medium text-primary">
                                  {batchmate.callingName?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{batchmate.fullName}</p>
                              <p className="text-xs text-muted-foreground">
                                {batchmate.callingName}
                                {batchmate.nickName && ` • "${batchmate.nickName}"`}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{batchmate.email}</p>
                          <p className="text-xs text-muted-foreground">{batchmate.whatsappMobile}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                            {batchmate.field}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{batchmate.country || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{batchmate.workingPlace || "—"}</TableCell>
                        <TableCell>
                          <Select
                            value={batchmate.phoneConfirmation || ""}
                            onValueChange={(value: "Yes" | "No") => 
                              handlePhoneConfirmationChange(batchmate.documentId || batchmate.id, value)
                            }
                          >
                            <SelectTrigger className="w-[110px] bg-input border-border">
                              <SelectValue placeholder="Confirm..." />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              <SelectItem value="Yes">
                                <span className="text-blue-600 dark:text-blue-400">Yes</span>
                              </SelectItem>
                              <SelectItem value="No">
                                <span className="text-orange-600 dark:text-orange-400">No</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={batchmate.attendance || ""}
                            onValueChange={(value: "Present" | "Absent") => 
                              handleAttendanceChange(batchmate.documentId || batchmate.id, value)
                            }
                          >
                            <SelectTrigger className="w-[110px] bg-input border-border">
                              <SelectValue placeholder="Mark..." />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              <SelectItem value="Present">
                                <span className="text-green-600 dark:text-green-400">Present</span>
                              </SelectItem>
                              <SelectItem value="Absent">
                                <span className="text-red-600 dark:text-red-400">Absent</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/dashboard/batchmates/${batchmate.documentId || batchmate.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/dashboard/batchmates/${batchmate.documentId || batchmate.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {filteredBatchmates.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Showing all {filteredBatchmates.length} records.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
