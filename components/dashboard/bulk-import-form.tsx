"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { batchmateService } from "@/lib/api/services/batchmate.service"
import { ENGINEERING_FIELDS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

export function BulkImportForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [selectedField, setSelectedField] = useState<string>("")
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    console.log("File selected:", selectedFile)
    
    if (selectedFile) {
      console.log("File name:", selectedFile.name)
      console.log("File size:", selectedFile.size, "bytes")
      console.log("File type:", selectedFile.type)
      
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast.error("Please select a valid Excel file (.xlsx or .xls)")
        return
      }
      
      setFile(selectedFile)
      setImportResult(null)
      toast.success(`File loaded: ${selectedFile.name}`)
    } else {
      console.log("No file selected")
    }
  }

  const mapExcelRowToBatchmate = (row: any, field: string) => {
    // Log the row to see what columns we actually have
    console.log("Excel row data:", row)
    
    const fullName = (row["Full Name"] || row["Name"] || row["Calling Name"])?.toString().trim() || ""
    const email = (row["E Mail"] || row["Email"] || row["Gmail"] || row["E-Mail"])?.toString().trim()
    
    // Generate a valid placeholder email if none provided
    // Remove special characters, replace spaces with dots, remove consecutive dots
    const sanitizedName = fullName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '.') // Replace spaces with dots
      .replace(/\.+/g, '.') // Replace multiple dots with single dot
      .replace(/^\.|\.$/g, '') // Remove leading/trailing dots
    
    const finalEmail = email || `${sanitizedName || 'user'}@noemail.com`
    
    return {
      callingName: (row["Calling Name"] || row["Name"] || row["Full Name"])?.toString().trim() || "",
      fullName: fullName,
      nickName: (row["Nick Name"] || row["Nick"])?.toString().trim() || "",
      address: (row["Address (Residence)"] || row["Address"])?.toString().trim() || "",
      country: (row["Country (Residence)"] || row["Country"])?.toString().trim() || "",
      workingPlace: (row["Working Place"] || row["Work Place"])?.toString().trim() || "",
      mobile: (row["Phone/Mobile"] || row["Mobile"] || row["Phone"])?.toString().trim() || "",
      whatsappMobile: (row["Mobile (Whatsapp)"] || row["Mobile (WhatsApp)"] || row["Whatsapp"] || row["WhatsApp"] || row["Mobile(WhatsApp)"])?.toString().trim() || "",
      email: finalEmail,
      field: field
    }
  }

  const validateBatchmate = (batchmate: any): string | null => {
    // Only validate if Full Name exists
    if (!batchmate.fullName || batchmate.fullName.trim() === "") {
      return "Full Name is required"
    }
    
    // No other validation - let backend handle it
    return null
  }

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file")
      return
    }

    if (!selectedField) {
      toast.error("Please select an engineering field")
      return
    }

    setIsImporting(true)
    setProgress(0)
    
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      
      console.log("Available sheets:", workbook.SheetNames)
      
      // Map engineering field to sheet name (e.g., "Civil Engineering" -> "Civil")
      const sheetNameMapping: Record<string, string> = {
        "Chemical Engineering": "Chemical",
        "Civil Engineering": "Civil",
        "Computer Engineering": "Computer",
        "Electrical Engineering": "Electrical",
        "Electronics Engineering": "Electronics",
        "Material Engineering": "Material",
        "Mechanical Engineering": "Mechanical",
        "Mining Engineering": "Mining",
        "Textile Engineering": "Textile",
        "Biomedical Engineering": "Biomedical",
        "Industrial Engineering": "Industrial",
        "Environmental Engineering": "Environmental",
        "Aerospace Engineering": "Aerospace",
        "Software Engineering": "Software",
        "Data Science": "Data",
        "Artificial Intelligence": "AI"
      }
      
      // Find the sheet name for the selected field
      const expectedSheetName = sheetNameMapping[selectedField] || selectedField.split(' ')[0]
      let sheetName = workbook.SheetNames.find(
        name => name.toLowerCase() === expectedSheetName.toLowerCase() || 
                name.toLowerCase().includes(expectedSheetName.toLowerCase())
      )
      
      // If no matching sheet, try to use the first sheet
      if (!sheetName) {
        sheetName = workbook.SheetNames[0]
        toast.info(`Using sheet: ${sheetName} for ${selectedField}`)
      } else {
        toast.info(`Found matching sheet: ${sheetName}`)
      }

      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      console.log(`Found ${jsonData.length} rows in sheet ${sheetName}`)
      console.log("First row sample:", jsonData[0])

      if (jsonData.length === 0) {
        toast.error("No data found in the Excel sheet")
        setIsImporting(false)
        return
      }

      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: []
      }

      // Process each row
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i]
        const batchmate = mapExcelRowToBatchmate(row, selectedField)
        
        console.log(`Processing row ${i + 2}:`, batchmate)
        
        // Skip empty rows (no full name)
        if (!batchmate.fullName || batchmate.fullName.trim() === "") {
          console.log(`Skipping empty row ${i + 2}`)
          continue
        }
        
        // Validate
        const validationError = validateBatchmate(batchmate)
        if (validationError) {
          result.failed++
          result.errors.push(`Row ${i + 2}: ${validationError}`)
          continue
        }

        // Try to import
        try {
          await batchmateService.create(batchmate)
          result.success++
          console.log(`✓ Successfully imported: ${batchmate.fullName}`)
        } catch (error: any) {
          const errorMsg = error.response?.data?.error?.message || error.message || "Unknown error"
          
          // Skip duplicates silently or with just a warning
          if (errorMsg.includes("unique") || errorMsg.includes("duplicate") || errorMsg.includes("already exists")) {
            console.log(`Skipping duplicate: ${batchmate.fullName}`)
            result.success++ // Count as success since data already exists
          } else {
            result.failed++
            console.error(`✗ Failed to import ${batchmate.fullName}:`, errorMsg)
            result.errors.push(`Row ${i + 2} (${batchmate.fullName}): ${errorMsg}`)
          }
        }

        // Update progress
        setProgress(Math.round(((i + 1) / jsonData.length) * 100))
      }

      setImportResult(result)

      if (result.success > 0) {
        toast.success(`Successfully imported ${result.success} batchmates`)
      }
      
      if (result.failed > 0) {
        toast.error(`Failed to import ${result.failed} entries`)
      }

    } catch (error: any) {
      console.error("Import error:", error)
      toast.error("Failed to process Excel file: " + error.message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Import from Excel
          </CardTitle>
          <CardDescription>
            Import multiple batchmates from an Excel file. Each engineering field should have its own sheet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required column:</strong> Full Name
              <br />
              <strong>Optional columns:</strong> Calling Name, Nick Name, Address (Residence), Country (Residence), Working Place, Phone/Mobile, Mobile (Whatsapp), E Mail/Gmail
              <br />
              <em className="text-xs">Note: Email will be validated if provided</em>
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="field">Engineering Field *</Label>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger>
                  <SelectValue placeholder="Select engineering field" />
                </SelectTrigger>
                <SelectContent>
                  {ENGINEERING_FIELDS.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Excel File *</Label>
              <div className="space-y-2">
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={isImporting}
                  className="cursor-pointer"
                />
                {file && (
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFile(null)
                        const input = document.getElementById('file') as HTMLInputElement
                        if (input) input.value = ''
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {isImporting && (
              <div className="space-y-2">
                <Label>Import Progress</Label>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {progress}% completed
                </p>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!file || !selectedField || isImporting}
              className="w-full"
              size="lg"
            >
              {isImporting ? (
                <>Processing...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Batchmates
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <p className="text-2xl font-bold">{importResult.success}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 border rounded-lg bg-red-50 dark:bg-red-950">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">{importResult.failed}</p>
                </div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <Label>Errors:</Label>
                <div className="max-h-60 overflow-y-auto space-y-1 p-4 bg-muted rounded-lg">
                  {importResult.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setImportResult(null)
                  setProgress(0)
                }}
                className="flex-1"
              >
                Import Another File
              </Button>
              <Button
                onClick={() => router.push("/dashboard/batchmates")}
                className="flex-1"
              >
                View All Batchmates
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
