// Types pour les opérations logistiques
import type { Tournee } from "./tournee"
import type { Commande } from "./commande"
import type { Preuve } from "./preuve"

export interface OperationLogistique {
  id: number
  type: string
  dateReelle: string | null
  datePrevue: string
  statut: string
  tourneeId: number
  commandeId: number
  tournee?: Tournee
  commande?: Commande
  preuves?: Preuve[]
  createdAt: string
  updatedAt: string
}

export interface CreateOperationLogistiqueData {
  type: string
  datePrevue: Date | string
  dateReelle?: Date | string | null
  statut?: string
  tourneeId: number
  commandeId: number
  preuvesIds?: number[]
}

export interface CreateOperationLogistiqueAvecPreuvesData {
  type: string
  datePrevue: Date | string
  dateReelle?: Date | string | null
  statut?: string
  tourneeId: number
  commandeId: number
  preuves?: Array<{
    typePreuve: string
    fichiers: Array<{
      nom: string
      url: string
      type: string
      taille?: number
      extension?: string
    }>
  }>
  preuvesIds?: number[]
}

export interface UpdateOperationLogistiqueData {
  type?: string
  datePrevue?: Date | string
  dateReelle?: Date | string | null
  statut?: string
  tourneeId?: number
  commandeId?: number
}

export interface ChangeStatutOperationLogistiqueData {
  statut: string
}

export interface MarquerRealiseeData {
  dateReelle?: Date | string
}

export interface AddPreuvesToOperationData {
  preuvesIds: number[]
}

export interface RemovePreuvesFromOperationData {
  preuvesIds: number[]
}

export interface AjouterPreuvesInlineData {
  preuves: Array<{
    typePreuve: string
    fichiers: Array<{
      nom: string
      url: string
      type: string
      taille?: number
      extension?: string
    }>
  }>
}

export interface OperationLogistiqueStatistics {
  nombreTotal: number
  operationsParType: Record<string, number>
  operationsParStatut: Record<string, number>
  operationsEnRetard: number
  tauxRealisation: number
}
