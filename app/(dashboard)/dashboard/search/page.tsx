"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ENGINEERING_FIELDS } from "@/lib/types"
import { batchmateService } from "@/lib/api/services/batchmate.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, X, Globe, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function GlobalSearchPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [filters, setFilters] = useState({
    callingName: "",
    fullName: "",
    nickName: "",
    country: "all",
    workingPlace: "",
    whatsappMobile: "",
    mobile: "",
    field: "all",
    attendance: "all",
    phoneConfirmation: "all",
  })

  const [searchResults, setSearchResults] = useState<any[]>([])
  const [availableCountries, setAvailableCountries] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingCountries, setIsLoadingCountries] = useState(true)

  // Load all batchmates to get available countries
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setIsLoadingCountries(true)
        const allBatchmates = await batchmateService.getAll(
          user?.role !== "super_admin" && user?.assignedField
            ? { field: user.assignedField }
            : undefined
        )
        const countries = [...new Set(
          allBatchmates
            .map((b: any) => b.attributes?.country)
            .filter(Boolean)
        )].sort()
        setAvailableCountries(countries as string[])
      } catch (error) {
        console.error("Error loading countries:", error)
      } finally {
        setIsLoadingCountries(false)
      }
    }

    loadCountries()
  }, [user])

  const handleSearch = async () => {
    try {
      setIsSearching(true)
      setHasSearched(true)

      const searchFilters: any = {}
      
      if (filters.callingName) searchFilters.callingName = filters.callingName
      if (filters.fullName) searchFilters.fullName = filters.fullName
      if (filters.nickName) searchFilters.nickName = filters.nickName
      if (filters.country !== "all") searchFilters.country = filters.country
      if (filters.workingPlace) searchFilters.workingPlace = filters.workingPlace
      if (filters.whatsappMobile) searchFilters.whatsappMobile = filters.whatsappMobile
      if (filters.mobile) searchFilters.mobile = filters.mobile
      
      // Add field filter
      if (user?.role === "super_admin") {
        if (filters.field !== "all") searchFilters.field = filters.field
      } else if (user?.assignedField) {
        searchFilters.field = user.assignedField
      }

      // Add attendance filter
      if (filters.attendance !== "all") searchFilters.attendance = filters.attendance

      // Add phone confirmation filter
      if (filters.phoneConfirmation !== "all") searchFilters.phoneConfirmation = filters.phoneConfirmation

      const results = await batchmateService.getAll(searchFilters)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching:", error)
      toast({
        title: "Error",
        description: "Failed to search. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      callingName: "",
      fullName: "",
      nickName: "",
      country: "all",
      workingPlace: "",
      whatsappMobile: "",
      mobile: "",
      field: "all",
      attendance: "all",
      phoneConfirmation: "all",
    })
    setHasSearched(false)
    setSearchResults([])
  }

  const hasFilters = Object.entries(filters).some(([key, value]) =>
    ["country", "field", "attendance", "phoneConfirmation"].includes(key) ? value !== "all" : value !== "",
  )

  const canEditBatchmate = (batchmateField: string) => {
    return user?.role === "super_admin" || user?.assignedField === batchmateField
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Global Search</h2>
        <p className="text-muted-foreground">Search across all accessible alumni records with multiple filters</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Search Filters
            </CardTitle>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Calling Name</label>
              <Input
                placeholder="Search calling name"
                value={filters.callingName}
                onChange={(e) => setFilters((prev) => ({ ...prev, callingName: e.target.value }))}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Full Name (partial)</label>
              <Input
                placeholder="Search full name"
                value={filters.fullName}
                onChange={(e) => setFilters((prev) => ({ ...prev, fullName: e.target.value }))}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Nick Name</label>
              <Input
                placeholder="Search nick name"
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
                placeholder="Search workplace"
                value={filters.workingPlace}
                onChange={(e) => setFilters((prev) => ({ ...prev, workingPlace: e.target.value }))}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">WhatsApp Mobile</label>
              <Input
                placeholder="Search WhatsApp number"
                value={filters.whatsappMobile}
                onChange={(e) => setFilters((prev) => ({ ...prev, whatsappMobile: e.target.value }))}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Phone/Mobile</label>
              <Input
                placeholder="Search phone number"
                value={filters.mobile}
                onChange={(e) => setFilters((prev) => ({ ...prev, mobile: e.target.value }))}
                className="bg-input border-border"
              />
            </div>
            {user?.role === "super_admin" && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Field</label>
                <Select
                  value={filters.field}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, field: value }))}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="All fields" />
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
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Phone Confirmation</label>
              <Select
                value={filters.phoneConfirmation}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, phoneConfirmation: value }))}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Attendance</label>
              <Select
                value={filters.attendance}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, attendance: value }))}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSearch} disabled={isSearching} className="bg-primary hover:bg-primary/90">
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>Found {searchResults.length} matching records</CardDescription>
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
                    {searchResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
                          <p className="text-muted-foreground">No results found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      searchResults.slice(0, 50).map((batchmate) => {
                        return (
                          <TableRow key={batchmate.id} className="hover:bg-secondary/20">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <span className="text-sm font-medium text-primary">
                                    {batchmate.callingName?.charAt(0) || '?'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{batchmate.fullName || 'N/A'}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {batchmate.callingName}
                                    {batchmate.nickName && ` • "${batchmate.nickName}"`}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{batchmate.email || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{batchmate.whatsappMobile || 'N/A'}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                                {batchmate.field || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{batchmate.country || "—"}</TableCell>
                            <TableCell className="text-muted-foreground">{batchmate.workingPlace || "—"}</TableCell>
                            <TableCell>
                              {batchmate.phoneConfirmation ? (
                                <Badge 
                                  variant="outline" 
                                  className={batchmate.phoneConfirmation === "Yes" 
                                    ? "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5" 
                                    : "border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/5"
                                  }
                                >
                                  {batchmate.phoneConfirmation}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {batchmate.attendance ? (
                                <Badge 
                                  variant="outline" 
                                  className={batchmate.attendance === "Present" 
                                    ? "border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/5" 
                                    : "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5"
                                  }
                                >
                                  {batchmate.attendance}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {canEditBatchmate(batchmate.field) && (
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/dashboard/batchmates/${batchmate.documentId || batchmate.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {searchResults.length > 50 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Showing 50 of {searchResults.length} records. Refine your search for more specific results.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!hasSearched && (
        <Card className="bg-card border-border">
          <CardContent className="py-16">
            <div className="text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">Start Searching</h3>
              <p className="text-muted-foreground mt-1">
                Use the filters above to search for alumni across{" "}
                {user?.role === "super_admin" ? "all fields" : `the ${user?.assignedField} field`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
