import apiClient from "../client"

export interface Event {
  id: number
  documentId?: string
  name: string
  description?: string
  eventDate: string
  eventType: string
  venue?: string
  status: string
  qrCode?: string
  qrCodeUrl?: string
  attendees?: any[]
  createdAt: string
  updatedAt: string
}

export interface EventStatistics {
  event: {
    id: number
    name: string
    eventDate: string
    venue?: string
  }
  statistics: {
    total: number
    present: number
    absent: number
    pending: number
    qrScanned: number
    manual: number
    notMarked: number
  }
}

export const eventService = {
  // Get all events
  async getAll(): Promise<Event[]> {
    try {
      const response = await apiClient.get("/events")
      return response.data.data || response.data
    } catch (error) {
      console.error("Error fetching events:", error)
      throw error
    }
  },

  // Get a single event by ID or documentId
  async getById(id: number | string): Promise<Event> {
    try {
      const response = await apiClient.get(`/events/${id}`)
      return response.data.data || response.data
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error)
      throw error
    }
  },

  // Create a new event
  async create(data: Partial<Event>): Promise<Event> {
    try {
      const response = await apiClient.post("/events", { data })
      return response.data.data || response.data
    } catch (error) {
      console.error("Error creating event:", error)
      throw error
    }
  },

  // Update an event
  async update(id: number, data: Partial<Event>): Promise<Event> {
    try {
      const response = await apiClient.put(`/events/${id}`, { data })
      return response.data.data || response.data
    } catch (error) {
      console.error(`Error updating event ${id}:`, error)
      throw error
    }
  },

  // Delete an event
  async delete(id: number | string): Promise<void> {
    try {
      await apiClient.delete(`/events/${id}`)
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error)
      throw error
    }
  },

  // Generate QR code for an event
  async generateQRCode(id: number): Promise<{ qrCode: string; qrCodeUrl: string; event: Event }> {
    try {
      const response = await apiClient.post(`/events/${id}/generate-qr`)
      return response.data
    } catch (error) {
      console.error(`Error generating QR code for event ${id}:`, error)
      throw error
    }
  },

  // Get event statistics
  async getStatistics(id: number): Promise<EventStatistics> {
    try {
      const response = await apiClient.get(`/events/${id}/statistics`)
      return response.data
    } catch (error) {
      console.error(`Error fetching statistics for event ${id}:`, error)
      throw error
    }
  },
}

export default eventService
