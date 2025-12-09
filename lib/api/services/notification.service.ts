import apiClient from "../client"

export interface Notification {
  id: string
  documentId?: string
  type: "new_user" | "new_batchmate" | "update" | "system"
  title: string
  message: string
  read: boolean
  actionUrl?: string
  createdAt: string
  metadata?: {
    userId?: string
    batchmateId?: string
    userRole?: string
    field?: string
  }
}

// Track if we're in mock mode (notification endpoint doesn't exist)
let useMockMode = false
let mockModeChecked = false

// LocalStorage keys for mock mode persistence
const STORAGE_KEYS = {
  DELETED_IDS: 'notifications_deleted_ids',
  READ_IDS: 'notifications_read_ids',
  CREATED_NOTIFICATIONS: 'notifications_created'
}

// Helper functions for localStorage
const getDeletedIds = (): Set<string> => {
  if (typeof window === 'undefined') return new Set()
  const stored = localStorage.getItem(STORAGE_KEYS.DELETED_IDS)
  return stored ? new Set(JSON.parse(stored)) : new Set()
}

const addDeletedId = (id: string) => {
  if (typeof window === 'undefined') return
  const deleted = getDeletedIds()
  deleted.add(id)
  localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify([...deleted]))
}

const getReadIds = (): Set<string> => {
  if (typeof window === 'undefined') return new Set()
  const stored = localStorage.getItem(STORAGE_KEYS.READ_IDS)
  return stored ? new Set(JSON.parse(stored)) : new Set()
}

const addReadId = (id: string) => {
  if (typeof window === 'undefined') return
  const readIds = getReadIds()
  readIds.add(id)
  localStorage.setItem(STORAGE_KEYS.READ_IDS, JSON.stringify([...readIds]))
}

const getCreatedNotifications = (): Notification[] => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEYS.CREATED_NOTIFICATIONS)
  return stored ? JSON.parse(stored) : []
}

const addCreatedNotification = (notification: Notification) => {
  if (typeof window === 'undefined') return
  const created = getCreatedNotifications()
  created.unshift(notification) // Add to beginning (most recent first)
  localStorage.setItem(STORAGE_KEYS.CREATED_NOTIFICATIONS, JSON.stringify(created))
}

