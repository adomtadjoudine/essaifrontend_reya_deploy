// Types pour les tournées
import type { Livreur } from "./livreur"
import type { OperationLogistique } from "./operation-logistique"

export interface Tournee {
  id: number
  numeroTournee: string
  date: string
  dateHeureDebut: string
  dateHeureFin: string | null
  statut: "planifiee" | "en_cours" | "completee" | "annulee"
  livreurId: number
  livreur?: Livreur
  operations?: OperationLogistique[] // Backend utilise "operations" pas "operationsLogistiques"
  createdAt: string
  updatedAt: string
  estActif: boolean
  isArchive: boolean
}

export interface CreateTourneeData {
  date: string
  dateHeureDebut: string
  livreurId: number
  commandeIds?: number[] // Pour compatibilité
  operations?: Array<{
    commandeId: number
    typeOperation: "collecte" | "livraison"
  }>
}

export interface UpdateTourneeData {
  date?: string
  dateHeureDebut?: string
  livreurId?: number
}

export interface AjouterOperationsData {
  commandeIds: number[]
}

export interface TourneeStatistics {
  nombreTotal: number
  tourneesParStatut: Record<string, number>
  tourneesParLivreur?: Record<number, number>
}
