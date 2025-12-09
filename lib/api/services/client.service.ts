import { apiClient } from "../client"
import { ENDPOINTS } from "../constants/endpoints"
import type { ClientsResponse, ClientResponse, ToggleActiveResponse } from "../types/client"

export const clientService = {
  /**
   * Récupère la liste des clients (utilisateurs avec type_compte = 'client')
   */
  async getClients(page = 1, limit = 10, search = ""): Promise<ClientsResponse> {
    console.log("[v0] Fetching clients list...", { page, limit, search })
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      type_compte: "client",
    })

    if (search) {
      params.append("search", search)
    }

    const response = await apiClient.get<ClientsResponse>(`${ENDPOINTS.USERS.BASE}?${params.toString()}`)
    console.log("[v0] Clients list response:", response)
    return response
  },

  /**
   * Récupère les détails d'un client spécifique
   */
  async getClient(id: number): Promise<ClientResponse> {
    console.log("[v0] Fetching client details...", { id })
    const response = await apiClient.get<ClientResponse>(ENDPOINTS.USERS.BY_ID(id))
    console.log("[v0] Client details response:", response)
    return response
  },

  /**
   * Active ou désactive un client
   */
  async toggleActive(id: number): Promise<ToggleActiveResponse> {
    console.log("[v0] Toggling client active status...", { id })
    const response = await apiClient.patch<ToggleActiveResponse>(ENDPOINTS.USERS.TOGGLE_ACTIVE(id))
    console.log("[v0] Toggle active response:", response)
    return response
  },

  /**
   * Archive un client (soft delete)
   */
  async archiveClient(id: number): Promise<{ success: boolean; message: string }> {
    console.log("[v0] Archiving client...", { id })
    const response = await apiClient.delete<{ success: boolean; message: string }>(ENDPOINTS.USERS.BY_ID(id))
    console.log("[v0] Archive client response:", response)
    return response
  },
}
