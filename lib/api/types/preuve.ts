// Types pour les preuves
import type { OperationLogistique } from "./operation-logistique"

export interface FichierPreuve {
  nom: string
  url: string
  type: string
  taille?: number
  extension?: string
}

export interface Preuve {
  id: number
  typePreuve: string
  fichiers: FichierPreuve[]
  operationLogistiqueId: number
  operationLogistique?: OperationLogistique
  createdAt: string
  updatedAt: string
}

export interface CreatePreuveData {
  typePreuve: string
  fichiers: FichierPreuve[]
  operationLogistiqueId: number
}

export interface UpdatePreuveData {
  typePreuve?: string
  fichiers?: FichierPreuve[]
  operationLogistiqueId?: number
}

export interface UploadPreuveData {
  typePreuve: string
  fichiers: File[]
  operationLogistiqueId: number
}

export interface PreuveStatistics {
  nombreTotal: number
  preuvesParType: Record<string, number>
  preuvesImages: number
  preuvesAvecFichiers: number
  nombreTotalFichiers: number
  fichiersParType: Record<string, number>
}

export interface PaginatedResponse<T> {
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
    firstPageUrl: string
    lastPageUrl: string
    nextPageUrl: string | null
    previousPageUrl: string | null
  }
  data: T[]
}
