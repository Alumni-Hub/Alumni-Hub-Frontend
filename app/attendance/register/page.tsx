"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Loader2, CheckCircle2, XCircle, User, FileText, Smile, 
  Home, Globe, Briefcase, MessageCircle, Mail, Phone, 
  Calendar, MapPin 
} from "lucide-react"
import { eventAttendanceService } from "@/lib/api/services/event-attendance.service"
import { eventService } from "@/lib/api/services/event.service"

/**
 * Normalize phone number for display and validation
 * Handles: +94714007983, 0714007983, 94714007983
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return phone;
  
  // Remove all spaces, dashes, and parentheses
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  
  // Remove leading + if present
  if (normalized.startsWith('+')) {
    normalized = normalized.substring(1);
  }
  
  // If starts with 0, replace with 94 (Sri Lanka country code)
  if (normalized.startsWith('0')) {
    normalized = '94' + normalized.substring(1);
  }
  
  // Ensure it starts with 94
  if (!normalized.startsWith('94')) {
    normalized = '94' + normalized;
  }
  
  return normalized;
}

function AttendanceRegisterForm() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get("eventId")

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [checkingMobile, setCheckingMobile] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [formData, setFormData] = useState({
    mobile: "",
    name: "",
    fullName: "",
    nickName: "",
    address: "",
    country: "",
    workingPlace: "",
    whatsapp: "",
    email: "",
    gmail: "",
  })

  const [isExistingUser, setIsExistingUser] = useState(false)
  const [mobileChecked, setMobileChecked] = useState(false)

  useEffect(() => {
    if (eventId) {
      loadEvent()
    }
  }, [eventId])

  const loadEvent = async () => {
    try {
      // eventId from URL can be documentId (string) or numeric id
      const eventData = await eventService.getById(eventId as string)
      setEvent(eventData)
    } catch (err) {
      setError("Failed to load event details")
      console.error(err)
    }
  }

  const handleMobileCheck = async () => {
    if (!formData.mobile || formData.mobile.length < 10) {
      setError("Please enter a valid mobile number")
      return
    }

    setCheckingMobile(true)
    setError("")

    try {
      // Normalize the mobile number before sending
      const normalizedMobile = normalizePhoneNumber(formData.mobile)
      
      const result = await eventAttendanceService.checkByMobile(formData.mobile)

      if (result.found && result.data) {
        // Auto-populate form with existing data
        setFormData({
          ...formData,
          mobile: normalizedMobile, // Update with normalized number
          name: result.data.callingName || "",
          fullName: result.data.fullName || "",
          nickName: result.data.nickName || "",
          address: result.data.address || "",
          country: result.data.country || "",
          workingPlace: result.data.workingPlace || "",
          whatsapp: result.data.whatsappMobile || normalizedMobile,
          email: result.data.email || "",
          gmail: result.data.email || "",
        })
        setIsExistingUser(true)
        setError("") // Clear any previous errors
      } else {
        setIsExistingUser(false)
        // Update mobile to normalized format even for new users
        setFormData({
          ...formData,
          mobile: normalizedMobile,
          whatsapp: normalizedMobile,
        })
        setError(result.message || "You haven't registered earlier. Please register into the system.")
      }
      setMobileChecked(true)
    } catch (err) {
      setError("Failed to check mobile number. Please try again.")
      console.error(err)
    } finally {
      setCheckingMobile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!eventId) {
      setError("Invalid event ID")
      return
    }

    if (!mobileChecked) {
      setError("Please check your mobile number first")
      return
    }

    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      setError("Name is required")
      return
    }

    if (!formData.fullName || !formData.fullName.trim()) {
      setError("Full Name is required")
      return
    }

    if (!formData.mobile || formData.mobile.length < 10) {
      setError("Valid mobile number is required")
      return
    }

    // Validate email format if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address")
        return
      }
    }

    setLoading(true)
    setError("")

    try {
      const result = await eventAttendanceService.registerQRAttendance(
        eventId as string,
        formData.mobile,
        formData
      )

      if (result.success) {
        setSuccessMessage(result.message)
        setSubmitted(true)
      } else {
        setError("Failed to register attendance. Please try again.")
      }
    } catch (err: any) {
      console.error('Full error:', err)
      const errorMessage = err.response?.data?.error?.message 
        || err.response?.data?.message 
        || err.message 
        || "Failed to register attendance. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-white p-2 shadow-lg">
                <img src="/Logo.jpeg" alt="Logo" className="h-full w-full object-cover rounded-full" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">93/94 Batch</h1>
              <p className="text-sm text-muted-foreground">University of Moratuwa - Faculty of Engineering</p>
            </div>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Registration Successful!</CardTitle>
            <CardDescription>{successMessage}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium">
                Your attendance has been marked for
              </p>
              <p className="text-lg font-bold text-green-900 mt-1">{event?.name}</p>
              {event?.eventDate && (
                <p className="text-xs text-green-700 mt-1">
                  {new Date(event.eventDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Thank you for registering! We look forward to seeing you at the event.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Register Another Person
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          {/* Logo and Branding */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white p-2 shadow-md flex-shrink-0">
              <img src="/Logo.jpeg" alt="Logo" className="h-full w-full object-cover rounded-full" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary">93/94 Batch</h1>
              <p className="text-sm text-muted-foreground">University of Moratuwa - Faculty of Engineering</p>
            </div>
          </div>

          {/* Event Info */}
          <div className="border-t pt-4">
            <CardTitle className="text-xl mb-2">Event Attendance Registration</CardTitle>
            <CardDescription>
              {event ? (
                <div className="space-y-1">
                  <p className="text-base">
                    Registering for: <strong className="text-primary">{event.name}</strong>
                  </p>
                  {event.eventDate && (
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.eventDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  {event.venue && (
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.venue}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading event details...</span>
                </div>
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-4 animate-in fade-in slide-in-from-top-2">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isExistingUser && (
            <Alert className="mb-4 bg-green-50 border-green-200 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">
                Welcome back! Your information has been loaded. Please verify and update if needed.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mobile Number Check */}
            <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Label htmlFor="mobile" className="text-base font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Mobile Number *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="mobile"
                  placeholder="e.g., 0714007983 or +94714007983"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  disabled={mobileChecked}
                  required
                  className="text-base"
                />
                {!mobileChecked && (
                  <Button
                    type="button"
                    onClick={handleMobileCheck}
                    disabled={checkingMobile}
                    className="px-6"
                  >
                    {checkingMobile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking
                      </>
                    ) : (
                      "Check"
                    )}
                  </Button>
                )}
              </div>
              {!mobileChecked && (
                <div className="space-y-1">
                  <p className="text-sm text-blue-700 font-medium">
                    Enter your mobile number and click Check to load your existing data or register as new
                  </p>
                  <p className="text-xs text-blue-600">
                    You can enter: 0714007983, +94714007983, or 94714007983
                  </p>
                </div>
              )}
              {mobileChecked && (
                <p className="text-sm text-green-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Mobile number verified
                </p>
              )}
            </div>

            {mobileChecked && (
              <>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                    Personal Information
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., John"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      minLength={2}
                      maxLength={50}
                      className={!formData.name && error ? "border-red-500" : ""}
                    />
                    {!formData.name && error && (
                      <p className="text-xs text-red-500">Name is required</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="e.g., John Doe Silva"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                      minLength={3}
                      maxLength={100}
                      className={!formData.fullName && error ? "border-red-500" : ""}
                    />
                    {!formData.fullName && error && (
                      <p className="text-xs text-red-500">Full Name is required</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickName" className="font-medium flex items-center gap-2">
                    <Smile className="h-4 w-4" />
                    Nick Name
                  </Label>
                  <Input
                    id="nickName"
                    placeholder="e.g., Johnny (optional)"
                    value={formData.nickName}
                    onChange={(e) => handleInputChange("nickName", e.target.value)}
                  />
                </div>

                <div className="border-t pt-4 col-span-full mt-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                    Contact & Location
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="font-medium flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Address (Residence)
                  </Label>
                  <Input
                    id="address"
                    placeholder="e.g., 123 Main Street, Colombo"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Country
                  </Label>
                  <Input
                    id="country"
                    placeholder="e.g., Sri Lanka"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                  />
                </div>

                <div className="space-y-2 col-span-full">
                  <Label htmlFor="workingPlace" className="font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Working Place
                  </Label>
                  <Input
                    id="workingPlace"
                    placeholder="e.g., ABC Corporation, Colombo"
                    value={formData.workingPlace}
                    onChange={(e) => handleInputChange("workingPlace", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="font-medium flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      placeholder="e.g., 0771234567"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      E-Mail / Gmail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g., john@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        handleInputChange("email", e.target.value)
                        handleInputChange("gmail", e.target.value)
                      }}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Registering Your Attendance...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Register & Mark Attendance
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    By registering, you confirm your attendance at this event
                  </p>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AttendanceRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white p-2 shadow-md">
                <img src="/Logo.jpeg" alt="Logo" className="h-full w-full object-cover rounded-full" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">93/94 Batch</h1>
                <p className="text-sm text-muted-foreground">University of Moratuwa</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading registration form...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <AttendanceRegisterForm />
    </Suspense>
  )
}
