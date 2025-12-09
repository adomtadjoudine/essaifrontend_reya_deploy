"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  XCircle,
  Loader2,
  Plus,
  Tag,
  TrendingUp,
  Users,
  Percent,
  Archive,
} from "lucide-react"
import { usePromotions } from "@/hooks/use-promotions"
import { PromotionModal } from "@/components/promotion-modal"
import { PromotionDetailModal } from "@/components/promotion-detail-modal"
import type { Promotion } from "@/lib/api/types/promotion"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"

export default function PromotionsPage() {
  const { promotions, loading, error, deletePromotion, fetchPromotions, toggleActive } = usePromotions()

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [togglingPromotionId, setTogglingPromotionId] = useState<number | null>(null)

  const activePromotions = promotions.filter((promo) => promo.estActif)

  const filteredPromotions = promotions.filter(
    (promo) =>
      promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (promo.description && promo.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: fr })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getReductionLabel = (promo: Promotion) => {
    if (promo.typeReduction === "pourcentage") {
      return `${promo.valeurReduction}%`
    }
    return formatCurrency(promo.valeurReduction)
  }

  const handleDeletePromotion = (id: number) => {
    deletePromotion(id)
  }

  const handleToggleActive = async (id: number) => {
    setTogglingPromotionId(id)
    try {
      await toggleActive(id)
    } finally {
      setTogglingPromotionId(null)
    }
  }

  const handleCreatePromotion = () => {
    setSelectedPromotion(null)
    setIsCreateModalOpen(true)
  }

  const handleEditPromotion = (promo: Promotion) => {
    setSelectedPromotion(promo)
    setIsEditModalOpen(true)
  }

  const handleViewPromotion = (promo: Promotion) => {
    setSelectedPromotion(promo)
    setIsDetailModalOpen(true)
  }

  const handlePromotionSaved = () => {
    fetchPromotions()
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
  }

  const totalUtilisations = promotions.reduce((sum, p) => sum + (p.nombreUtilisations || 0), 0)

  const totalClients = promotions.filter((p) => p.clientId).length

  const isPromotionExpired = (promo: Promotion) => {
    const now = new Date()
    const endDate = new Date(promo.dateFin)
    return endDate < now
  }

  if (error) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => fetchPromotions()}>Réessayer</Button>
              </div>
            </div>
          </main>
        </SidebarInset>
      </>
    )
  }

  return (
    <>
      <AdminSidebar />
      <SidebarInset>
        <AdminTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Gestion des promotions</h1>
              <p className="text-muted-foreground">Créez et gérez vos codes promo et offres spéciales</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent" asChild>
                <Link href="/marketing/promotions/archived">
                  <Archive className="h-4 w-4" />
                  Promotions archivées
                </Link>
              </Button>
              <Button className="flex items-center gap-2" onClick={handleCreatePromotion}>
                <Plus className="h-4 w-4" />
                Nouvelle promotion
              </Button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total promotions</p>
                  <p className="text-2xl font-bold">{promotions.length}</p>
                </div>
                <Tag className="h-8 w-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Promotions actives</p>
                  <p className="text-2xl font-bold">{activePromotions.length}</p>
                </div>
                <Percent className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total utilisations</p>
                  <p className="text-2xl font-bold">{totalUtilisations}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Promotions ciblées</p>
                  <p className="text-2xl font-bold">{totalClients}</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Toutes les promotions</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une promotion..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Chargement des promotions...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Réduction</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Utilisations</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromotions.map((promo) => {
                      const isExpired = isPromotionExpired(promo)

                      return (
                        <TableRow key={promo.id} className={!promo.estActif ? "bg-red-50" : ""}>
                          <TableCell className="font-mono font-semibold">
                            <div className="flex items-center gap-2">
                              {promo.code}
                              {isExpired && <span className="text-red-600 font-bold text-xs">(Expirée)</span>}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{promo.description || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {promo.typeReduction === "pourcentage" ? "Pourcentage" : "Montant fixe"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{getReductionLabel(promo)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{formatDate(promo.dateDebut)}</p>
                              <p className={isExpired ? "text-red-600 font-semibold" : "text-muted-foreground"}>
                                → {formatDate(promo.dateFin)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {promo.nombreUtilisations}
                              {promo.nombreUtilisationsMax ? ` / ${promo.nombreUtilisationsMax}` : ""}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {isExpired ? (
                              <Badge variant="destructive">Expirée</Badge>
                            ) : (
                              <Badge variant={promo.estActif ? "default" : "destructive"}>
                                {promo.estActif ? "Active" : "Inactive"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  disabled={togglingPromotionId === promo.id}
                                >
                                  {togglingPromotionId === promo.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <MoreHorizontal className="h-4 w-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewPromotion(promo)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Détails
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditPromotion(promo)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleToggleActive(promo.id)}
                                  disabled={togglingPromotionId === promo.id}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  {promo.estActif ? "Désactiver" : "Activer"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeletePromotion(promo.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {filteredPromotions.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? "Aucune promotion trouvée pour cette recherche" : "Aucune promotion configurée"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      <PromotionModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} onSave={handlePromotionSaved} />

      <PromotionModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        promotion={selectedPromotion}
        onSave={handlePromotionSaved}
      />

      <PromotionDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        promotion={selectedPromotion}
      />
    </>
  )
}