export const notificationService = {
  async getAll() {
    // If we already know we're in mock mode, skip the API call
    if (useMockMode) {
      return this.getMockNotifications()
    }

    // Check if endpoint exists without logging 404 errors
    if (!mockModeChecked) {
      try {
        const response = await apiClient.get("/notifications", {
          params: {
            sort: ["createdAt:desc"],
            pagination: { pageSize: 50 }
          },
          validateStatus: (status) => status < 500 // Don't throw on 404
        })
        
        if (response.status === 404 || response.status === 403) {
          // Endpoint doesn't exist, switch to mock mode
          console.log("Notifications endpoint not available, using mock data")
          useMockMode = true
          mockModeChecked = true
          return this.getMockNotifications()
        }
        
        // Success! We have a real notification endpoint
        mockModeChecked = true
        useMockMode = false
        
        // Handle both Strapi formats
        return response.data.data.map((item: any) => {
          if (item.type !== undefined) {
            return {
              ...item,
              documentId: item.documentId || item.id
            }
          }
          return {
            id: item.id,
            documentId: item.documentId || item.id,
            ...item.attributes
          }
        })
      } catch (error: any) {
        // Network error or other issue
        console.log("Notifications endpoint not available, using mock data")
        useMockMode = true
        mockModeChecked = true
        return this.getMockNotifications()
      }
    }

    // Subsequent calls when endpoint exists
    try {
      const response = await apiClient.get("/notifications", {
        params: {
          sort: ["createdAt:desc"],
          pagination: { pageSize: 50 }
        }
      })
      
      return response.data.data.map((item: any) => {
        if (item.type !== undefined) {
          return {
            ...item,
            documentId: item.documentId || item.id
          }
        }
        return {
          id: item.id,
          documentId: item.documentId || item.id,
          ...item.attributes
        }
      })
    } catch (error: any) {
      // Fallback to mock data if real endpoint fails
      return this.getMockNotifications()
    }
  },

  getMockNotifications(): Notification[] {
    const now = new Date()
    const deletedIds = getDeletedIds()
    const readIds = getReadIds()
    const createdNotifications = getCreatedNotifications()
    
    const baseNotifications = [
      {
        id: "1",
        documentId: "mock-1",
        type: "new_user",
        title: "New User Registered",
        message: "A new field admin has been added to the system for Electrical Engineering",
        read: false,
        actionUrl: "/dashboard/users",
        createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5 mins ago
        metadata: { userRole: "field_admin", field: "Electrical Engineering" }
      },
      {
        id: "2",
        documentId: "mock-2",
        type: "new_batchmate",
        title: "New Alumni Added",
        message: "Pramodh De Silva from Mechanical Engineering has been added to the network",
        read: false,
        actionUrl: "/dashboard/batchmates",
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        metadata: { field: "Mechanical Engineering" }
      },
      {
        id: "3",
        documentId: "mock-3",
        type: "update",
        title: "Profile Updated",
        message: "Ojitha Rajapaksha updated their profile information",
        read: true,
        actionUrl: "/dashboard/batchmates",
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
      {
        id: "4",
        documentId: "mock-4",
        type: "system",
        title: "System Maintenance",
        message: "Scheduled maintenance will occur this weekend. The system will be unavailable for 2 hours.",
        read: true,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      }
    ] as Notification[]
    
    // Combine base notifications with user-created ones
    const allNotifications = [...createdNotifications, ...baseNotifications]
    
    // Filter out deleted notifications and update read status
    return allNotifications
      .filter(n => !deletedIds.has(n.documentId!) && !deletedIds.has(n.id))
      .map(n => ({
        ...n,
        read: n.read || readIds.has(n.documentId!) || readIds.has(n.id)
      }))
  },

  async markAsRead(id: string) {
    // Skip API call if in mock mode
    if (useMockMode) {
      addReadId(id)
      return { id, read: true }
    }

    try {
      const response = await apiClient.put(`/notifications/${id}`, {
        data: { read: true }
      })
      return response.data.data
    } catch (error: any) {
      // Switch to mock mode if endpoint doesn't exist
      useMockMode = true
      return { id, read: true }
    }
  },

  async markAllAsRead() {
    try {
      // This would need a custom endpoint in Strapi
      const notifications = await this.getAll()
      const unreadIds = notifications.filter((n: Notification) => !n.read).map((n: Notification) => n.documentId || n.id)
      
      await Promise.all(unreadIds.map(id => this.markAsRead(id)))
      return true
    } catch (error) {
      // Mock: just resolve successfully
      return true
    }
  },

  async delete(id: string) {
    // Skip API call if in mock mode
    if (useMockMode) {
      addDeletedId(id)
      return
    }

    try {
      await apiClient.delete(`/notifications/${id}`)
    } catch (error: any) {
      // Switch to mock mode if endpoint doesn't exist
      useMockMode = true
      addDeletedId(id)
      return
    }
  },

  async create(data: Omit<Notification, "id" | "documentId" | "createdAt">) {
    // Skip API call if in mock mode
    if (useMockMode) {
      const newNotification: Notification = {
        id: `created-${Date.now()}`,
        documentId: `created-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...data
      }
      addCreatedNotification(newNotification)
      return newNotification
    }

    try {
      const response = await apiClient.post("/notifications", { data })
      return response.data.data
    } catch (error: any) {
      // Switch to mock mode if endpoint doesn't exist
      useMockMode = true
      const newNotification: Notification = {
        id: `created-${Date.now()}`,
        documentId: `created-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...data
      }
      addCreatedNotification(newNotification)
      return newNotification
    }
  },

  // Poll for new notifications
  async getUnreadCount() {
    // Skip API call if in mock mode
    if (useMockMode) {
      const mockData = this.getMockNotifications()
      return mockData.filter(n => !n.read).length
    }

    try {
      const response = await apiClient.get("/notifications", {
        params: {
          filters: { read: { $eq: false } },
          pagination: { pageSize: 1 }
        }
      })
      return response.data.meta?.pagination?.total || 0
    } catch (error: any) {
      // Switch to mock mode if endpoint doesn't exist
      useMockMode = true
      const mockData = this.getMockNotifications()
      return mockData.filter(n => !n.read).length
    }
  }
}
