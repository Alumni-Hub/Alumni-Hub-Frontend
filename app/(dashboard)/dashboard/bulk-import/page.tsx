import { BulkImportForm } from "@/components/dashboard/bulk-import-form"

export default function BulkImportPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bulk Import</h1>
        <p className="text-muted-foreground mt-2">
          Import multiple batchmates at once from an Excel file
        </p>
      </div>
      <BulkImportForm />
    </div>
  )
}
