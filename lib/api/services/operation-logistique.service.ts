// Service pour la gestion des opérations logistiques
import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type {
  OperationLogistique,
  CreateOperationLogistiqueData,
  UpdateOperationLogistiqueData,
  CreateOperationLogistiqueAvecPreuvesData,
  ChangeStatutOperationLogistiqueData,
  MarquerRealiseeData,
  AddPreuvesToOperationData,
  RemovePreuvesFromOperationData,
  OperationLogistiqueStatistics,
} from "../types/operation-logistique"
import type { RequestConfig } from "../types"

class OperationLogistiqueService extends BaseService<
  OperationLogistique,
  CreateOperationLogistiqueData,
  UpdateOperationLogistiqueData
> {
  constructor() {
    super(ENDPOINTS.OPERATION_LOGISTIQUES.BASE)
  }

  async getAll(config?: RequestConfig): Promise<OperationLogistique[]> {
    const response = await this.customRequest<{
      message: string
      data: {
        data: OperationLogistique[]
        meta: any
        links: any
      }
    }>("GET", this.baseEndpoint, undefined, config)
    console.log("[v0] Operations API response:", response)
    return response.data.data
  }

  async getById(id: number, config?: RequestConfig): Promise<OperationLogistique> {
    const response = await this.customRequest<{ message: string; data: OperationLogistique }>(
      "GET",
      `${this.baseEndpoint}/${id}`,
      undefined,
      config,
    )
    return response.data
  }

  async create(data: CreateOperationLogistiqueData, config?: RequestConfig): Promise<OperationLogistique> {
    const response = await this.customRequest<{ message: string; data: OperationLogistique }>(
      "POST",
      this.baseEndpoint,
      data,
      config,
    )
    return response.data
  }

  async update(id: number, data: UpdateOperationLogistiqueData, config?: RequestConfig): Promise<OperationLogistique> {
    const response = await this.customRequest<{ message: string; data: OperationLogistique }>(
      "PUT",
      `${this.baseEndpoint}/${id}`,
      data,
      config,
    )
    return response.data
  }

  async delete(id: number, config?: RequestConfig): Promise<void> {
    await this.customRequest<{ message: string }>("DELETE", `${this.baseEndpoint}/${id}`, undefined, config)
  }

  async getAllWithFilters(filters: {
    page?: number
    limit?: number
    type?: string
    statut?: string
    dateDebut?: string
    dateFin?: string
    enRetard?: boolean
    tourneeId?: number
  }): Promise<OperationLogistique[]> {
    const params = new URLSearchParams()
    if (filters.page) params.append("page", filters.page.toString())
    if (filters.limit) params.append("limit", filters.limit.toString())
    if (filters.type) params.append("type", filters.type)
    if (filters.statut) params.append("statut", filters.statut)
    if (filters.dateDebut) params.append("dateDebut", filters.dateDebut)
    if (filters.dateFin) params.append("dateFin", filters.dateFin)
    if (filters.enRetard !== undefined) params.append("enRetard", filters.enRetard.toString())
    if (filters.tourneeId) params.append("tourneeId", filters.tourneeId.toString())

    const endpoint = params.toString() ? `${this.baseEndpoint}?${params.toString()}` : this.baseEndpoint

    const response = await this.customRequest<{
      message: string
      data: {
        data: OperationLogistique[]
        meta: any
        links: any
      }
    }>("GET", endpoint)
    console.log("[v0] Operations API filtered response:", response)
    return response.data.data
  }

  async createAvecPreuves(data: CreateOperationLogistiqueAvecPreuvesData): Promise<OperationLogistique> {
    const response = await this.customRequest<{ message: string; data: OperationLogistique }>(
      "POST",
      ENDPOINTS.OPERATION_LOGISTIQUES.CREATE_WITH_PREUVES,
      data,
    )
    return response.data
  }

  async changeStatus(id: number, data: ChangeStatutOperationLogistiqueData): Promise<OperationLogistique> {
    const response = await this.customRequest<{ message: string; data: OperationLogistique }>(
      "PATCH",
      ENDPOINTS.OPERATION_LOGISTIQUES.CHANGE_STATUS(id),
      data,
    )
    return response.data
  }

  async marquerRealisee(id: number, data?: MarquerRealiseeData): Promise<OperationLogistique> {
    const response = await this.customRequest<{ message: string; data: OperationLogistique }>(
      "PATCH",
      ENDPOINTS.OPERATION_LOGISTIQUES.MARK_DONE(id),
      data || {},
    )
    return response.data
  }

  async addPreuves(id: number, data: AddPreuvesToOperationData): Promise<any> {
    const response = await this.customRequest<{ message: string; data: any }>(
      "POST",
      ENDPOINTS.OPERATION_LOGISTIQUES.ADD_PREUVES(id),
      data,
    )
    return response.data
  }

  async removePreuves(id: number, data: RemovePreuvesFromOperationData): Promise<void> {
    await this.customRequest<{ message: string }>("DELETE", ENDPOINTS.OPERATION_LOGISTIQUES.REMOVE_PREUVES(id), data)
  }

  async getOperationsEnRetard(): Promise<OperationLogistique[]> {
    const response = await this.customRequest<{ message: string; data: OperationLogistique[] }>(
      "GET",
      ENDPOINTS.OPERATION_LOGISTIQUES.EN_RETARD,
    )
    return response.data
  }

  async getStatistics(filters?: {
    dateDebut?: string
    dateFin?: string
    type?: string
  }): Promise<OperationLogistiqueStatistics> {
    const params = new URLSearchParams()
    if (filters?.dateDebut) params.append("dateDebut", filters.dateDebut)
    if (filters?.dateFin) params.append("dateFin", filters.dateFin)
    if (filters?.type) params.append("type", filters.type)

    const endpoint = params.toString()
      ? `${ENDPOINTS.OPERATION_LOGISTIQUES.STATISTICS}?${params.toString()}`
      : ENDPOINTS.OPERATION_LOGISTIQUES.STATISTICS

    const response = await this.customRequest<{ message: string; data: OperationLogistiqueStatistics }>("GET", endpoint)
    return response.data
  }
}

export const operationLogistiqueService = new OperationLogistiqueService()
