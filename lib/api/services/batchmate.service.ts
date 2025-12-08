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
    const params: any = { populate: ["universityPhoto", "currentPhoto"] }
    
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
    return response.data.data
  },

  async getById(id: string) {
    const response = await apiClient.get(`/batchmates/${id}`, {
      params: { populate: ["universityPhoto", "currentPhoto"] },
    })
    return response.data.data
  },

  async create(data: BatchmateData) {
    const response = await apiClient.post("/batchmates", { data })
    return response.data.data
  },

  async update(id: string, data: Partial<BatchmateData>) {
    const response = await apiClient.put(`/batchmates/${id}`, { data })
    return response.data.data
  },

  async delete(id: string) {
    await apiClient.delete(`/batchmates/${id}`)
  },
}
