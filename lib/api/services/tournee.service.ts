// Service pour la gestion des tournées
import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type { Tournee, CreateTourneeData, UpdateTourneeData, TourneeStatistics } from "../types/tournee"

class TourneeService extends BaseService<Tournee, CreateTourneeData, UpdateTourneeData> {
  constructor() {
    super(ENDPOINTS.TOURNEES.BASE)
  }

  async getAll(): Promise<Tournee[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Tournee[]
        meta: any
      }
    }>("GET", "/api/admin/tournees")

    console.log("[v0] Tournee getAll response:", response)
    return response.data.data
  }

  async getAllWithFilters(filters: {
    page?: number
    limit?: number
    search?: string
    statut?: string
    livreur_id?: number
    date_debut?: string
    date_fin?: string
  }): Promise<Tournee[]> {
    const params = new URLSearchParams()
    if (filters.page) params.append("page", filters.page.toString())
    if (filters.limit) params.append("limit", filters.limit.toString())
    if (filters.search) params.append("search", filters.search)
    if (filters.statut) params.append("statut", filters.statut)
    if (filters.livreur_id) params.append("livreur_id", filters.livreur_id.toString())
    if (filters.date_debut) params.append("date_debut", filters.date_debut)
    if (filters.date_fin) params.append("date_fin", filters.date_fin)

    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Tournee[]
        meta: any
      }
    }>("GET", `/api/admin/tournees?${params.toString()}`)

    console.log("[v0] Tournee getAllWithFilters response:", response)
    return response.data.data
  }

  async getById(id: number): Promise<Tournee> {
    const response = await this.customRequest<{ success: boolean; data: Tournee }>("GET", `/api/admin/tournees/${id}`)
    return response.data
  }

  async create(data: CreateTourneeData): Promise<Tournee> {
    const response = await this.customRequest<{ success: boolean; message: string; data: Tournee }>(
      "POST",
      "/api/admin/tournees",
      data,
    )
    return response.data
  }

  async update(id: number, data: UpdateTourneeData): Promise<Tournee> {
    const response = await this.customRequest<{ success: boolean; message: string; data: Tournee }>(
      "PUT",
      `/api/admin/tournees/${id}`,
      data,
    )
    return response.data
  }

  async delete(id: number): Promise<void> {
    await this.customRequest<{ success: boolean; message: string }>("DELETE", `/api/admin/tournees/${id}`)
  }

  async demarrer(id: number): Promise<Tournee> {
    const response = await this.customRequest<{ success: boolean; message: string; data: Tournee }>(
      "POST",
      `/api/tournees/${id}/demarrer`,
      {},
    )
    return response.data
  }

  async terminer(id: number): Promise<Tournee> {
    const response = await this.customRequest<{ success: boolean; message: string; data: Tournee }>(
      "POST",
      `/api/tournees/${id}/terminer`,
      {},
    )
    return response.data
  }

  async annuler(id: number): Promise<Tournee> {
    const response = await this.customRequest<{ success: boolean; message: string; data: Tournee }>(
      "POST",
      `/api/admin/tournees/${id}/annuler`,
      {},
    )
    return response.data
  }

  async ajouterOperations(tourneeId: number, commandeIds: number[]): Promise<any> {
    const response = await this.customRequest<{ success: boolean; message: string; data: any }>(
      "POST",
      `/api/admin/tournees/${tourneeId}/operations`,
      { commandeIds },
    )
    return response.data
  }

  async getStatistics(filters?: {
    date_debut?: string
    date_fin?: string
    livreur_id?: number
  }): Promise<TourneeStatistics> {
    const params = new URLSearchParams()
    if (filters?.date_debut) params.append("date_debut", filters.date_debut)
    if (filters?.date_fin) params.append("date_fin", filters.date_fin)
    if (filters?.livreur_id) params.append("livreur_id", filters.livreur_id.toString())

    const endpoint = `/api/admin/tournees/statistiques${params.toString() ? `?${params.toString()}` : ""}`

    try {
      const response = await this.customRequest<{ success: boolean; data: TourneeStatistics }>("GET", endpoint)
      return response.data
    } catch (error) {
      // Si l'endpoint n'existe pas encore, retourner des stats par défaut
      console.warn("[v0] Statistiques endpoint not available:", error)
      return {
        nombreTotal: 0,
        tourneesParStatut: {},
      }
    }
  }
}

export const tourneeService = new TourneeService()
