// Service pour la gestion des commandes
import { BaseService } from "./base.service"
import type {
  Commande,
  CreateCommandeData,
  UpdateCommandeData,
  ChangeStatutCommandeData,
  AddLigneCommandeData,
  CommandeStatistics,
  PaginationMeta,
} from "../types/commande"
import type { RequestConfig } from "../types"

export class CommandeService extends BaseService<Commande, CreateCommandeData, UpdateCommandeData> {
  constructor() {
    super("/api/commandes")
  }

  /**
   * Récupère toutes les commandes (admin)
   */
  async getAll(config?: RequestConfig): Promise<Commande[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Commande[]
        meta: any
      }
    }>("GET", "/api/admin/commandes", undefined, config)
    console.log("[v0] Commandes API response:", response)
    return response.data.data
  }

  /**
   * Récupère une commande par son ID
   */
  async getById(id: number, config?: RequestConfig): Promise<Commande> {
    const response = await this.customRequest<{ success: boolean; data: Commande }>(
      "GET",
      `/api/commandes/${id}`,
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Crée une nouvelle commande
   */
  async create(data: CreateCommandeData, config?: RequestConfig): Promise<Commande> {
    const response = await this.customRequest<{ success: boolean; message: string; data: Commande }>(
      "POST",
      "/api/commandes",
      data,
      config,
    )
    return response.data
  }

  /**
   * Met à jour une commande (admin)
   */
  async update(id: number, data: UpdateCommandeData, config?: RequestConfig): Promise<Commande> {
    const response = await this.customRequest<{ success: boolean; message: string; data: Commande }>(
      "PUT",
      `/api/admin/commandes/${id}`,
      data,
      config,
    )
    return response.data
  }

  /**
   * Archive une commande (admin)
   */
  async delete(id: number, config?: RequestConfig): Promise<void> {
    await this.customRequest<{ success: boolean; message: string }>(
      "DELETE",
      `/api/admin/commandes/${id}`,
      undefined,
      config,
    )
  }

  /**
   * Change le statut d'une commande (admin)
   */
  async changeStatus(id: number, data: ChangeStatutCommandeData, config?: RequestConfig): Promise<void> {
    await this.customRequest<{ success: boolean; message: string }>(
      "POST",
      `/api/admin/commandes/${id}/changer-statut`,
      data,
      config,
    )
  }

  /**
   * Récupère l'historique des statuts d'une commande
   */
  async getHistoriqueStatuts(id: number, config?: RequestConfig): Promise<any[]> {
    const response = await this.customRequest<{ success: boolean; data: any[] }>(
      "GET",
      `/api/commandes/${id}/historique-statuts`,
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Ajoute une ligne à une commande
   */
  async addLine(id: number, data: AddLigneCommandeData, config?: RequestConfig): Promise<any> {
    const response = await this.customRequest<{ success: boolean; message: string; data: any }>(
      "POST",
      `/api/commandes/${id}/lignes`,
      data,
      config,
    )
    return response.data
  }

  /**
   * Obtient les statistiques des commandes (admin)
   */
  async getStatistics(
    filters?: { dateDebut?: string; dateFin?: string },
    config?: RequestConfig,
  ): Promise<CommandeStatistics> {
    const params = new URLSearchParams()
    if (filters?.dateDebut) params.append("date_debut", filters.dateDebut)
    if (filters?.dateFin) params.append("date_fin", filters.dateFin)

    const endpoint = params.toString()
      ? `/api/admin/commandes/statistiques?${params.toString()}`
      : `/api/admin/commandes/statistiques`

    const response = await this.customRequest<{ success: boolean; data: any }>("GET", endpoint, undefined, config)

    // Transformer les données pour correspondre au format attendu
    return {
      nombreTotal: response.data.totalCommandes || 0,
      chiffreAffaires: response.data.montantTotal || 0,
      commandesParStatut: response.data.commandesParStatut || {},
      montantMoyen: response.data.montantTotal / (response.data.totalCommandes || 1),
    }
  }

  /**
   * Obtient les commandes avec filtres (admin)
   */
  async getAllWithFilters(
    filters?: {
      page?: number
      limit?: number
      search?: string
      statut_id?: string
      client_id?: string
      est_urgent?: string
    },
    config?: RequestConfig,
  ): Promise<Commande[]> {
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (filters?.search) params.append("search", filters.search)
    if (filters?.statut_id) params.append("statut_id", filters.statut_id)
    if (filters?.client_id) params.append("client_id", filters.client_id)
    if (filters?.est_urgent) params.append("est_urgent", filters.est_urgent)

    const endpoint = params.toString() ? `/api/admin/commandes?${params.toString()}` : `/api/admin/commandes`

    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Commande[]
        meta: any
      }
    }>("GET", endpoint, undefined, config)
    console.log("[v0] Commandes API filtered response:", response)
    return response.data.data
  }

  /**
   * Récupère toutes les commandes avec pagination (admin)
   */
  async getAllPaginated(
    page = 1,
    limit = 10,
    filters?: {
      search?: string
      statut_id?: string
      client_id?: string
      est_urgent?: string
    },
    config?: RequestConfig,
  ): Promise<{ data: Commande[]; meta: PaginationMeta }> {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("limit", limit.toString())
    if (filters?.search) params.append("search", filters.search)
    if (filters?.statut_id) params.append("statut_id", filters.statut_id)
    if (filters?.client_id) params.append("client_id", filters.client_id)
    if (filters?.est_urgent) params.append("est_urgent", filters.est_urgent)

    const endpoint = `/api/admin/commandes?${params.toString()}`

    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Commande[]
        meta: PaginationMeta
      }
    }>("GET", endpoint, undefined, config)

    console.log("[v0] Commandes paginated response:", response.data.data)
    console.log("[v0] Pagination meta:", response.data.meta)

    return {
      data: response.data.data,
      meta: response.data.meta,
    }
  }
}

// Instance singleton du service
export const commandeService = new CommandeService()
