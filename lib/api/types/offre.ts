export interface Offre {
  id: number
  prix: number
  serviceId: number
  service?: {
    id: number
    nom: string
    description?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateOffreData {
  prix: number
  serviceId: number
}

export interface UpdateOffreData {
  prix?: number
  serviceId?: number
}
