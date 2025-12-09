import { apiClient } from "../client"
import { ENDPOINTS } from "../constants/endpoints"
import type { TableauDeBordResponse, ClientsActifsResponse, PerformanceDelaisResponse } from "../types/statistiques"

class StatistiquesService {
  async getTableauDeBord(dateDebut?: string, dateFin?: string): Promise<TableauDeBordResponse> {
    const params = new URLSearchParams()
    if (dateDebut) params.append("dateDebut", dateDebut)
    if (dateFin) params.append("dateFin", dateFin)

    const endpoint = params.toString()
      ? `${ENDPOINTS.STATISTIQUES.TABLEAU_DE_BORD}?${params.toString()}`
      : ENDPOINTS.STATISTIQUES.TABLEAU_DE_BORD

    console.log("[v0] Fetching tableau de bord from:", endpoint)
    const response = await apiClient.get<TableauDeBordResponse>(endpoint)
    console.log("[v0] Tableau de bord response:", response)
    return response
  }

  async getClientsActifs(limite = 10): Promise<ClientsActifsResponse> {
    const endpoint = `${ENDPOINTS.STATISTIQUES.CLIENTS_ACTIFS}?limite=${limite}`
    console.log("[v0] Fetching clients actifs from:", endpoint)
    const response = await apiClient.get<ClientsActifsResponse>(endpoint)
    console.log("[v0] Clients actifs response:", response)
    return response
  }

  async getPerformanceDelais(): Promise<PerformanceDelaisResponse> {
    console.log("[v0] Fetching performance delais from:", ENDPOINTS.STATISTIQUES.PERFORMANCE_DELAIS)
    const response = await apiClient.get<PerformanceDelaisResponse>(ENDPOINTS.STATISTIQUES.PERFORMANCE_DELAIS)
    console.log("[v0] Performance delais response:", response)
    return response
  }
}

export const statistiquesService = new StatistiquesService()
