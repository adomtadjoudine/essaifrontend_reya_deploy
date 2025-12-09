const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://a96c7bykrwf.preview.hosting-ik.com"

export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  roles: Array<{
    id: number
    nom: string
    permissions: Array<{
      id: number
      nom: string
    }>
  }>
  permissions?: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  nom: string
  prenom: string
  email: string
  password: string
  telephone: string
}

export interface AuthResponse {
  message: string
  token: string
  utilisateur: User
}

class AuthService {
  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Erreur de connexion")
    }

    const data = await response.json()

    // Store token in localStorage
    localStorage.setItem("auth_token", data.token)

    return data
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Erreur lors de l'inscription")
    }

    return await response.json()
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      })
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    } finally {
      localStorage.removeItem("auth_token")
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/me`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Utilisateur non authentifié")
    }

    const data = await response.json()
    return data.utilisateur
  }

  getToken(): string | null {
    return localStorage.getItem("auth_token")
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

export const authService = new AuthService()
