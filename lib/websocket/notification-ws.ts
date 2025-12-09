/**
 * Gestionnaire WebSocket pour les notifications en temps réel
 * Maintient une connexion WebSocket avec le serveur AdonisJS
 */

import type { Notification } from "../api/types/notification"

export type NotificationEventCallback = (notification: Notification) => void
export type ConnectionStatusCallback = (connected: boolean) => void

class NotificationWebSocket {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private listeners: Map<string, Set<Function>> = new Map()
  private isConnecting = false

  constructor(wsUrl?: string) {
    if (typeof window !== "undefined") {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://a96c7bykrwf.preview.hosting-ik.com"
      // Convertir l'URL HTTP en WebSocket
      const wsProtocol = apiUrl.startsWith("https") ? "wss:" : "ws:"
      const urlObj = new URL(apiUrl)
      this.url = wsUrl || `${wsProtocol}//${urlObj.host}/ws`
      console.log("[v0] URL WebSocket configurée:", this.url)
    } else {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://a96c7bykrwf.preview.hosting-ik.com"
      const wsProtocol = apiUrl.startsWith("https") ? "wss:" : "ws:"
      const urlObj = new URL(apiUrl)
      this.url = wsUrl || `${wsProtocol}//${urlObj.host}/ws`
    }
  }

  /**
   * Connecte au serveur WebSocket
   */
  public connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log("[v0] WebSocket déjà connecté")
        resolve()
        return
      }

      if (this.isConnecting) {
        console.log("[v0] WebSocket connexion déjà en cours...")
        resolve()
        return
      }

      this.isConnecting = true

      try {
        console.log("[v0] Tentative de connexion WebSocket:", this.url)

        // Créer la connexion WebSocket
        this.ws = new WebSocket(this.url)

        // Gestion de l'ouverture
        this.ws.onopen = () => {
          console.log("[v0] WebSocket connecté")
          this.isConnecting = false
          this.reconnectAttempts = 0

          // Envoyer le token d'authentification
          this.send({
            type: "auth",
            token,
          })

          // Démarrer le heartbeat
          this.startHeartbeat()

          // Émettre l'événement de connexion
          this.emit("connected", true)

          resolve()
        }

        // Gestion des messages
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log("[v0] Message WebSocket reçu:", data.type, data)

            // Événements Socket.io (notification:nouvelle)
            if (data.type === "notification:nouvelle") {
              console.log("[v0] Nouvelle notification reçue via Socket.io")
              this.emit("notification", data.data || data)
            }
            // Événements Socket.io (notification)
            else if (data.type === "notification") {
              this.emit("notification", data.data)
            }
            // Événements en masse
            else if (data.type === "notifications-bulk") {
              this.emit("notifications-bulk", data.data)
            }
            // Événement de connexion
            else if (data.type === "notification:connected") {
              console.log("[v0] Connecté au channel de notifications")
              this.emit("channel:connected", data)
            }
            // Événement de connexion admin
            else if (data.type === "notification:admin-connected") {
              console.log("[v0] Connecté au channel admin")
              this.emit("admin:connected", data)
            }
            // Pong du serveur
            else if (data.type === "pong") {
              console.log("[v0] Pong reçu du serveur")
            }
            // Autres événements
            else {
              console.log("[v0] Événement non traité:", data.type)
            }
          } catch (error) {
            console.error("[v0] Erreur lors du traitement du message WebSocket:", error)
          }
        }

        // Gestion des erreurs
        this.ws.onerror = (error) => {
          console.error("[v0] Erreur WebSocket:", error)
          this.isConnecting = false
          reject(error)
        }

        // Gestion de la déconnexion
        this.ws.onclose = () => {
          console.log("[v0] WebSocket fermé")
          this.isConnecting = false
          this.stopHeartbeat()
          this.emit("connected", false)

          // Tenter la reconnexion
          this.attemptReconnect(token)
        }
      } catch (error) {
        console.error("[v0] Erreur création WebSocket:", error)
        this.isConnecting = false
        reject(error)
      }
    })
  }

  /**
   * Envoie un message au serveur
   */
  public send(message: Record<string, any>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error("[v0] Erreur lors de l'envoi du message WebSocket:", error)
      }
    } else {
      console.warn("[v0] WebSocket pas connecté, message non envoyé")
    }
  }

  /**
   * Enregistre un écouteur d'événement
   */
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  /**
   * Supprime un écouteur d'événement
   */
  public off(event: string, callback: Function): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback)
    }
  }

  /**
   * Émet un événement
   */
  private emit(event: string, data?: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`[v0] Erreur lors de l'exécution du callback pour ${event}:`, error)
        }
      })
    }
  }

  /**
   * Démarre le heartbeat pour vérifier la connexion
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: "ping" })
      }
    }, 30000) // Heartbeat toutes les 30 secondes
  }

  /**
   * Arrête le heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * Tente de se reconnecter au serveur
   */
  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[v0] Nombre maximum de tentatives de reconnexion atteint")
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`[v0] Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms`)

    this.reconnectTimer = setTimeout(() => {
      this.connect(token).catch((error) => {
        console.error("[v0] Erreur lors de la reconnexion:", error)
      })
    }, delay)
  }

  /**
   * Ferme la connexion WebSocket
   */
  public disconnect(): void {
    console.log("[v0] Fermeture de la connexion WebSocket")

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.listeners.clear()
  }

  /**
   * Vérifie si la connexion est ouverte
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Rejoindre le channel de notifications d'un utilisateur
   */
  public joinUserNotificationChannel(userId: number): void {
    if (this.isConnected()) {
      this.send({
        type: "join-notifications",
        userId,
      })
      console.log(`[v0] Demande de jointure du channel notifications-user-${userId}`)
    } else {
      console.warn("[v0] WebSocket non connecté, impossible de rejoindre le channel")
    }
  }

  /**
   * Rejoindre le channel admin pour les notifications
   */
  public joinAdminChannel(adminId: number): void {
    if (this.isConnected()) {
      this.send({
        type: "join-admin",
        adminId,
      })
      console.log(`[v0] Demande de jointure du channel admin`)
    } else {
      console.warn("[v0] WebSocket non connecté, impossible de rejoindre le channel admin")
    }
  }
}

// Export singleton
export const notificationWs = new NotificationWebSocket()
