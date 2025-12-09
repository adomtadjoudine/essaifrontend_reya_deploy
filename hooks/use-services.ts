"use client"

// Hook personnalisé pour la gestion des services
import { useState, useEffect, useCallback } from "react"
import { serviceService } from "@/lib/api/services/service.service"
import type { Service, CreateServiceData, UpdateServiceData } from "@/lib/api/types/service"
import { toast } from "@/hooks/use-toast"

/**
 * Hook personnalisé pour gérer les services de pressing
 */
export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère tous les services avec filtres optionnels
   */
  const fetchServices = useCallback(
    async (filters?: { page?: number; limit?: number; search?: string; typeTarification?: string }) => {
      try {
        setLoading(true)
        setError(null)

        const data = filters ? await serviceService.getAllWithFilters(filters) : await serviceService.getAll()

        if (Array.isArray(data)) {
          setServices(data)
        } else {
          setServices([])
          setError("Format de données invalide reçu de l'API")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des services"
        setError(errorMessage)
        setServices([])
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  /**
   * Crée un nouveau service
   */
  const createService = useCallback(async (data: CreateServiceData): Promise<Service | null> => {
    try {
      const newService = await serviceService.create(data)
      setServices((prev) => [...prev, newService])
      toast({
        title: "Succès",
        description: "Service créé avec succès",
      })
      return newService
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du service"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  /**
   * Met à jour un service
   */
  const updateService = useCallback(async (id: number, data: UpdateServiceData): Promise<boolean> => {
    try {
      const updatedService = await serviceService.update(id, data)
      setServices((prev) => prev.map((service) => (service.id === id ? updatedService : service)))
      toast({
        title: "Succès",
        description: "Service mis à jour avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour du service"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Supprime (archive) un service
   */
  const deleteService = useCallback(async (id: number): Promise<boolean> => {
    try {
      await serviceService.delete(id)
      setServices((prev) => prev.filter((service) => service.id !== id))
      toast({
        title: "Succès",
        description: "Service supprimé avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du service"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Active/désactive un service
   */
  const toggleActive = useCallback(async (id: number): Promise<boolean> => {
    try {
      const updatedService = await serviceService.toggleActive(id)
      setServices((prev) => prev.map((service) => (service.id === id ? updatedService : service)))
      toast({
        title: "Succès",
        description: `Service ${updatedService.estActif ? "activé" : "désactivé"} avec succès`,
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du changement de statut"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  // Charger les services au montage du composant
  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    toggleActive,
  }
}
