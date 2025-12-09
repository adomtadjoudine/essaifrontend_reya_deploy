import type { Tournee } from "./tournee"

export interface Livreur {
  id: number
  matricule: string
  typeVehicule: string
  immatriculationVehicule?: string | null
  telephoneUrgence?: string | null
  estDisponible: boolean
  nombreOperations: number
  userId: number
  user?: {
    id: number
    nom: string
    prenom: string
    fullName: string
    email: string
    telephone: string
    typeCompte: "livreur"
    isActive: boolean
  }
  estActif: boolean
  isArchive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  updatedBy?: string | null
  dateArchive?: string | null
  // Statistiques du livreur (chargées optionnellement)
  statistiques?: {
    totalTournees: number
    tourneesCompletees: number
    totalOperations: number
    tauxReussite: number
  }
  tournees?: Tournee[]
}

export interface CreateLivreurData {
  nom: string
  prenom: string
  email: string
  telephone: string
  password: string
  typeVehicule: string
  immatriculationVehicule?: string
  telephoneUrgence?: string
}

export interface UpdateLivreurData {
  nom?: string
  prenom?: string
  email?: string
  telephone?: string
  typeVehicule?: string
  immatriculationVehicule?: string
  telephoneUrgence?: string
}

export interface ToggleDisponibiliteData {
  estDisponible: boolean
}

export interface LivreurStatistics {
  nombreTotal: number
  disponibles: number
  enTournee: number
  tauxReussiteMoyen: number
}
