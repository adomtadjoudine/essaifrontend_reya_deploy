/**
 * Types pour les tarifs kilométriques
 */

export interface TarifKilometrique {
  id: number
  prixParKm: number
  distanceMin: number | null
  distanceMax: number | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  estActif: boolean
  isArchive: boolean
  dateArchive: string | null
}

export interface CreateTarifKilometriqueData {
  prixParKm: number
  distanceMin?: number | null
  distanceMax?: number | null
}

export interface UpdateTarifKilometriqueData {
  prixParKm?: number
  distanceMin?: number | null
  distanceMax?: number | null
}
