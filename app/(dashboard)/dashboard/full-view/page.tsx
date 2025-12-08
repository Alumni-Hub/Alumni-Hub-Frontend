"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { batchmateService } from "@/lib/api/services/batchmate.service"
import { ENGINEERING_FIELDS, type Batchmate } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, X, Filter } from "lucide-react"
import { toast } from "sonner"

export default function FullViewPage() {
  const { user } = useAuth()
  const [batchmates, setBatchmates] = useState<Batchmate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeField, setActiveField] = useState<string>(
    user?.role === "field_admin" && user.assignedField ? user.assignedField : ENGINEERING_FIELDS[0],
  )

  const [filters, setFilters] = useState({
    callingName: "",
    fullName: "",
    nickName: "",
    country: "all",
    workingPlace: "",
  })

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

  const availableFields =
    user?.role === "super_admin" ? ENGINEERING_FIELDS : user?.assignedField ? [user.assignedField] : []

  const filteredBatchmates = useMemo(() => {
    let result = batchmates.filter((b) => b.field === activeField)

    if (filters.callingName) {
      result = result.filter((b) => b.callingName.toLowerCase().includes(filters.callingName.toLowerCase()))
    }
    if (filters.fullName) {
      result = result.filter((b) => b.fullName.toLowerCase().includes(filters.fullName.toLowerCase()))
    }
    if (filters.nickName) {
      result = result.filter((b) => b.nickName?.toLowerCase().includes(filters.nickName.toLowerCase()))
    }
    if (filters.country !== "all") {
      result = result.filter((b) => b.country === filters.country)
    }
    if (filters.workingPlace) {
      result = result.filter((b) => b.workingPlace?.toLowerCase().includes(filters.workingPlace.toLowerCase()))
    }

    return result
  }, [batchmates, activeField, filters])

  const availableCountries = useMemo(() => {
    const countriesInField = batchmates
      .filter((b) => b.field === activeField)
      .map((b) => b.country)
      .filter(Boolean)
    return [...new Set(countriesInField)].sort() as string[]
  }, [batchmates, activeField])

  const clearFilters = () => {
    setFilters({
      callingName: "",
      fullName: "",
      nickName: "",
      country: "all",
      workingPlace: "",
    })
  }

  const hasFilters = Object.entries(filters).some(([key, value]) =>
    key === "country" ? value !== "all" : value !== "",
  )

  const canEdit = user?.role === "super_admin" || user?.assignedField === activeField

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Full View</h2>
        <p className="text-muted-foreground">Browse alumni by engineering field with advanced filters</p>
      </div>

      {/* Field Tabs */}
      <Tabs value={activeField} onValueChange={setActiveField}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="bg-secondary/50 p-1 h-auto flex-wrap gap-1 w-max min-w-full">
            {availableFields.map((field) => {
              const fieldCount = batchmates.filter((b) => b.field === field).length
              return (
                <TabsTrigger
                  key={field}
                  value={field}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
                >
                  {field}
                  <Badge variant="outline" className="ml-2 h-5 px-1.5 text-xs border-current">
                    {isLoading ? "..." : fieldCount}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {availableFields.map((field) => (
          <TabsContent key={field} value={field} className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-col lg:flex-row gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                  {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="w-fit">
                      <X className="mr-2 h-4 w-4" />
                      Clear filters
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mt-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Calling Name</label>
                    <Input
                      placeholder="Filter by calling name"
                      value={filters.callingName}
                      onChange={(e) => setFilters((prev) => ({ ...prev, callingName: e.target.value }))}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Full Name</label>
                    <Input
                      placeholder="Filter by full name"
                      value={filters.fullName}
                      onChange={(e) => setFilters((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Nick Name</label>
                    <Input
                      placeholder="Filter by nick name"
                      value={filters.nickName}
                      onChange={(e) => setFilters((prev) => ({ ...prev, nickName: e.target.value }))}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Country</label>
                    <Select
                      value={filters.country}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="All countries" />
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
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Working Place</label>
                    <Input
                      placeholder="Filter by workplace"
                      value={filters.workingPlace}
                      onChange={(e) => setFilters((prev) => ({ ...prev, workingPlace: e.target.value }))}
                      className="bg-input border-border"
                    />
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
                          <TableHead className="font-semibold">Country</TableHead>
                          <TableHead className="font-semibold">Workplace</TableHead>
                          {canEdit && <TableHead className="text-right font-semibold">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={canEdit ? 5 : 4} className="h-32 text-center">
                              <p className="text-muted-foreground">Loading batchmates...</p>
                            </TableCell>
                          </TableRow>
                        ) : filteredBatchmates.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={canEdit ? 5 : 4} className="h-32 text-center">
                              <p className="text-muted-foreground">No batchmates found matching filters</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredBatchmates.map((batchmate) => (
                            <TableRow key={batchmate.id} className="hover:bg-secondary/20">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-medium text-primary">
                                      {batchmate.callingName.charAt(0)}
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
                              <TableCell className="text-muted-foreground">{batchmate.country || "—"}</TableCell>
                              <TableCell className="text-muted-foreground">{batchmate.workingPlace || "—"}</TableCell>
                              {canEdit && (
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/dashboard/batchmates/${batchmate.id}/edit`}>
                                      <Edit className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredBatchmates.length} of {batchmates.filter((b) => b.field === activeField).length}{" "}
                  records in {activeField} field
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
