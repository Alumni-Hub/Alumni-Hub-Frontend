"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, LogOut, Settings, User, X, CheckCheck, ExternalLink, UserPlus, GraduationCap, FileEdit, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, isLoading } = useNotifications()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.documentId || notification.id)
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_user":
        return UserPlus
      case "new_batchmate":
        return GraduationCap
      case "update":
        return FileEdit
      case "system":
        return AlertCircle
      default:
        return Bell
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-2 sm:gap-4 lg:ml-0 ml-10 sm:ml-12 flex-1 min-w-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-base md:text-lg font-semibold text-foreground truncate">
            Welcome back, {user?.username}
          </h1>
          <p className="hidden sm:block text-xs md:text-sm text-muted-foreground truncate">
            Manage your alumni network efficiently
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Role badge */}
        <Badge
          variant="outline"
          className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 ${
            user?.role === "super_admin"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-accent/30 bg-accent/10 text-accent"
          }`}
        >
          <span className="hidden sm:inline">
            {user?.role === "super_admin" ? "Super Admin" : `${user?.assignedField} Admin`}
          </span>
          <span className="sm:hidden">
            {user?.role === "super_admin" ? "Admin" : user?.assignedField?.split(' ')[0]}
          </span>
        </Badge>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-accent text-[9px] sm:text-[10px] font-medium flex items-center justify-center text-accent-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-popover border-border p-0">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
              <DropdownMenuLabel className="p-0 font-semibold text-sm sm:text-base">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-auto py-1 px-2 text-xs"
                >
                  <CheckCheck className="mr-1 h-3 w-3" />
                  <span className="hidden xs:inline">Mark all read</span>
                  <span className="xs:hidden">Mark all</span>
                </Button>
              )}
            </div>
            <ScrollArea className="max-h-[60vh] sm:max-h-[400px]">
              {isLoading ? (
                <div className="p-4 text-center text-xs sm:text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.slice(0, 10).map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type)
                    return (
                      <div
                        key={notification.documentId || notification.id}
                        className={`p-3 sm:p-4 hover:bg-secondary/50 cursor-pointer transition-colors ${
                          !notification.read ? "bg-primary/5" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">{notification.title}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.documentId || notification.id)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                              <span className="text-[10px] sm:text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                              {!notification.read && (
                                <Badge variant="secondary" className="h-3.5 sm:h-4 px-1 text-[9px] sm:text-[10px]">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
            {notifications.length > 0 && (
              <div className="p-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push("/dashboard/notifications")}
                >
                  View all notifications
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xs sm:text-sm font-medium text-primary">{user?.username?.charAt(0).toUpperCase()}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-popover border-border">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm truncate">{user?.username}</span>
                <span className="text-xs font-normal text-muted-foreground truncate">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-sm">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-sm text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
