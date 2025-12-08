import apiClient from "../client"

export interface UserData {
  username: string
  email: string
  password?: string
  role: {
    id: number
    name: string
    type: string
  }
  assignedField?: string
  confirmed?: boolean
  blocked?: boolean
}

export interface UserResponse {
  id: number
  username: string
  email: string
  provider: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
  role: {
    id: number
    name: string
    type: string
  }
  assignedField?: string
}

export const userService = {
  async getAll(): Promise<UserResponse[]> {
    const response = await apiClient.get("/users")
    return response.data
  },

  async getById(id: number): Promise<UserResponse> {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  async create(data: {
    username: string
    email: string
    password: string
    role: number
    assignedField?: string
  }): Promise<UserResponse> {
    const response = await apiClient.post("/users", data)
    return response.data
  },

  async update(
    id: number,
    data: Partial<{
      username: string
      email: string
      password: string
      role: number
      assignedField: string
    }>
  ): Promise<UserResponse> {
    const response = await apiClient.put(`/users/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`)
  },

  async getRoles(): Promise<{ id: number; name: string; type: string }[]> {
    const response = await apiClient.get("/users-permissions/roles")
    return response.data.roles
  },
}
