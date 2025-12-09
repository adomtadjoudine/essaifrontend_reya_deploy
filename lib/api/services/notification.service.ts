/**
 * Service de gestion des notifications
 * Gère la communication avec l'API backend pour les notifications
 */

import { apiClient } from "../client"
import { ENDPOINTS } from "../constants/endpoints"
import type { NotificationResponse, NotificationStats } from "../types/notification"

class NotificationService {
  /**
   * Récupère les notifications de l'utilisateur connecté avec pagination
   */
  async getMyNotifications(
    page = 1,
    limit = 20,
    statut?: string,
    type?: string,
    canal?: string,
    priorite?: string,
  ): Promise<NotificationResponse> {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("limit", limit.toString())

    if (statut) params.append("statut", statut)
    if (type) params.append("type", type)
    if (canal) params.append("canal", canal)
    if (priorite) params.append("priorite", priorite)

    console.log("[v0] NotificationService: Calling", `${ENDPOINTS.NOTIFICATIONS.MOI}?${params.toString()}`)

    const response = await apiClient.get<any>(`${ENDPOINTS.NOTIFICATIONS.MOI}?${params.toString()}`)

    console.log("[v0] NotificationService: Response received", response)

    if (response.data?.notifications) {
      return {
        success: true,
        message: response.message || "Notifications récupérées",
        data: response.data.notifications,
        meta: response.data.pagination,
      }
    }

    // Fallback si structure différente
    return response as NotificationResponse
  }

  /**
   * Obtient le nombre de notifications non lues
   */
  async getNonLuesCount(): Promise<NotificationStats> {
    console.log("[v0] NotificationService: Calling unread count")
    const response = await apiClient.get<any>(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT)

    console.log("[v0] NotificationService: Unread count response", response)

    if (response.data?.count !== undefined) {
      return {
        nonLuesCount: response.data.count,
        totalCount: response.data.count,
      }
    }

    return response as NotificationStats
  }

  /**
   * Marque une notification comme lue/non lue/supprimée
   */
  async markNotificationAs(
    notificationId: number,
    statut: "lue" | "non_lue" | "supprimee",
  ): Promise<NotificationResponse> {
    return apiClient.patch<NotificationResponse>(ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(notificationId), {
      statut,
    })
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<any> {
    return apiClient.post<any>(ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ, {})
  }

  /**
   * Marque plusieurs notifications en masse
   */
  async markMultipleNotificationsAs(
    notificationIds: number[],
    statut: "lue" | "non_lue" | "supprimee",
  ): Promise<NotificationResponse> {
    return apiClient.post<NotificationResponse>(ENDPOINTS.NOTIFICATIONS.BULK_MARK_AS_READ, {
      notificationIds,
      statut,
    })
  }

  /**
   * Récupère l'historique des notifications par type
   */
  async getNotificationsByType(type: string, page = 1, limit = 20): Promise<NotificationResponse> {
    const endpoint = `${ENDPOINTS.NOTIFICATIONS.BY_TYPE(type)}?page=${page}&limit=${limit}`
    return apiClient.get<NotificationResponse>(endpoint)
  }

  /**
   * Récupère les statistiques des notifications
   */
  async getStatistics(): Promise<any> {
    return apiClient.get<any>(ENDPOINTS.NOTIFICATIONS.STATS)
  }

  /**
   * Récupère les notifications du dashboard admin
   */
  async getAdminNotifications(page = 1, limit = 20, statut?: string, type?: string): Promise<NotificationResponse> {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("limit", limit.toString())

    if (statut) params.append("statut", statut)
    if (type) params.append("type", type)

    const response = await apiClient.get<any>(`${ENDPOINTS.NOTIFICATIONS.ADMIN_BASE}?${params.toString()}`)

    if (response.data?.notifications) {
      return {
        success: true,
        message: response.message || "Notifications récupérées",
        data: response.data.notifications,
        meta: response.data.pagination,
      }
    }

    return response as NotificationResponse
  }

  /**
   * Récupère le nombre de notifications non lues pour l'admin
   */
  async getAdminUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get<any>(ENDPOINTS.NOTIFICATIONS.ADMIN_UNREAD_COUNT)

    if (response.data?.count !== undefined) {
      return { count: response.data.count }
    }

    return response
  }
}

// Export singleton
export const notificationService = new NotificationService()
