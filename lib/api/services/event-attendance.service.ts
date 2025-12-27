import apiClient from "../client"

export interface EventAttendance {
  id: number
  event?: any
  batchmate?: any
  attendanceMethod: "QR_SCAN" | "MANUAL" | "NOT_MARKED"
  status: "Pending" | "Present" | "Absent"
  markedAt?: string
  markedBy?: any
  registeredData?: any
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceRegistrationData {
  name: string
  fullName: string
  nickName?: string
  address?: string
  country?: string
  workingPlace?: string
  mobile: string
  whatsapp?: string
  email?: string
  gmail?: string
}

export const eventAttendanceService = {
  // Get all attendances
  async getAll(): Promise<EventAttendance[]> {
    try {
      const response = await apiClient.get("/event-attendances")
      return response.data.data || response.data
    } catch (error) {
      console.error("Error fetching event attendances:", error)
      throw error
    }
  },

  // Get a single attendance record by ID
  async getById(id: number): Promise<EventAttendance> {
    try {
      const response = await apiClient.get(`/event-attendances/${id}`)
      return response.data.data || response.data
    } catch (error) {
      console.error(`Error fetching event attendance ${id}:`, error)
      throw error
    }
  },

  // Check if a batchmate exists by mobile number
  async checkByMobile(mobile: string): Promise<{ found: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.post("/event-attendances/check-mobile", { mobile })
      return response.data
    } catch (error) {
      console.error("Error checking mobile number:", error)
      throw error
    }
  },

  // Register attendance via QR code scan
  async registerQRAttendance(
    eventId: number | string,
    mobile: string,
    data: AttendanceRegistrationData
  ): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await apiClient.post("/event-attendances/register-qr", {
        eventId,
        mobile,
        data,
      })
      return response.data
    } catch (error) {
      console.error("Error registering QR attendance:", error)
      throw error
    }
  },

  // Mark attendance manually (by admin)
  async markManualAttendance(
    eventId: number,
    batchmateId: number,
    status: "Present" | "Absent" | "Pending",
    notes?: string
  ): Promise<{ success: boolean; message: string; data: EventAttendance }> {
    try {
      const response = await apiClient.post("/event-attendances/mark-manual", {
        eventId,
        batchmateId,
        status,
        notes,
      })
      return response.data
    } catch (error) {
      console.error("Error marking manual attendance:", error)
      throw error
    }
  },

  // Bulk mark attendance
  async bulkMarkAttendance(
    eventId: number,
    attendances: Array<{ batchmateId: number; status: string; notes?: string }>
  ): Promise<{ success: boolean; message: string; data: EventAttendance[] }> {
    try {
      const response = await apiClient.post("/event-attendances/bulk-mark", {
        eventId,
        attendances,
      })
      return response.data
    } catch (error) {
      console.error("Error bulk marking attendance:", error)
      throw error
    }
  },

  // Get all attendances for an event
  async getEventAttendances(eventId: number): Promise<EventAttendance[]> {
    try {
      const response = await apiClient.get(`/events/${eventId}/attendances`)
      return response.data.data || response.data
    } catch (error) {
      console.error(`Error fetching attendances for event ${eventId}:`, error)
      throw error
    }
  },
}

export default eventAttendanceService
