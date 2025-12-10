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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter, X } from "lucide-react"
import { toast } from "sonner"

export default function BatchmatesPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [fieldFilter, setFieldFilter] = useState<string>("all")
  const [countryFilter, setCountryFilter] = useState<string>("all")
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

    return result
  }, [user, batchmates, searchTerm, fieldFilter, countryFilter])

  const availableCountries = useMemo(() => {
    return [...new Set(batchmates.map((b) => b.country).filter(Boolean))].sort() as string[]
  }, [batchmates])

  const clearFilters = () => {
    setSearchTerm("")
    setFieldFilter("all")
    setCountryFilter("all")
  }

  const hasFilters = searchTerm || fieldFilter !== "all" || countryFilter !== "all"

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
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <p className="text-muted-foreground">Loading batchmates...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredBatchmates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
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
