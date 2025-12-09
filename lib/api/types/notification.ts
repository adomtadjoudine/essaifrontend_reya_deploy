/**
 * Types pour les notifications - Frontend
 */

export interface Notification {
  id: number
  titre: string
  message: string
  type: "Commande" | "Paiement" | "Service" | "Promotion" | "Autre"
  canal: "app" | "email" | "sms" | "push"
  priorite: "basse" | "normal" | "haute" | "critique"
  statut: "non_lue" | "lue" | "supprimee"
  destinataireId: number
  emetteId?: number
  lien?: string
  donnees?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface NotificationResponse {
  success: boolean
  message: string
  data?: Notification | Notification[]
  meta?: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    hasPages: boolean
  }
}

export interface NotificationStats {
  nonLuesCount: number
  totalCount: number
}

export interface NotificationCountByType {
  type: string
  count: number
}

export interface CreateNotificationData {
  titre: string
  message: string
  type: Notification["type"]
  canal: Notification["canal"]
  priorite: Notification["priorite"]
  destinataireId?: number
  lien?: string
  donnees?: Record<string, any>
}
