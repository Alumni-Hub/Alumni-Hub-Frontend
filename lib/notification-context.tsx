"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { notificationService, type Notification } from "./api/services/notification.service"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getAll()
      setNotifications(data)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.documentId === id || n.id === id ? { ...n, read: true } : n)
      )
    } catch (error) {
      // Silently fail - notification service handles mock mode
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      // Silently fail - notification service handles mock mode
    }
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.delete(id)
      setNotifications(prev => prev.filter(n => n.documentId !== id && n.id !== id))
    } catch (error) {
      // Silently fail - notification service handles mock mode
    }
  }, [])

  // Initial load
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true)
      await refreshNotifications()
      setIsLoading(false)
    }
    loadNotifications()
  }, [refreshNotifications])

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshNotifications()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [refreshNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
