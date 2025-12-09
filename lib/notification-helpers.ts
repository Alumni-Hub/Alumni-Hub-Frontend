import { notificationService } from "./api/services/notification.service"

export const notificationHelpers = {
  async notifyNewUser(username: string, role: string, field?: string) {
    try {
      await notificationService.create({
        type: "new_user",
        title: "New User Registered",
        message: `${username} has been added as ${role}${field ? ` for ${field}` : ""}`,
        read: false,
        actionUrl: "/dashboard/users",
        metadata: { userRole: role, field }
      })
    } catch (error) {
      console.error("Failed to create notification:", error)
    }
  },

  async notifyNewBatchmate(fullName: string, field: string) {
    try {
      await notificationService.create({
        type: "new_batchmate",
        title: "New Alumni Added",
        message: `${fullName} from ${field} has been added to the network`,
        read: false,
        actionUrl: "/dashboard/batchmates",
        metadata: { field }
      })
    } catch (error) {
      console.error("Failed to create notification:", error)
    }
  },

  async notifyBatchmateUpdate(fullName: string) {
    try {
      await notificationService.create({
        type: "update",
        title: "Profile Updated",
        message: `${fullName} updated their profile information`,
        read: false,
        actionUrl: "/dashboard/batchmates"
      })
    } catch (error) {
      console.error("Failed to create notification:", error)
    }
  },

  async notifySystem(title: string, message: string) {
    try {
      await notificationService.create({
        type: "system",
        title,
        message,
        read: false
      })
    } catch (error) {
      console.error("Failed to create notification:", error)
    }
  }
}
