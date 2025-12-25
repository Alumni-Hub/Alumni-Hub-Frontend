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
        <TabsList className="bg-secondary/50 p-1 h-auto flex flex-wrap gap-1 w-full justify-start">
          {availableFields.map((field) => {
            const fieldCount = batchmates.filter((b) => b.field === field).length
            return (
              <TabsTrigger
                key={field}
                value={field}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 flex-shrink-0"
              >
                {field}
                <Badge variant="outline" className="ml-2 h-5 px-1.5 text-xs border-current">
                  {isLoading ? "..." : fieldCount}
                </Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>

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
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="py-16 text-center">
                      <p className="text-muted-foreground">Loading batchmates...</p>
                    </div>
                  ) : filteredBatchmates.length === 0 ? (
                    <div className="py-16 text-center">
                      <p className="text-muted-foreground">No batchmates found matching filters</p>
                    </div>
                  ) : (
                    filteredBatchmates.map((batchmate) => (
                      <Card key={batchmate.id} className="bg-secondary/20 border-border hover:bg-secondary/30 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-lg font-medium text-primary">
                                  {batchmate.callingName?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-foreground">{batchmate.fullName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {batchmate.callingName}
                                  {batchmate.nickName && ` • "${batchmate.nickName}"`}
                                </p>
                              </div>
                            </div>
                            {canEdit && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/batchmates/${batchmate.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                              <p className="text-sm text-foreground">{batchmate.email || "—"}</p>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">WhatsApp</label>
                              <p className="text-sm text-foreground">{batchmate.whatsappMobile || "—"}</p>
                            </div>

                            {batchmate.mobile && (
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mobile</label>
                                <p className="text-sm text-foreground">{batchmate.mobile}</p>
                              </div>
                            )}

                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Country</label>
                              <p className="text-sm text-foreground">{batchmate.country || "—"}</p>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Working Place</label>
                              <p className="text-sm text-foreground">{batchmate.workingPlace || "—"}</p>
                            </div>

                            {batchmate.address && (
                              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</label>
                                <p className="text-sm text-foreground">{batchmate.address}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <div className="mt-6 text-sm text-muted-foreground">
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
