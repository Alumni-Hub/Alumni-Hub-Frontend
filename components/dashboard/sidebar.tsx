"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserPlus,
  Search,
  FileText,
  Layers,
  Menu,
  ChevronRight,
  Upload,
  QrCode,
  CalendarCheck,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Batchmates", href: "/dashboard/batchmates", icon: Users },
  { name: "Add Batchmate", href: "/dashboard/batchmates/new", icon: UserPlus },
  { name: "Bulk Import", href: "/dashboard/bulk-import", icon: Upload },
  { name: "Event Attendance", href: "/dashboard/event-attendance", icon: CalendarCheck },
  { name: "Full View", href: "/dashboard/full-view", icon: Layers },
  { name: "Global Search", href: "/dashboard/search", icon: Search },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
]

const adminNavigation = [
  { name: "User Management", href: "/dashboard/users", icon: Users },
  { name: "QR Management", href: "/dashboard/qr-management", icon: QrCode },
]

function SidebarContent() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 sm:h-16 items-center gap-2 sm:gap-3 border-b border-sidebar-border px-4 sm:px-6">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg overflow-hidden bg-white flex-shrink-0">
          <Image src="/Logo.jpeg" alt="Logo" width={36} height={36} className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-sm sm:text-base text-sidebar-foreground truncate">93/94 Batch</h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">UoM Engineering</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            // Special handling for Dashboard - only active on exact match
            const isActive = item.href === "/dashboard" 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(item.href + "/")
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-sidebar-accent-foreground")} />
                {item.name}
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            )
          })}

          {/* Admin-only section */}
          {user?.role === "super_admin" && (
            <>
              <div className="my-4 px-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Administration</p>
              </div>
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive && "text-sidebar-accent-foreground")} />
                    {item.name}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Link>
                )
              })}
            </>
          )}
        </nav>
      </ScrollArea>

      {/* User info */}
      <div className="border-t border-sidebar-border p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
            <span className="text-xs sm:text-sm font-medium text-primary">{user?.username?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-sidebar-foreground truncate">{user?.username}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground capitalize truncate">
              {user?.role === "super_admin" ? "Super Admin" : `${user?.assignedField} Admin`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-2.5 sm:top-3 left-2.5 sm:left-3 z-50 h-8 w-8 sm:h-9 sm:w-9">
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 sm:w-72 p-0 bg-sidebar border-sidebar-border">
          <VisuallyHidden>
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>
              Main navigation menu for the 93/94 Batch of University of Moratuwa dashboard
            </SheetDescription>
          </VisuallyHidden>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>
    </>
  )
}
