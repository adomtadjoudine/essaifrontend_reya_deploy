/**
 * Types pour les créneaux de collecte
 */

export interface CreneauCollecte {
  id: number
  jourSemaine: string
  heureDebut: string
  heureFin: string
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  estActif: boolean
  isArchive: boolean
  dateArchive: string | null
}

export interface CreateCreneauCollecteData {
  jourSemaine: string
  heureDebut: string
  heureFin: string
}

export interface UpdateCreneauCollecteData {
  jourSemaine?: string
  heureDebut?: string
  heureFin?: string
}
