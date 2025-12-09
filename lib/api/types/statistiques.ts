// Types for statistics API responses

export interface StatistiquesGenerales {
  nombreCommandes: number
  chiffreAffaires: number
  panierMoyen: number
}

export interface TopService {
  nom: string
  quantite: number
  chiffreAffaires: number
}

export interface EvolutionMensuelle {
  mois: string
  commandes: number
  chiffreAffaires: number
}

export interface TableauDeBordData {
  periode: {
    debut?: string
    fin?: string
  }
  statistiquesGenerales: StatistiquesGenerales
  repartitionStatuts: Record<string, number>
  topServices: TopService[]
  delaisPopulaires: Record<string, number>
  evolutionMensuelle: EvolutionMensuelle[]
}

export interface TableauDeBordResponse {
  message: string
  data: TableauDeBordData
}

export interface ClientActif {
  client: {
    id: number
    nom: string
    email: string
  }
  nombreCommandes: number
  chiffreAffaires: number
  panierMoyen: number
  dernireCommande: string
}

export interface ClientsActifsResponse {
  message: string
  data: ClientActif[]
}

export interface DelaiPerformance {
  delai: {
    id: number
    nom: string
    delaiHeures: number
    prixSupplement: number
    remise: number
  }
  performance: {
    nombreCommandes: number
    chiffreAffaires: number
    panierMoyen: number
    tauxReussite: number
    commandesParStatut: Record<string, number>
  }
}

export interface PerformanceDelaisResponse {
  message: string
  data: DelaiPerformance[]
}
