"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  Thermometer,
  Settings,
  DollarSign,
  Calendar,
  User,
  Code,
  FileText,
  Loader2,
  ImageIcon,
} from "lucide-react"
import type { Service } from "@/lib/api/types/service"
import type { Tarif } from "@/lib/api/types/tarif"
import { tarifService } from "@/lib/api/services/tarif.service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { getFileUrl } from "@/lib/api/config"

interface ServiceDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
}

/**
 * Modal d'affichage détaillé d'un service
 *
 * Affiche toutes les informations d'un service :
 * - Galerie d'images avec navigateur
 * - Informations de base (nom, code, description, type de tarification)
 * - Prix de base actuel
 * - Options disponibles avec leurs prix supplémentaires (types de linge, températures, options de traitement)
 * - Historique des modifications de prix
 * - Métadonnées (dates de création/modification, utilisateurs)
 */
export function ServiceDetailModal({ open, onOpenChange, service }: ServiceDetailModalProps) {
  const [loading, setLoading] = useState(false)
  const [tarifBase, setTarifBase] = useState<Tarif | null>(null)
  const [tarifsTypeLinges, setTarifsTypeLinges] = useState<Tarif[]>([])
  const [tarifsTemperatures, setTarifsTemperatures] = useState<Tarif[]>([])
  const [tarifsOptions, setTarifsOptions] = useState<Tarif[]>([])
  const [historiqueTarifs, setHistoriqueTarifs] = useState<Tarif[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  /**
   * Charge les tarifs associés au service
   */
  useEffect(() => {
    if (open && service) {
      loadTarifs()
      setCurrentImageIndex(0)
    }
  }, [open, service])

  /**
   * Charge tous les tarifs du service (base + supplémentaires + historique)
   */
  const loadTarifs = async () => {
    if (!service) return

    try {
      setLoading(true)

      // Charger le tarif de base actuel
      const tarifActuel = await tarifService.getTarifActuel("service", service.id)
      setTarifBase(tarifActuel)

      // Charger l'historique des tarifs
      const historique = await tarifService.getHistorique("service", service.id)
      setHistoriqueTarifs(historique)

      // Filtrer les tarifs supplémentaires par type
      const tarifsActifs = historique.filter((t) => t.estActif && !t.isArchive)
      setTarifsTypeLinges(tarifsActifs.filter((t) => t.typeLingeId))
      setTarifsTemperatures(tarifsActifs.filter((t) => t.temperatureId))
      setTarifsOptions(tarifsActifs.filter((t) => t.optionTraitementId))
    } catch (error) {
      console.error("Erreur lors du chargement des tarifs:", error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Formate un prix en FCFA
   */
  const formatPrice = (price: number | null) => {
    if (price === null) return "N/A"
    return `${price.toLocaleString()} FCFA`
  }

  /**
   * Formate une date
   */
  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMMM yyyy à HH:mm", { locale: fr })
  }

  /**
   * Obtient le libellé du type de tarification
   */
  const getTypeTarificationLabel = (type: string) => {
    switch (type) {
      case "unitaire":
        return "Unitaire (par pièce)"
      case "poids":
        return "Au poids (par kg)"
      case "forfait":
        return "Forfait (prix fixe)"
      default:
        return type
    }
  }

  const goToNextImage = () => {
    if (service?.images && service.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % service.images!.length)
    }
  }

  const goToPreviousImage = () => {
    if (service?.images && service.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + service.images!.length) % service.images!.length)
    }
  }

  const selectImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  if (!service) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Détails du service</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Aucun service sélectionné</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const images = service.images && service.images.length > 0 ? service.images : []
  const currentImage = images[currentImageIndex]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Détails du service
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-6 py-4">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{service.nom}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={service.estActif ? "default" : "secondary"}>
                      {service.estActif ? "Actif" : "Inactif"}
                    </Badge>
                    {service.isArchive && <Badge variant="destructive">Archivé</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {images.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-3 p-4 bg-muted/30 rounded-lg">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-border hover:border-primary/70 transition-all hover:scale-105 shadow-sm hover:shadow-md group"
                      >
                        <img
                          src={getFileUrl(image) || "/placeholder.svg"}
                          alt={`${service.nom} - Image ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:brightness-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/generic-thumbnail.png"
                          }}
                        />
                        {/* Numéro de l'image */}
                        <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message si pas d'images */}
                {images.length === 0 && (
                  <div className="flex items-center justify-center py-8 px-4 bg-muted rounded-lg border border-dashed border-border">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Aucune image disponible pour ce service</p>
                    </div>
                  </div>
                )}

                {/* Code et description */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Code className="h-4 w-4" />
                      Code du service
                    </div>
                    <p className="font-mono font-medium">{service.code}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      Type de tarification
                    </div>
                    <p className="font-medium">{getTypeTarificationLabel(service.typeTarification)}</p>
                  </div>
                </div>

                {service.description && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm">{service.description}</p>
                    </div>
                  </>
                )}

                {/* Prix de base */}
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  tarifBase && (
                    <>
                      <Separator />
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Prix de base actuel</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Mis à jour le {formatDate(tarifBase.updatedAt)}
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-primary">{formatPrice(tarifBase.prix)}</p>
                        </div>
                      </div>
                    </>
                  )
                )}

                {/* Métadonnées */}
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Date de création
                    </div>
                    <p>{formatDate(service.createdAt)}</p>
                    {service.createdBy && (
                      <div className="flex items-center gap-2 text-muted-foreground mt-2">
                        <User className="h-4 w-4" />
                        <span className="text-xs">{service.createdBy}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Dernière modification
                    </div>
                    <p>{formatDate(service.updatedAt)}</p>
                    {service.updatedBy && (
                      <div className="flex items-center gap-2 text-muted-foreground mt-2">
                        <User className="h-4 w-4" />
                        <span className="text-xs">{service.updatedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Options et tarifs supplémentaires */}
            {!loading && (tarifsTypeLinges.length > 0 || tarifsTemperatures.length > 0 || tarifsOptions.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Options disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="typeLinges" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="typeLinges" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Types de linge ({tarifsTypeLinges.length})
                      </TabsTrigger>
                      <TabsTrigger value="temperatures" className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        Températures ({tarifsTemperatures.length})
                      </TabsTrigger>
                      <TabsTrigger value="options" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Options ({tarifsOptions.length})
                      </TabsTrigger>
                    </TabsList>

                    {/* Types de linge */}
                    <TabsContent value="typeLinges" className="space-y-3">
                      {tarifsTypeLinges.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Aucun type de linge configuré pour ce service
                        </p>
                      ) : (
                        tarifsTypeLinges.map((tarif) => (
                          <div key={tarif.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{tarif.typeLinge?.nom}</p>
                              {tarif.typeLinge?.description && (
                                <p className="text-sm text-muted-foreground">{tarif.typeLinge.description}</p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-base">
                              +{formatPrice(tarif.prixSupplementaire)}
                            </Badge>
                          </div>
                        ))
                      )}
                    </TabsContent>

                    {/* Températures */}
                    <TabsContent value="temperatures" className="space-y-3">
                      {tarifsTemperatures.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Aucune température configurée pour ce service
                        </p>
                      ) : (
                        tarifsTemperatures.map((tarif) => (
                          <div key={tarif.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{tarif.temperature?.valeur}</p>
                              {tarif.temperature?.description && (
                                <p className="text-sm text-muted-foreground">{tarif.temperature.description}</p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-base">
                              +{formatPrice(tarif.prixSupplementaire)}
                            </Badge>
                          </div>
                        ))
                      )}
                    </TabsContent>

                    {/* Options de traitement */}
                    <TabsContent value="options" className="space-y-3">
                      {tarifsOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Aucune option de traitement configurée pour ce service
                        </p>
                      ) : (
                        tarifsOptions.map((tarif) => (
                          <div key={tarif.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{tarif.optionTraitement?.nom}</p>
                              {tarif.optionTraitement?.description && (
                                <p className="text-sm text-muted-foreground">{tarif.optionTraitement.description}</p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-base">
                              +{formatPrice(tarif.prixSupplementaire)}
                            </Badge>
                          </div>
                        ))
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Historique des tarifs */}
            {!loading && historiqueTarifs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Historique des modifications de prix</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3 pr-4">
                      {historiqueTarifs
                        .filter((t) => t.prix !== null) // Afficher uniquement les tarifs de base
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((tarif, index) => (
                          <div key={tarif.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{formatPrice(tarif.prix)}</p>
                                {index === 0 && tarif.estActif && (
                                  <Badge variant="default" className="text-xs">
                                    Actuel
                                  </Badge>
                                )}
                                {!tarif.estActif && (
                                  <Badge variant="secondary" className="text-xs">
                                    Ancien
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{formatDate(tarif.createdAt)}</p>
                              {tarif.createdBy && (
                                <p className="text-xs text-muted-foreground">Par {tarif.createdBy}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Résumé */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Résumé du service</h4>
                    <p className="text-sm text-muted-foreground">
                      {tarifsTypeLinges.length + tarifsTemperatures.length + tarifsOptions.length} option(s) disponible
                      {tarifsTypeLinges.length + tarifsTemperatures.length + tarifsOptions.length !== 1 ? "s" : ""}
                      {" • "}
                      {historiqueTarifs.filter((t) => t.prix !== null).length} modification
                      {historiqueTarifs.filter((t) => t.prix !== null).length !== 1 ? "s" : ""} de prix
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">À partir de</p>
                    <p className="text-2xl font-bold text-primary">{formatPrice(tarifBase?.prix || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
