// Client HTTP avec intercepteurs et gestion d'erreurs - Adapté pour l'API AdonisJS

import { API_CONFIG, HTTP_STATUS } from "./config"
import type { ApiError, RequestConfig } from "./types"

class ApiClient {
  private baseURL: string
  private defaultTimeout: number
  private defaultRetries: number

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.defaultTimeout = API_CONFIG.TIMEOUT
    this.defaultRetries = API_CONFIG.RETRY_ATTEMPTS

    console.log("[v0] ApiClient initialisé avec BASE_URL:", this.baseURL)
  }

  /**
   * Récupère les headers d'authentification
   * Utilise le token de session pour les admins
   */
  private getAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") return { "Content-Type": "application/json" }

    const token = localStorage.getItem("auth_token")
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  /**
   * Gère la réponse de l'API
   * Adapté pour le format de réponse AdonisJS: { success, message, data, errors }
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type")
    const isJson = contentType?.includes("application/json")

    // Gestion des erreurs HTTP
    if (!response.ok) {
      let errorData: any = {}

      if (isJson) {
        try {
          errorData = await response.json()
          console.error("[v0] Erreur API:", errorData)
        } catch {
          errorData = { message: "Erreur de réseau" }
        }
      }

      const apiError: ApiError = {
        message: errorData.message || `Erreur HTTP ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      }

      // Gestion spécifique des erreurs d'authentification
      if (response.status === HTTP_STATUS.UNAUTHORIZED) {
        console.log("[v0] Token invalide ou expiré, déconnexion automatique")
        localStorage.removeItem("auth_token")
        // Redirection vers la page de connexion si on n'y est pas déjà
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login"
        }
      }

      throw apiError
    }

    // Gestion des réponses vides (204 No Content)
    if (response.status === HTTP_STATUS.NO_CONTENT) {
      return { success: true } as T
    }

    if (isJson) {
      const jsonData = await response.json()
      console.log("[v0] Réponse API brute:", JSON.stringify(jsonData, null, 2))
      console.log("[v0] Type de réponse:", typeof jsonData)
      console.log("[v0] Clés de la réponse:", Object.keys(jsonData))

      // L'API AdonisJS retourne { success, message, data }
      // On retourne directement la structure complète pour que les services puissent l'utiliser
      return jsonData as T
    }

    return response.text() as unknown as T
  }

  /**
   * Effectue une requête HTTP avec retry automatique
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit & RequestConfig = {}): Promise<T> {
    const { timeout = this.defaultTimeout, retries = this.defaultRetries, ...fetchOptions } = options

    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      ...fetchOptions,
      credentials: "include",
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    }

    console.log("[v0] Requête API:", {
      method: config.method || "GET",
      url: url,
      baseURL: this.baseURL,
      endpoint: endpoint,
    })

    let lastError: ApiError | Error

    // Retry avec backoff exponentiel
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        return await this.handleResponse<T>(response)
      } catch (error) {
        lastError = error as ApiError | Error

        // Ne pas retry sur les erreurs d'authentification ou de validation
        if ("status" in lastError) {
          const apiError = lastError as ApiError
          if (
            apiError.status === HTTP_STATUS.UNAUTHORIZED ||
            apiError.status === HTTP_STATUS.BAD_REQUEST ||
            apiError.status === HTTP_STATUS.FORBIDDEN ||
            apiError.status === HTTP_STATUS.NOT_FOUND
          ) {
            console.error("[v0] Erreur non-retriable:", apiError)
            throw error
          }
        }

        // Attendre avant le prochain essai (backoff exponentiel)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000
          console.log(`[v0] Tentative ${attempt + 1}/${retries + 1} échouée, nouvelle tentative dans ${delay}ms`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    console.error("[v0] Toutes les tentatives ont échouées:", lastError)
    throw lastError!
  }

  /**
   * Requête GET
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: "GET", ...config })
  }

  /**
   * Requête POST
   */
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    })
  }

  /**
   * Requête PUT
   */
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    })
  }

  /**
   * Requête PATCH
   */
  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    })
  }

  /**
   * Requête DELETE
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: "DELETE", ...config })
  }
}

export const apiClient = new ApiClient()
