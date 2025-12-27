"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, QrCode, Plus, Eye, Trash2, Calendar, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { eventService, Event } from "@/lib/api/services/event.service"
import { useToast } from "@/hooks/use-toast"

export default function QRManagementPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const { toast } = useToast()

  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    eventDate: "",
    eventType: "Alumni Party",
    venue: "",
    status: "Upcoming",
  })

  const [editEvent, setEditEvent] = useState({
    name: "",
    description: "",
    eventDate: "",
    eventType: "Alumni Party",
    venue: "",
    status: "Upcoming",
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const data = await eventService.getAll()
      setEvents(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!newEvent.name || !newEvent.eventDate) {
      toast({
        title: "Error",
        description: "Event name and date are required",
        variant: "destructive",
      })
      return
    }

    try {
      setCreating(true)
      await eventService.create(newEvent)
      toast({
        title: "Success",
        description: "Event created successfully",
      })
      setShowCreateDialog(false)
      setNewEvent({
        name: "",
        description: "",
        eventDate: "",
        eventType: "Alumni Party",
        venue: "",
        status: "Upcoming",
      })
      loadEvents()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleGenerateQR = async (eventId: number) => {
    try {
      const result = await eventService.generateQRCode(eventId)
      toast({
        title: "Success",
        description: "QR code generated successfully",
      })
      loadEvents()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEvent = async (eventId: number | string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      await eventService.delete(eventId)
      // Remove event from local state immediately
      setEvents(prevEvents => prevEvents.filter(e => {
        const id = e.documentId || e.id
        return id !== eventId
      }))
      toast({
        title: "Success",
        description: "Event deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      })
      // Reload events on error to ensure consistency
      loadEvents()
    }
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setEditEvent({
      name: event.name,
      description: event.description || "",
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : "",
      eventType: event.eventType,
      venue: event.venue || "",
      status: event.status,
    })
    setShowEditDialog(true)
  }

  const handleUpdateEvent = async () => {
    if (!selectedEvent || !editEvent.name || !editEvent.eventDate) {
      toast({
        title: "Error",
        description: "Event name and date are required",
        variant: "destructive",
      })
      return
    }

    try {
      setUpdating(true)
      const eventId = selectedEvent.documentId || selectedEvent.id
      await eventService.update(eventId, editEvent)
      toast({
        title: "Success",
        description: "Event updated successfully",
      })
      setShowEditDialog(false)
      setSelectedEvent(null)
      loadEvents()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const downloadQRCode = (event: Event) => {
    if (!event.qrCode) return

    const link = document.createElement("a")
    link.href = event.qrCode
    link.download = `${event.name.replace(/\s+/g, "-")}-QR-Code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "QR code downloaded",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Upcoming: "default",
      Ongoing: "secondary",
      Completed: "outline",
      Cancelled: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">QR Code Management</h1>
          <p className="text-muted-foreground">Generate and manage event QR codes for attendance</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Create a new event to generate QR codes for attendance</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="event-name">Event Name *</Label>
                <Input
                  id="event-name"
                  placeholder="Alumni Reunion 2025"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  placeholder="Event description..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-date">Event Date *</Label>
                <Input
                  id="event-date"
                  type="datetime-local"
                  value={newEvent.eventDate}
                  onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-type">Event Type</Label>
                <Select
                  value={newEvent.eventType}
                  onValueChange={(value) => setNewEvent({ ...newEvent, eventType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alumni Party">Alumni Party</SelectItem>
                    <SelectItem value="Reunion">Reunion</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-venue">Venue</Label>
                <Input
                  id="event-venue"
                  placeholder="Hotel Grand, Colombo"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                />
              </div>

              <Button onClick={handleCreateEvent} disabled={creating} className="w-full">
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-event-name">Event Name *</Label>
              <Input
                id="edit-event-name"
                placeholder="Alumni Reunion 2025"
                value={editEvent.name}
                onChange={(e) => setEditEvent({ ...editEvent, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-event-description">Description</Label>
              <Textarea
                id="edit-event-description"
                placeholder="Event description..."
                value={editEvent.description}
                onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-event-date">Event Date *</Label>
              <Input
                id="edit-event-date"
                type="datetime-local"
                value={editEvent.eventDate}
                onChange={(e) => setEditEvent({ ...editEvent, eventDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-event-type">Event Type</Label>
              <Select
                value={editEvent.eventType}
                onValueChange={(value) => setEditEvent({ ...editEvent, eventType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alumni Party">Alumni Party</SelectItem>
                  <SelectItem value="Reunion">Reunion</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-event-venue">Venue</Label>
              <Input
                id="edit-event-venue"
                placeholder="Hotel Grand, Colombo"
                value={editEvent.venue}
                onChange={(e) => setEditEvent({ ...editEvent, venue: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-event-status">Status</Label>
              <Select
                value={editEvent.status}
                onValueChange={(value) => setEditEvent({ ...editEvent, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleUpdateEvent} disabled={updating} className="w-full">
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Event"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first event to generate QR codes</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.eventDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(event.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                )}
                
                {event.venue && (
                  <p className="text-sm">
                    <strong>Venue:</strong> {event.venue}
                  </p>
                )}

                {event.qrCode ? (
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4 bg-white flex justify-center">
                      <img src={event.qrCode} alt="QR Code" className="w-48 h-48" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadQRCode(event)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{event.name}</DialogTitle>
                            <DialogDescription>QR Code Details</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              <img src={event.qrCode} alt="QR Code" className="w-64 h-64" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm">
                                <strong>Registration URL:</strong>
                              </p>
                              <code className="block p-2 bg-muted rounded text-xs break-all">
                                {event.qrCodeUrl}
                              </code>
                            </div>
                            <Button onClick={() => downloadQRCode(event)} className="w-full">
                              <Download className="mr-2 h-4 w-4" />
                              Download QR Code
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleGenerateQR(event.id)}
                    className="w-full"
                    variant="outline"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate QR Code
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEvent(event)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.documentId || event.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
