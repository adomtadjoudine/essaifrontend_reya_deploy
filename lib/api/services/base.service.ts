// Service de base avec méthodes communes
import { apiClient } from "../client"
import type { RequestConfig } from "../types"

export abstract class BaseService<T, CreateData, UpdateData> {
  protected baseEndpoint: string

  constructor(baseEndpoint: string) {
    this.baseEndpoint = baseEndpoint
  }

  async getAll(config?: RequestConfig): Promise<T[]> {
    return apiClient.get<T[]>(this.baseEndpoint, config)
  }

  async getById(id: number, config?: RequestConfig): Promise<T> {
    return apiClient.get<T>(`${this.baseEndpoint}/${id}`, config)
  }

  async create(data: CreateData, config?: RequestConfig): Promise<T> {
    return apiClient.post<T>(this.baseEndpoint, data, config)
  }

  async update(id: number, data: UpdateData, config?: RequestConfig): Promise<T> {
    return apiClient.put<T>(`${this.baseEndpoint}/${id}`, data, config)
  }

  async delete(id: number, config?: RequestConfig): Promise<void> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`, config)
  }

  protected async customRequest<R>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<R> {
    switch (method) {
      case "GET":
        return apiClient.get<R>(endpoint, config)
      case "POST":
        return apiClient.post<R>(endpoint, data, config)
      case "PUT":
        return apiClient.put<R>(endpoint, data, config)
      case "PATCH":
        return apiClient.patch<R>(endpoint, data, config)
      case "DELETE":
        return apiClient.delete<R>(endpoint, config)
      default:
        throw new Error(`Méthode HTTP non supportée: ${method}`)
    }
  }
}
