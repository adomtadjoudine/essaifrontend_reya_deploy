export interface Client {
  id: number
  codeClient: string
  estBloque: boolean
  dateBlocage: string | null
  raisonBlocage: string | null
  nombreCommandeTotal: number
  montantTotalDepense: number
  userId: number
  estActif: boolean
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  isArchive: boolean
  dateArchive: string | null
  user: {
    id: number
    nom: string | null
    prenom: string | null
    fullName: string | null
    email: string
    telephone: string
    typeCompte: string
    emailVerified: boolean
    telephoneVerified: boolean
    derniereConnexion: string | null
    isActive: boolean
    isArchive: boolean
    createdAt: string
    updatedAt: string
  }
}

export interface ClientsResponse {
  success: boolean
  data: {
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
    data: Client[]
  }
}

export interface ClientResponse {
  success: boolean
  data: Client
}

export interface ToggleActiveResponse {
  success: boolean
  message: string
  data: Client
}
