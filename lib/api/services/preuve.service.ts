// Service pour la gestion des preuves
import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type { Preuve, CreatePreuveData, UpdatePreuveData, PreuveStatistics } from "../types/preuve"

class PreuveService extends BaseService<Preuve, CreatePreuveData, UpdatePreuveData> {
  constructor() {
    super(ENDPOINTS.PREUVES.BASE)
  }

  async getAll(): Promise<Preuve[]> {
    const response = await this.customRequest<any>("GET", this.baseEndpoint)

    console.log("[v0] Preuve getAll response:", response)

    // Extract data from nested structure: response.data.data for paginated results
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }

    // Fallback for non-paginated response
    if (Array.isArray(response?.data)) {
      return response.data
    }

    // Last fallback if data is directly an array
    if (Array.isArray(response)) {
      return response
    }

    console.error("[v0] Unexpected response structure:", response)
    return []
  }

  async getAllWithFilters(filters: {
    page?: number
    limit?: number
    typePreuve?: string
    dateDebut?: string
    dateFin?: string
  }): Promise<Preuve[]> {
    const params = new URLSearchParams()
    if (filters.page) params.append("page", filters.page.toString())
    if (filters.limit) params.append("limit", filters.limit.toString())
    if (filters.typePreuve) params.append("typePreuve", filters.typePreuve)
    if (filters.dateDebut) params.append("dateDebut", filters.dateDebut)
    if (filters.dateFin) params.append("dateFin", filters.dateFin)

    const response = await this.customRequest<any>("GET", `${this.baseEndpoint}?${params.toString()}`)

    console.log("[v0] Preuve getAllWithFilters response:", response)

    // Extract data from nested structure: response.data.data for paginated results
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }

    // Fallback for non-paginated response
    if (Array.isArray(response?.data)) {
      return response.data
    }

    return []
  }

  async upload(formData: FormData): Promise<Preuve> {
    return this.customRequest<Preuve>("POST", ENDPOINTS.PREUVES.UPLOAD, formData)
  }

  async getStatistics(filters?: { dateDebut?: string; dateFin?: string }): Promise<PreuveStatistics> {
    const params = new URLSearchParams()
    if (filters?.dateDebut) params.append("dateDebut", filters.dateDebut)
    if (filters?.dateFin) params.append("dateFin", filters.dateFin)

    return this.customRequest<PreuveStatistics>("GET", `${ENDPOINTS.PREUVES.STATISTICS}?${params.toString()}`)
  }
}

export const preuveService = new PreuveService()
