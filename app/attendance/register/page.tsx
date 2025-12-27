"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { eventAttendanceService } from "@/lib/api/services/event-attendance.service"
import { eventService } from "@/lib/api/services/event.service"

export default function AttendanceRegisterPage() {
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
      const eventData = await eventService.getById(Number(eventId))
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
      const result = await eventAttendanceService.checkByMobile(formData.mobile)

      if (result.found && result.data) {
        // Auto-populate form with existing data
        setFormData({
          ...formData,
          name: result.data.callingName || "",
          fullName: result.data.fullName || "",
          nickName: result.data.nickName || "",
          address: result.data.address || "",
          country: result.data.country || "",
          workingPlace: result.data.workingPlace || "",
          whatsapp: result.data.whatsappMobile || formData.mobile,
          email: result.data.email || "",
          gmail: result.data.email || "",
        })
        setIsExistingUser(true)
      } else {
        setIsExistingUser(false)
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

    setLoading(true)
    setError("")

    try {
      const result = await eventAttendanceService.registerQRAttendance(
        Number(eventId),
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
      setError(err.response?.data?.error?.message || "Failed to register attendance. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Registration Successful!</CardTitle>
            <CardDescription>{successMessage}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Your attendance has been marked for <strong>{event?.name}</strong>
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Register Another Person
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Event Attendance Registration</CardTitle>
          <CardDescription>
            {event ? (
              <>
                Registering for: <strong>{event.name}</strong>
                {event.eventDate && (
                  <span className="block text-sm mt-1">
                    Date: {new Date(event.eventDate).toLocaleDateString()}
                  </span>
                )}
              </>
            ) : (
              "Loading event details..."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isExistingUser && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Welcome back! Your information has been loaded. Please verify and update if needed.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile Number Check */}
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <div className="flex gap-2">
                <Input
                  id="mobile"
                  placeholder="Enter your mobile number"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  disabled={mobileChecked}
                  required
                />
                {!mobileChecked && (
                  <Button
                    type="button"
                    onClick={handleMobileCheck}
                    disabled={checkingMobile}
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
                <p className="text-xs text-muted-foreground">
                  Enter your mobile number and click Check to load your existing data or register as new
                </p>
              )}
            </div>

            {mobileChecked && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Calling name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Full legal name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickName">Nick Name</Label>
                  <Input
                    id="nickName"
                    placeholder="Nickname (optional)"
                    value={formData.nickName}
                    onChange={(e) => handleInputChange("nickName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address (Residence)</Label>
                  <Input
                    id="address"
                    placeholder="Current residential address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Country of residence"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workingPlace">Working Place</Label>
                  <Input
                    id="workingPlace"
                    placeholder="Current workplace"
                    value={formData.workingPlace}
                    onChange={(e) => handleInputChange("workingPlace", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      placeholder="WhatsApp number"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail / Gmail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => {
                        handleInputChange("email", e.target.value)
                        handleInputChange("gmail", e.target.value)
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Register & Mark Attendance"
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
