/**
 * Hook pour gérer les notifications en temps réel
 * Fournit l'état et les méthodes pour interagir avec les notifications
 */

"use client"

import { useCallback, useEffect, useState } from "react"
import type { Notification } from "@/lib/api/types/notification"
import { notificationService } from "@/lib/api/services/notification.service"
import { notificationWs } from "@/lib/websocket/notification-ws"
import { useAuth } from "@/contexts/auth-context"

interface UseNotificationsReturn {
  notifications: Notification[]
  nonLuesCount: number
  isLoading: boolean
  isConnected: boolean
  error: string | null
  markAsRead: (id: number) => Promise<void>
  markAsUnread: (id: number) => Promise<void>
  markAsDeleted: (id: number) => Promise<void>
  markMultipleAsRead: (ids: number[]) => Promise<void>
  refetch: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [nonLuesCount, setNonLuesCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Charger les notifications initiales
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      setIsLoading(true)
      setError(null)

      // Vérifier si l'utilisateur est admin
      const isAdmin = user.roles?.some((role) => role.nom === "admin" || role.nom === "super_admin")

      let response
      if (isAdmin) {
        // Utiliser l'endpoint admin
        response = await notificationService.getAdminNotifications(1, 50, "non_lue")
        const stats = await notificationService.getAdminUnreadCount()
        setNonLuesCount(stats.count || 0)
      } else {
        // Utiliser l'endpoint client
        response = await notificationService.getMyNotifications(1, 50, "non_lue")
        const stats = await notificationService.getNonLuesCount()
        setNonLuesCount(stats.nonLuesCount || 0)
      }

      if (response.success) {
        const notificationsData = Array.isArray(response.data) ? response.data : []
        setNotifications(notificationsData)
      } else {
        setNotifications([])
      }
    } catch (err) {
      console.error("[v0] Erreur lors du chargement des notifications:", err)
      console.error("[v0] Error details:", JSON.stringify(err, null, 2))
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des notifications")
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Charger les notifications au démarrage
    loadNotifications()

    const checkAndJoinChannels = () => {
      if (notificationWs.isConnected()) {
        // Rejoindre le channel personnel (pour les notifications utilisateur)
        notificationWs.joinUserNotificationChannel(user.id)

        // Vérifier si l'utilisateur est admin et rejoindre le channel admin
        const isAdmin = user.roles?.some((role) => role.nom === "admin" || role.nom === "super_admin")
        if (isAdmin) {
          console.log("[v0] Utilisateur est admin, rejoindre le channel admin")
          notificationWs.joinAdminChannel(user.id)
        }

        setIsConnected(true)
      }
    }

    // Vérifier après un délai court pour que la connexion soit établie
    const timer = setTimeout(checkAndJoinChannels, 500)

    // Écouter les nouvelles notifications
    const handleNewNotification = (notification: any) => {
      console.log("[v0] Nouvelle notification reçue via WebSocket:", notification)

      const formattedNotification: Notification = {
        id: notification.id,
        titre: notification.titre,
        message: notification.message,
        type: notification.type,
        priorite: notification.priorite,
        statut: "non_lue",
        canal: notification.canal || "app",
        lien: notification.lien,
        donnees: notification.donnees,
        createdAt: notification.createdAt || new Date().toISOString(),
        destinataireId: user.id,
        emetteId: notification.emetteId,
      }

      setNotifications((prev) => [formattedNotification, ...prev])
      setNonLuesCount((prev) => prev + 1)
    }

    // Écouter les changements de statut de connexion
    const handleConnectionStatus = (connected: boolean) => {
      console.log("[v0] Statut de connexion WebSocket:", connected)
      setIsConnected(connected)

      // Si reconnecté, rejoindre les channels
      if (connected) {
        checkAndJoinChannels()
      }
    }

    notificationWs.on("notification", handleNewNotification)
    notificationWs.on("connected", handleConnectionStatus)

    return () => {
      clearTimeout(timer)
      notificationWs.off("notification", handleNewNotification)
      notificationWs.off("connected", handleConnectionStatus)
    }
  }, [isAuthenticated, user, loadNotifications])

  // Marquer comme lue
  const markAsRead = useCallback(
    async (id: number) => {
      try {
        await notificationService.markNotificationAs(id, "lue")
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, statut: "lue" } : n)))

        // Mettre à jour le compte si nécessaire
        const notification = notifications.find((n) => n.id === id)
        if (notification?.statut === "non_lue") {
          setNonLuesCount((prev) => Math.max(0, prev - 1))
        }
      } catch (err) {
        console.error("[v0] Erreur lors du marquage comme lue:", err)
        throw err
      }
    },
    [notifications],
  )

  // Marquer comme non lue
  const markAsUnread = useCallback(async (id: number) => {
    try {
      await notificationService.markNotificationAs(id, "non_lue")
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, statut: "non_lue" } : n)))
      setNonLuesCount((prev) => prev + 1)
    } catch (err) {
      console.error("[v0] Erreur lors du marquage comme non lue:", err)
      throw err
    }
  }, [])

  // Marquer comme supprimée
  const markAsDeleted = useCallback(
    async (id: number) => {
      try {
        await notificationService.markNotificationAs(id, "supprimee")
        setNotifications((prev) => prev.filter((n) => n.id !== id))

        // Mettre à jour le compte si nécessaire
        const notification = notifications.find((n) => n.id === id)
        if (notification?.statut === "non_lue") {
          setNonLuesCount((prev) => Math.max(0, prev - 1))
        }
      } catch (err) {
        console.error("[v0] Erreur lors du marquage comme supprimée:", err)
        throw err
      }
    },
    [notifications],
  )

  // Marquer plusieurs comme lues
  const markMultipleAsRead = useCallback(
    async (ids: number[]) => {
      try {
        await notificationService.markMultipleNotificationsAs(ids, "lue")
        setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, statut: "lue" } : n)))

        // Compter combien de non-lues on marque comme lues
        const nonLuesBeingRead = notifications.filter((n) => ids.includes(n.id) && n.statut === "non_lue").length
        setNonLuesCount((prev) => Math.max(0, prev - nonLuesBeingRead))
      } catch (err) {
        console.error("[v0] Erreur lors du marquage en masse:", err)
        throw err
      }
    },
    [notifications],
  )

  // Recharger les notifications
  const refetch = useCallback(async () => {
    await loadNotifications()
  }, [loadNotifications])

  return {
    notifications,
    nonLuesCount,
    isLoading,
    isConnected,
    error,
    markAsRead,
    markAsUnread,
    markAsDeleted,
    markMultipleAsRead,
    refetch,
  }
}
