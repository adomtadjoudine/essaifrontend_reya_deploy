/**
 * Types pour les statuts de commande
 */

export interface Statut {
  id: number
  nom: string
  description: string | null
  estActif: boolean
  isArchive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateStatutData {
  nom: string
  description?: string
}

export interface UpdateStatutData {
  nom?: string
  description?: string
}
