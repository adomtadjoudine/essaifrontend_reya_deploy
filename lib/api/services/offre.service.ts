import type { ApiResponse } from "../types"
import type { Offre } from "../types/offre"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://a96c7bykrwf.preview.hosting-ik.com/"

export class OffreService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  static async getAll(): Promise<Offre[]> {
    console.log("[v0] OffreService.getAll - Début de l'appel API")
    try {
      const response = await this.request<ApiResponse<Offre[]>>("/offres")
      console.log("[v0] OffreService.getAll - Réponse API:", response)
      return response.data || []
    } catch (error) {
      console.error("[v0] OffreService.getAll - Erreur:", error)
      throw error
    }
  }

  static async getById(id: number): Promise<Offre> {
    console.log("[v0] OffreService.getById - ID:", id)
    try {
      const response = await this.request<ApiResponse<Offre>>(`/offres/${id}`)
      console.log("[v0] OffreService.getById - Réponse:", response)
      return response.data
    } catch (error) {
      console.error("[v0] OffreService.getById - Erreur:", error)
      throw error
    }
  }

  static async create(data: Partial<Offre>): Promise<Offre> {
    console.log("[v0] OffreService.create - Données:", data)
    try {
      const apiData = {
        prix: data.prix,
        service_id: data.serviceId,
      }
      const response = await this.request<ApiResponse<Offre>>("/offres", {
        method: "POST",
        body: JSON.stringify(apiData),
      })
      console.log("[v0] OffreService.create - Réponse:", response)
      return response.data
    } catch (error) {
      console.error("[v0] OffreService.create - Erreur:", error)
      throw error
    }
  }

  static async update(id: number, data: Partial<Offre>): Promise<Offre> {
    console.log("[v0] OffreService.update - ID:", id, "Données:", data)
    try {
      const apiData = {
        prix: data.prix,
        service_id: data.serviceId,
      }
      const response = await this.request<ApiResponse<Offre>>(`/offres/${id}`, {
        method: "PUT",
        body: JSON.stringify(apiData),
      })
      console.log("[v0] OffreService.update - Réponse:", response)
      return response.data
    } catch (error) {
      console.error("[v0] OffreService.update - Erreur:", error)
      throw error
    }
  }

  static async delete(id: number): Promise<void> {
    console.log("[v0] OffreService.delete - ID:", id)
    try {
      await this.request<ApiResponse<void>>(`/offres/${id}`, {
        method: "DELETE",
      })
      console.log("[v0] OffreService.delete - Suppression réussie")
    } catch (error) {
      console.error("[v0] OffreService.delete - Erreur:", error)
      throw error
    }
  }
}
