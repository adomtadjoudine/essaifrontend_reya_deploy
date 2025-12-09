"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Calendar, TrendingUp, Users, DollarSign, Percent, Gift, Clock } from "lucide-react"
import type { Promotion, StatistiquesPromotion } from "@/lib/api/types/promotion"
import { promotionService } from "@/lib/api/services/promotion.service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PromotionDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion: Promotion | null
}

/**
 * Modal de détails d'une promotion avec statistiques
 */
export function PromotionDetailModal({ open, onOpenChange, promotion }: PromotionDetailModalProps) {
  const [stats, setStats] = useState<StatistiquesPromotion | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    if (open && promotion) {
      loadStatistiques()
    }
  }, [open, promotion])

  const loadStatistiques = async () => {
    if (!promotion) return

    try {
      setLoadingStats(true)
      const data = await promotionService.getStatistiques(promotion.id)
      setStats(data)
    } catch (error) {
      console.error("[v0] Erreur lors du chargement des statistiques:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (!promotion) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy à HH:mm", { locale: fr })
    } catch {
      return dateString
    }
  }

  const getTypeReductionLabel = (type: string) => {
    return type === "pourcentage" ? "Pourcentage" : "Montant fixe"
  }

  const isExpired = new Date(promotion.dateFin) < new Date()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {promotion.code}
              {isExpired && <span className="text-red-600 text-lg font-semibold">(Expirée)</span>}
            </DialogTitle>
            <Badge variant={isExpired ? "destructive" : promotion.estActif ? "default" : "destructive"}>
              {isExpired ? "Expirée" : promotion.estActif ? "Active" : "Inactive"}
            </Badge>
          </div>
          {promotion.description && <p className="text-muted-foreground text-sm mt-2">{promotion.description}</p>}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Statistiques */}
          {loadingStats ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Utilisations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold">{stats.nombreUtilisations}</span>
                  </div>
                  {promotion.nombreUtilisationsMax && (
                    <p className="text-xs text-muted-foreground mt-1">sur {promotion.nombreUtilisationsMax} max</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Montant réduit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold">{formatCurrency(stats.montantTotalReduit)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-2xl font-bold">{stats.clients.total}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.clients.nouveaux} nouveaux</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Panier moyen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-orange-600" />
                    <span className="text-2xl font-bold">{formatCurrency(stats.montantMoyenCommande)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          <Separator />

          {/* Détails de la promotion */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Configuration de la réduction</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Type de réduction</p>
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">{getTypeReductionLabel(promotion.typeReduction)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Valeur de la réduction</p>
                <p className="text-sm font-semibold">
                  {promotion.valeurReduction}
                  {promotion.typeReduction === "pourcentage" ? "%" : " FCFA"}
                </p>
              </div>

              {promotion.montantMinimum && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Montant minimum</p>
                  <p className="text-sm font-semibold">{formatCurrency(promotion.montantMinimum)}</p>
                </div>
              )}

              {promotion.plafondReduction && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Plafond de réduction</p>
                  <p className="text-sm font-semibold">{formatCurrency(promotion.plafondReduction)}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Période de validité */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Période de validité</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date de début
                </p>
                <p className="text-sm font-semibold">{formatDate(promotion.dateDebut)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Date de fin
                </p>
                <p className={`text-sm font-semibold ${isExpired ? "text-red-600" : ""}`}>
                  {formatDate(promotion.dateFin)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Options et limitations */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Options et limitations</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">Cumulable avec d'autres promotions</span>
                <Badge variant={promotion.estCumulable ? "default" : "secondary"}>
                  {promotion.estCumulable ? "Oui" : "Non"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">Réservé au premier achat</span>
                <Badge variant={promotion.premierAchatUniquement ? "default" : "secondary"}>
                  {promotion.premierAchatUniquement ? "Oui" : "Non"}
                </Badge>
              </div>

              {promotion.nombreUtilisationsMax && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Utilisations maximum</span>
                  <Badge variant="outline">
                    {promotion.nombreUtilisations} / {promotion.nombreUtilisationsMax}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informations système */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Créé le {formatDate(promotion.createdAt)}</p>
            <p>Dernière modification le {formatDate(promotion.updatedAt)}</p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
