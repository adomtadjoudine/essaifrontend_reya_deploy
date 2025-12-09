/**
 * Provider de notifications pour gérer les notifications globalement
 * Initialise la connexion WebSocket au démarrage de l'application
 */

"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { notificationWs } from "@/lib/websocket/notification-ws"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const connectionInitialized = useRef(false)

  // Initialiser la connexion WebSocket au démarrage
  useEffect(() => {
    if (!isAuthenticated) {
      notificationWs.disconnect()
      connectionInitialized.current = false
      return
    }

    if (connectionInitialized.current) {
      return
    }

    const token = localStorage.getItem("auth_token")
    if (!token) return

    connectionInitialized.current = true

    // Tenter de se connecter
    notificationWs.connect(token).catch((error) => {
      console.error("[v0] Erreur lors de la connexion WebSocket:", error)
      connectionInitialized.current = false
    })

    return () => {
      // Optionnel: conserver la connexion active
      // notificationWs.disconnect()
    }
  }, [isAuthenticated])

  return <>{children}</>
}
