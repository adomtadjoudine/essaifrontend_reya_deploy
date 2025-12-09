// Types pour l'API DelaiLivraison
export interface DelaiLivraison {
  id: number
  nom: string
  delaiHeures: string
  description: string | null
  prix: number | null
  remise: number | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  estActif: boolean
  isArchive: boolean
  dateArchive: string | null
  commandes?: Array<{
    id: number
    dateCommande: string
    statut: string
    montantTotal: number
    clientId?: number
    client?: {
      id: number
      nom: string
      email: string
    }
  }>
}

export interface CreateDelaiLivraisonData {
  nom: string
  delaiHeures: string
  description?: string | null
  prix?: number
  remise?: number
}

export interface UpdateDelaiLivraisonData {
  nom?: string
  delaiHeures?: string
  description?: string | null
  prix?: number
  remise?: number
}

export interface DelaiLivraisonStatistiques {
  delaiLivraison: DelaiLivraison
  statistiques: {
    nombreCommandes: number
    chiffreAffaires: number
    commandesParStatut: Record<string, number>
  }
}

export interface DelaiLivraisonApiResponse {
  message: string
  data: DelaiLivraison[]
}

export interface DelaiLivraisonSingleApiResponse {
  message: string
  data: DelaiLivraison
}

export interface DelaiLivraisonStatistiquesApiResponse {
  message: string
  data: DelaiLivraisonStatistiques
}
