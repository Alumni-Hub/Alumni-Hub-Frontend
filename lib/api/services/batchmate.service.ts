import apiClient from "../client"

export interface BatchmateData {
  callingName: string
  fullName: string
  whatsappMobile: string
  email: string
  nickName?: string
  address?: string
  country?: string
  workingPlace?: string
  mobile?: string
  field: string
  universityPhoto?: any
  currentPhoto?: any
  phoneConfirmation?: "Yes" | "No"
  attendance?: "Present" | "Absent"
}

export interface BatchmateFilters {
  callingName?: string
  fullName?: string
  nickName?: string
  country?: string
  workingPlace?: string
  field?: string
  whatsappMobile?: string
  mobile?: string
}

export const batchmateService = {
  async getAll(filters?: BatchmateFilters) {
    const params: any = { 
      populate: ["universityPhoto", "currentPhoto"],
      pagination: {
        pageSize: 5000 // Get up to 5000 records
      }
    }
    
    if (filters) {
      const filterObj: any = {}
      if (filters.callingName) filterObj.callingName = { $containsi: filters.callingName }
      if (filters.fullName) filterObj.fullName = { $containsi: filters.fullName }
      if (filters.nickName) filterObj.nickName = { $containsi: filters.nickName }
      if (filters.country) filterObj.country = { $eq: filters.country }
      if (filters.workingPlace) filterObj.workingPlace = { $containsi: filters.workingPlace }
      if (filters.field) filterObj.field = { $eq: filters.field }
      if (filters.whatsappMobile) filterObj.whatsappMobile = { $contains: filters.whatsappMobile }
      if (filters.mobile) filterObj.mobile = { $contains: filters.mobile }
      
      params.filters = filterObj
    }

    const response = await apiClient.get("/batchmates", { params })
    // Handle both Strapi formats: flat or with attributes
    return response.data.data.map((item: any) => {
      // If item already has the fields directly (flat format)
      if (item.callingName !== undefined) {
        return {
          ...item,
          // Ensure documentId is included for v5 compatibility
          documentId: item.documentId || item.id
        }
      }
      // If item has attributes wrapper
      return {
        id: item.id,
        documentId: item.documentId || item.id,
        ...item.attributes
      }
    })
  },

  async getById(id: string) {
    // Use the provided id (which should be documentId in Strapi v5)
    const response = await apiClient.get(`/batchmates/${id}`, {
      params: { populate: ["universityPhoto", "currentPhoto"] },
    })
    const item = response.data.data
    // If item already has the fields directly (flat format)
    if (item.callingName !== undefined) {
      return {
        ...item,
        documentId: item.documentId || item.id
      }
    }
    // If item has attributes wrapper
    return {
      id: item.id,
      documentId: item.documentId || item.id,
      ...item.attributes
    }
  },

  async create(data: BatchmateData) {
    const response = await apiClient.post("/batchmates", { data })
    const item = response.data.data
    // If item already has the fields directly (flat format)
    if (item.callingName !== undefined) {
      return item
    }
    // If item has attributes wrapper
    return {
      id: item.id,
      ...item.attributes
    }
  },

  async update(id: string, data: Partial<BatchmateData>) {
    const response = await apiClient.put(`/batchmates/${id}`, { data })
    const item = response.data.data
    // If item already has the fields directly (flat format)
    if (item.callingName !== undefined) {
      return item
    }
    // If item has attributes wrapper
    return {
      id: item.id,
      ...item.attributes
    }
  },

  async delete(id: string) {
    await apiClient.delete(`/batchmates/${id}`)
  },
}
