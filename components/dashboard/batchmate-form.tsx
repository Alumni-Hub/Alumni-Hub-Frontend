"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { type Batchmate, ENGINEERING_FIELDS, COUNTRIES } from "@/lib/types"
import { batchmateService } from "@/lib/api/services/batchmate.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload } from "lucide-react"
import { toast as sonnerToast } from "sonner"

interface BatchmateFormProps {
  initialData?: Batchmate
}

export function BatchmateForm({ initialData }: BatchmateFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    callingName: initialData?.callingName || "",
    fullName: initialData?.fullName || "",
    whatsappMobile: initialData?.whatsappMobile || "",
    email: initialData?.email || "",
    nickName: initialData?.nickName || "",
    address: initialData?.address || "",
    country: initialData?.country || "",
    workingPlace: initialData?.workingPlace || "",
    mobile: initialData?.mobile || "",
    field: initialData?.field || (user?.role === "field_admin" ? user.assignedField : ""),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.callingName.trim()) newErrors.callingName = "Calling name is required"
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!formData.whatsappMobile.trim()) newErrors.whatsappMobile = "WhatsApp number is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      if (initialData) {
        // Update existing batchmate
        await batchmateService.update(initialData.id, formData)
        sonnerToast.success("Batchmate updated", {
          description: `${formData.fullName} has been updated successfully.`,
        })
      } else {
        // Create new batchmate
        await batchmateService.create(formData)
        sonnerToast.success("Batchmate created", {
          description: `${formData.fullName} has been added successfully.`,
        })
      }

      router.push("/dashboard/batchmates")
    } catch (error: any) {
      console.error("Error saving batchmate:", error)
      sonnerToast.error("Error", {
        description: error.response?.data?.error?.message || "Failed to save batchmate. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Required fields are marked with *</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="callingName">Calling Name *</Label>
              <Input
                id="callingName"
                value={formData.callingName}
                onChange={(e) => handleChange("callingName", e.target.value)}
                className={`bg-input border-border ${errors.callingName ? "border-destructive" : ""}`}
                placeholder="e.g., John"
              />
              {errors.callingName && <p className="text-sm text-destructive">{errors.callingName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className={`bg-input border-border ${errors.fullName ? "border-destructive" : ""}`}
                placeholder="e.g., John Smith"
              />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickName">Nick Name</Label>
              <Input
                id="nickName"
                value={formData.nickName}
                onChange={(e) => handleChange("nickName", e.target.value)}
                className="bg-input border-border"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field">Engineering Field</Label>
              <Select
                value={formData.field}
                onValueChange={(value) => handleChange("field", value)}
                disabled={user?.role === "field_admin"}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {ENGINEERING_FIELDS.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {user?.role === "field_admin" && (
                <p className="text-xs text-muted-foreground">Field is automatically set to your assigned field</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How to reach this alumni</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`bg-input border-border ${errors.email ? "border-destructive" : ""}`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappMobile">WhatsApp Mobile *</Label>
              <Input
                id="whatsappMobile"
                value={formData.whatsappMobile}
                onChange={(e) => handleChange("whatsappMobile", e.target.value)}
                className={`bg-input border-border ${errors.whatsappMobile ? "border-destructive" : ""}`}
                placeholder="+1 234 567 8900"
              />
              {errors.whatsappMobile && <p className="text-sm text-destructive">{errors.whatsappMobile}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
                className="bg-input border-border"
                placeholder="Optional"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Where this alumni is based</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(value) => handleChange("country", value)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-60">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="bg-input border-border resize-none"
                placeholder="Full address (optional)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Work Information</CardTitle>
            <CardDescription>Professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workingPlace">Working Place</Label>
              <Input
                id="workingPlace"
                value={formData.workingPlace}
                onChange={(e) => handleChange("workingPlace", e.target.value)}
                className="bg-input border-border"
                placeholder="Company or organization name"
              />
            </div>

            {/* Photo upload placeholders */}
            <div className="space-y-2">
              <Label>University Photo</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Click to upload university photo</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Photo</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Click to upload current photo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={() => router.back()} className="border-border">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Updating..." : "Creating..."}
            </>
          ) : initialData ? (
            "Update Batchmate"
          ) : (
            "Create Batchmate"
          )}
        </Button>
      </div>
    </form>
  )
}
