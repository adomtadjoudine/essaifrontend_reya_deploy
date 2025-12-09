"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Loader2, ArrowLeft, Archive, Calendar, Tag } from "lucide-react"
import { PromotionDetailModal } from "@/components/promotion-detail-modal"
import type { Promotion } from "@/lib/api/types/promotion"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { promotionService } from "@/lib/api/services/promotion.service"
import { toast } from "@/hooks/use-toast"

export default function ArchivedPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)

  // Récupérer les promotions archivées (expirées ou inactives)
  useEffect(() => {
    const fetchArchivedPromotions = async () => {
      try {
        setLoading(true)
        const allPromotions = await promotionService.getAll()

        // Filtrer les promotions archivées (expirées ou inactives)
        const archived = allPromotions.filter((promo) => {
          const isExpired = new Date(promo.dateFin) < new Date()
          return isExpired || !promo.estActif
        })

        setPromotions(archived)
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les promotions archivées",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchArchivedPromotions()
  }, [])

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

  const handleViewPromotion = (promo: Promotion) => {
    setSelectedPromotion(promo)
    setIsDetailModalOpen(true)
  }

  const isPromotionExpired = (promo: Promotion) => {
    const now = new Date()
    const endDate = new Date(promo.dateFin)
    return endDate < now
  }

  const getArchiveReason = (promo: Promotion) => {
    const isExpired = isPromotionExpired(promo)
    if (isExpired && !promo.estActif) {
      return "Expirée & Désactivée"
    }
    if (isExpired) {
      return "Expirée"
    }
    if (!promo.estActif) {
      return "Désactivée"
    }
    return "Archivée"
  }

  return (
    <>
      <AdminSidebar />
      <SidebarInset>
        <AdminTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/marketing/promotions">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold text-balance">Promotions archivées</h1>
              </div>
              <p className="text-muted-foreground ml-12">Historique des promotions expirées ou désactivées</p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total archivées</p>
                  <p className="text-2xl font-bold">{promotions.length}</p>
                </div>
                <Archive className="h-8 w-8 text-gray-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expirées</p>
                  <p className="text-2xl font-bold">{promotions.filter((p) => isPromotionExpired(p)).length}</p>
                </div>
                <Calendar className="h-8 w-8 text-red-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total utilisations</p>
                  <p className="text-2xl font-bold">
                    {promotions.reduce((sum, p) => sum + (p.nombreUtilisations || 0), 0)}
                  </p>
                </div>
                <Tag className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Liste des promotions archivées</CardTitle>
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
                  <span>Chargement des promotions archivées...</span>
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
                      <TableHead>Raison</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromotions.map((promo) => {
                      const isExpired = isPromotionExpired(promo)

                      return (
                        <TableRow key={promo.id} className="bg-gray-50">
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
                              <p className="text-red-600 font-semibold">→ {formatDate(promo.dateFin)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {promo.nombreUtilisations}
                              {promo.nombreUtilisationsMax ? ` / ${promo.nombreUtilisationsMax}` : ""}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">{getArchiveReason(promo)}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewPromotion(promo)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Détails
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
                          {searchTerm
                            ? "Aucune promotion archivée trouvée pour cette recherche"
                            : "Aucune promotion archivée"}
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

      <PromotionDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        promotion={selectedPromotion}
      />
    </>
  )
}
