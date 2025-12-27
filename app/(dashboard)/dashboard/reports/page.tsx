"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { batchmateService } from "@/lib/api/services/batchmate.service"
import { ENGINEERING_FIELDS, type Batchmate } from "@/lib/types"
import { exportToExcel, exportToPDF, exportFieldwiseNameLists, exportRaffleCutSheet } from "@/lib/export-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileSpreadsheet, FileText, Eye, Filter, BarChart3 } from "lucide-react"
import { toast as sonnerToast } from "sonner"

type ReportType = "field" | "country"

export default function ReportsPage() {
  const { user } = useAuth()
  const [batchmates, setBatchmates] = useState<Batchmate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reportType, setReportType] = useState<ReportType>("field")
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>("all")
  const [showPreview, setShowPreview] = useState(false)

  // Fetch batchmates from API
  useEffect(() => {
    const fetchBatchmates = async () => {
      try {
        setIsLoading(true)
        const data = await batchmateService.getAll()
        setBatchmates(data)
      } catch (error) {
        console.error("Error fetching batchmates:", error)
        sonnerToast.error("Failed to load data for reports")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBatchmates()
  }, [])

  const accessibleFields =
    user?.role === "super_admin" ? ENGINEERING_FIELDS : user?.assignedField ? [user.assignedField] : []

  const accessibleBatchmates =
    user?.role === "super_admin" ? batchmates : batchmates.filter((b) => b.field === user?.assignedField)

  const availableCountries = useMemo(() => {
    return [...new Set(accessibleBatchmates.map((b) => b.country).filter(Boolean))].sort() as string[]
  }, [accessibleBatchmates])

  const reportData = useMemo(() => {
    let result: Batchmate[] = []

    if (reportType === "field") {
      if (selectedFields.length === 0) {
        result = accessibleBatchmates
      } else {
        result = accessibleBatchmates.filter((b) => selectedFields.includes(b.field))
      }
    } else {
      if (selectedCountry === "all") {
        result = accessibleBatchmates
      } else {
        result = accessibleBatchmates.filter((b) => b.country === selectedCountry)
      }
    }

    return result
  }, [reportType, selectedFields, selectedCountry, accessibleBatchmates])

  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]))
  }

  const handleExport = (format: "excel" | "pdf") => {
    if (reportData.length === 0) {
      sonnerToast.error("No data to export");
      return;
    }

    sonnerToast.info(`Generating ${format.toUpperCase()} report...`, {
      description: `Processing ${reportData.length} records...`,
    });

    // Generate filename based on report type
    let filename = '93-94-batch-report';
    if (reportType === 'field') {
      if (selectedFields.length > 0) {
        filename = `${filename}-${selectedFields.join('-').toLowerCase().replace(/\s+/g, '-')}`;
      }
    } else {
      if (selectedCountry !== 'all') {
        filename = `${filename}-${selectedCountry.toLowerCase().replace(/\s+/g, '-')}`;
      }
    }

    // Export based on format
    let success = false;
    if (format === 'excel') {
      success = exportToExcel(reportData, filename);
    } else {
      success = exportToPDF(reportData, filename);
    }

    if (success) {
      sonnerToast.success("Export Complete", {
        description: `Report has been downloaded successfully as ${format.toUpperCase()}.`,
      });
    } else {
      sonnerToast.error("Export Failed", {
        description: "There was an error generating the report. Please try again.",
      });
    }
  };

  const handleExportAll = (format: "excel" | "pdf") => {
    const allData = accessibleBatchmates;
    if (allData.length === 0) {
      sonnerToast.error("No data to export");
      return;
    }

    sonnerToast.info(`Generating ${format.toUpperCase()} report...`, {
      description: `Processing ${allData.length} records...`,
    });

    const filename = '93-94-batch-report-all';
    const success = format === 'excel' ? exportToExcel(allData, filename) : exportToPDF(allData, filename);

    if (success) {
      sonnerToast.success("Export Complete", {
        description: `Report has been downloaded successfully as ${format.toUpperCase()}.`,
      });
    } else {
      sonnerToast.error("Export Failed", {
        description: "There was an error generating the report. Please try again.",
      });
    }
  };

  const handlePreview = () => {
    setShowPreview(true)
  }

  const handleFieldwiseExport = async () => {
    sonnerToast.info("Generating field-wise export...", {
      description: "Creating separate sheets for each field...",
    });

    const success = await exportFieldwiseNameLists();

    if (success) {
      sonnerToast.success("Export Complete", {
        description: "Field-wise name lists have been downloaded successfully.",
      });
    } else {
      sonnerToast.error("Export Failed", {
        description: "There was an error generating the export. Please try again.",
      });
    }
  };

  const handleRaffleCutSheetExport = async () => {
    sonnerToast.info("Generating raffle cut sheet...", {
      description: "Creating printable name list with borders...",
    });

    const success = await exportRaffleCutSheet();

    if (success) {
      sonnerToast.success("Export Complete", {
        description: "Raffle cut sheet has been downloaded successfully.",
      });
    } else {
      sonnerToast.error("Export Failed", {
        description: "There was an error generating the export. Please try again.",
      });
    }
  };

  // Stats - only show fields that have data
  const fieldStats = accessibleFields
    .map((field) => ({
      field,
      count: accessibleBatchmates.filter((b) => b.field === field).length,
    }))
    .filter(stat => stat.count > 0)

  const countryStats = availableCountries
    .map((country) => ({
      country,
      count: accessibleBatchmates.filter((b) => b.country === country).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Reports</h2>
        <p className="text-muted-foreground">Generate and export alumni reports by field or country</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Report Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                <TabsList className="w-full bg-secondary/50">
                  <TabsTrigger value="field" className="flex-1">
                    By Field
                  </TabsTrigger>
                  <TabsTrigger value="country" className="flex-1">
                    By Country
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="field" className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">Select one or more fields to include in the report:</p>
                  <div className="space-y-3">
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading fields...</p>
                    ) : (
                      accessibleFields.map((field) => (
                        <div key={field} className="flex items-center gap-2">
                          <Checkbox
                            id={`field-${field}`}
                            checked={selectedFields.includes(field)}
                            onCheckedChange={() => handleFieldToggle(field)}
                          />
                          <Label htmlFor={`field-${field}`} className="flex-1 cursor-pointer">
                            {field}
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            {accessibleBatchmates.filter((b) => b.field === field).length}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                  {selectedFields.length === 0 && (
                    <p className="text-xs text-muted-foreground">No fields selected — all fields will be included</p>
                  )}
                </TabsContent>

                <TabsContent value="country" className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">Select a country for the report:</p>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select country" />
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
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Records in report:</span>
                  <Badge className="bg-primary/10 text-primary">{reportData.length}</Badge>
                </div>

                <Button onClick={handlePreview} variant="outline" className="w-full border-border bg-transparent">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Report
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleExport("excel")}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={reportData.length === 0}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                  <Button
                    onClick={() => handleExport("pdf")}
                    className="bg-primary hover:bg-primary/90"
                    disabled={reportData.length === 0}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>

                {user?.role === "super_admin" && (
                  <>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleExportAll("excel")}
                        variant="outline"
                        className="border-border"
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export All (Excel)
                      </Button>
                      <Button
                        onClick={() => handleExportAll("pdf")}
                        variant="outline"
                        className="border-border"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Export All (PDF)
                      </Button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs font-semibold text-muted-foreground mb-3">SPECIAL EXPORTS</p>
                      <div className="space-y-2">
                        <Button
                          onClick={handleFieldwiseExport}
                          variant="outline"
                          className="w-full border-primary/50 text-primary hover:bg-primary/10"
                        >
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          Field-wise Name Lists
                        </Button>
                        <Button
                          onClick={handleRaffleCutSheetExport}
                          variant="outline"
                          className="w-full border-accent/50 text-accent hover:bg-accent/10"
                        >
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          Raffle Cut Sheet
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Field-wise: Separate sheets per field, alphabetically sorted<br/>
                        Raffle: Bordered cells for printing & cutting
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats & Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Field Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
                  ) : fieldStats.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No data available</p>
                  ) : (
                    fieldStats.map((stat) => (
                      <div key={stat.field} className="flex items-center gap-2">
                        <div className="w-32 text-xs text-muted-foreground truncate">{stat.field}</div>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(stat.count / Math.max(...fieldStats.map((s) => s.count))) * 100}%` }}
                          />
                        </div>
                        <div className="w-6 text-xs font-medium text-right">{stat.count}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-accent" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
                  ) : countryStats.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No data available</p>
                  ) : (
                    countryStats.map((stat) => (
                      <div key={stat.country} className="flex items-center gap-2">
                        <div className="w-32 text-xs text-muted-foreground truncate">{stat.country}</div>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full"
                            style={{ width: `${(stat.count / Math.max(...countryStats.map((s) => s.count))) * 100}%` }}
                          />
                        </div>
                        <div className="w-6 text-xs font-medium text-right">{stat.count}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Preview */}
          {showPreview && (
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Report Preview</CardTitle>
                    <CardDescription>
                      {reportType === "field"
                        ? `Fields: ${selectedFields.length > 0 ? selectedFields.join(", ") : "All"}`
                        : `Country: ${selectedCountry === "all" ? "All" : selectedCountry}`}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                    Close Preview
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto max-h-96">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                          <TableHead className="font-semibold">Full Name</TableHead>
                          <TableHead className="font-semibold">Calling Name</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">WhatsApp</TableHead>
                          <TableHead className="font-semibold">Field</TableHead>
                          <TableHead className="font-semibold">Country</TableHead>
                          <TableHead className="font-semibold">Workplace</TableHead>
                          <TableHead className="font-semibold">Phone Conf.</TableHead>
                          <TableHead className="font-semibold">Attendance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={9} className="h-32 text-center">
                              <p className="text-muted-foreground">Loading report data...</p>
                            </TableCell>
                          </TableRow>
                        ) : reportData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="h-32 text-center">
                              <p className="text-muted-foreground">No data available for preview</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          reportData.slice(0, 20).map((batchmate) => (
                          <TableRow key={batchmate.id} className="hover:bg-secondary/20">
                            <TableCell className="font-medium">{batchmate.fullName}</TableCell>
                            <TableCell>{batchmate.callingName}</TableCell>
                            <TableCell>{batchmate.email}</TableCell>
                            <TableCell>{batchmate.whatsappMobile}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {batchmate.field}
                              </Badge>
                            </TableCell>
                            <TableCell>{batchmate.country || "—"}</TableCell>
                            <TableCell>{batchmate.workingPlace || "—"}</TableCell>
                            <TableCell>{batchmate.phoneConfirmation || "—"}</TableCell>
                            <TableCell>{batchmate.attendance || "—"}</TableCell>
                          </TableRow>
                        ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                {reportData.length > 20 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Showing 20 of {reportData.length} records in preview. Export for full data.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {!showPreview && (
            <Card className="bg-card border-border">
              <CardContent className="py-16">
                <div className="text-center">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Configure Your Report</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                    Select fields or countries from the configuration panel, then preview or export your report
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
