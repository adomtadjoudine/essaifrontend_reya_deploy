// Service pour la gestion des paiements
import { BaseService } from "./base.service"
import type {
  Paiement,
  CreatePaiementData,
  UpdatePaiementData,
  RemboursementData,
  PaginatedPaiements,
} from "../types/paiement"
import type { RequestConfig } from "../types"

export class PaiementService extends BaseService<Paiement, CreatePaiementData, UpdatePaiementData> {
  constructor() {
    super("/api/admin/paiements")
  }

  /**
   * Récupère tous les paiements avec pagination et filtres
   */
  async getAll(
    params?: {
      page?: number
      limit?: number
      search?: string
      statut?: string
      methode?: string
      commandeId?: number
    },
    config?: RequestConfig,
  ): Promise<PaginatedPaiements> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.search) queryParams.append("search", params.search)
    if (params?.statut) queryParams.append("statut", params.statut)
    if (params?.methode) queryParams.append("methode", params.methode)
    if (params?.commandeId) queryParams.append("commande_id", params.commandeId.toString())

    const endpoint = queryParams.toString() ? `${this.baseEndpoint}?${queryParams.toString()}` : this.baseEndpoint

    const response = await this.customRequest<{
      success: boolean
      data: PaginatedPaiements
    }>("GET", endpoint, undefined, config)

    return response.data
  }

  /**
   * Récupère un paiement par son ID
   */
  async getById(id: number, config?: RequestConfig): Promise<Paiement> {
    const response = await this.customRequest<{
      success: boolean
      data: Paiement
    }>("GET", `${this.baseEndpoint}/${id}`, undefined, config)
    return response.data
  }

  /**
   * Récupère les paiements d'une commande
   */
  async getByCommande(commandeId: number, config?: RequestConfig): Promise<Paiement[]> {
    const response = await this.customRequest<{
      success: boolean
      data: Paiement[]
    }>("GET", `/api/commandes/${commandeId}/paiements`, undefined, config)
    return response.data
  }

  /**
   * Crée un nouveau paiement
   */
  async create(data: CreatePaiementData, config?: RequestConfig): Promise<Paiement> {
    const response = await this.customRequest<{
      success: boolean
      message: string
      data: Paiement
    }>("POST", "/api/paiements", data, config)
    return response.data
  }

  /**
   * Met à jour un paiement
   */
  async update(id: number, data: UpdatePaiementData, config?: RequestConfig): Promise<Paiement> {
    const response = await this.customRequest<{
      success: boolean
      message: string
      data: Paiement
    }>("PUT", `${this.baseEndpoint}/${id}`, data, config)
    return response.data
  }

  /**
   * Valide un paiement (admin)
   */
  async valider(id: number, config?: RequestConfig): Promise<Paiement> {
    const response = await this.customRequest<{
      success: boolean
      message: string
      data: Paiement
    }>("POST", `${this.baseEndpoint}/${id}/valider`, undefined, config)
    return response.data
  }

  /**
   * Rejette un paiement (admin)
   */
  async rejeter(id: number, config?: RequestConfig): Promise<Paiement> {
    const response = await this.customRequest<{
      success: boolean
      message: string
      data: Paiement
    }>("POST", `${this.baseEndpoint}/${id}/rejeter`, undefined, config)
    return response.data
  }

  /**
   * Rembourse un paiement (admin)
   */
  async rembourser(id: number, data: RemboursementData, config?: RequestConfig): Promise<Paiement> {
    const response = await this.customRequest<{
      success: boolean
      message: string
      data: Paiement
    }>("POST", `${this.baseEndpoint}/${id}/rembourser`, data, config)
    return response.data
  }

  /**
   * Archive un paiement (admin)
   */
  async delete(id: number, config?: RequestConfig): Promise<void> {
    await this.customRequest<{
      success: boolean
      message: string
    }>("DELETE", `${this.baseEndpoint}/${id}`, undefined, config)
  }
}

// Instance singleton du service
export const paiementService = new PaiementService()
