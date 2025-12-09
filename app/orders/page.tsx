"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { CommandeDetailModal } from "@/components/commande-detail-modal"
import { ChangeStatutDialog } from "@/components/change-statut-dialog"
import { Search, Eye, MoreHorizontal, Package, DollarSign, Clock, TrendingUp, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { useCommandes } from "@/hooks/use-commandes"
import { useStatuts } from "@/hooks/use-statuts"
import type { Commande } from "@/lib/api/types/commande"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

/**
 * Retourne la couleur du badge selon le nom du statut
 */
const getStatusColor = (statutNom: string) => {
  const nom = statutNom.toLowerCase()
  if (nom.includes("attente")) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
  if (nom.includes("collect")) return "bg-blue-100 text-blue-800 hover:bg-blue-200"
  if (nom.includes("cours") || nom.includes("traitement")) return "bg-purple-100 text-purple-800 hover:bg-purple-200"
  if (nom.includes("prêt") || nom.includes("pret")) return "bg-green-100 text-green-800 hover:bg-green-200"
  if (nom.includes("livr")) return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  if (nom.includes("annul")) return "bg-red-100 text-red-800 hover:bg-red-200"
  return "bg-gray-100 text-gray-800 hover:bg-gray-200"
}

/**
 * Formate une date au format français
 */
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: fr })
  } catch {
    return dateString
  }
}

/**
 * Formate un montant en FCFA
 */
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Récupère le statut actuel d'une commande (le plus récent)
 */
const getCurrentStatut = (commande: Commande) => {
  if (!commande.statuts || commande.statuts.length === 0) {
    console.log("[v0] Commande sans statuts:", commande.id)
    return { id: 0, nom: "En attente" }
  }

  // Trier les statuts par date de création pour s'assurer d'avoir le plus récent
  const statutsTries = [...commande.statuts].sort((a, b) => {
    const dateA = new Date(a.pivot?.createdAt || a.createdAt || 0).getTime()
    const dateB = new Date(b.pivot?.createdAt || b.createdAt || 0).getTime()
    return dateB - dateA // Du plus récent au plus ancien
  })

  const dernierStatut = statutsTries[0]
  console.log("[v0] Statut actuel pour commande", commande.id, ":", dernierStatut.nom)

  return { id: dernierStatut.id, nom: dernierStatut.nom }
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Commande | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isChangeStatutDialogOpen, setIsChangeStatutDialogOpen] = useState(false)
  const [commandeToChangeStatut, setCommandeToChangeStatut] = useState<Commande | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    search: "",
    statut_id: "",
  })

  const { commandes, loading, error, pagination, fetchCommandesPaginated, changeStatus } = useCommandes()
  const { statuts } = useStatuts()

  useEffect(() => {
    const paginationFilters = {
      search: filters.search || undefined,
      statut_id: filters.statut_id !== "all" ? filters.statut_id : undefined,
    }
    fetchCommandesPaginated(currentPage, itemsPerPage, paginationFilters)
  }, [currentPage, itemsPerPage, filters, fetchCommandesPaginated])

  // Calcul des statistiques en temps réel à partir des commandes
  const stats = {
    nombreTotal: pagination.total,
    chiffreAffaires: commandes.reduce((sum, commande) => sum + (commande.montantTotal || 0), 0),
    enCours: commandes.filter((commande) => {
      const statut = getCurrentStatut(commande)
      const nom = statut.nom.toLowerCase()
      return (
        nom.includes("attente") ||
        nom.includes("collect") ||
        nom.includes("cours") ||
        nom.includes("traitement") ||
        nom.includes("prêt") ||
        nom.includes("pret")
      )
    }).length,
    terminees: commandes.filter((commande) => {
      const statut = getCurrentStatut(commande)
      return statut.nom.toLowerCase().includes("livr")
    }).length,
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setFilters((prev) => ({ ...prev, search: value }))
    setCurrentPage(1) // Réinitialiser à la première page
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setFilters((prev) => ({ ...prev, statut_id: value }))
    setCurrentPage(1) // Réinitialiser à la première page
  }

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size)
    setCurrentPage(1) // Réinitialiser à la première page
  }

  const generatePageNumbers = () => {
    const pages: (number | string)[] = []
    const totalPages = pagination.lastPage
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Toujours afficher la première page
      pages.push(1)

      // Calculer la plage de pages autour de la page actuelle
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      // Ajouter des points de suspension si nécessaire
      if (startPage > 2) {
        pages.push("...")
      }

      // Ajouter les pages de la plage
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // Ajouter des points de suspension si nécessaire
      if (endPage < totalPages - 1) {
        pages.push("...")
      }

      // Toujours afficher la dernière page
      pages.push(totalPages)
    }

    return pages
  }

  const handleOpenChangeStatut = (commande: Commande) => {
    setCommandeToChangeStatut(commande)
    setIsChangeStatutDialogOpen(true)
  }

  const handleConfirmChangeStatut = async (statutId: number, estNotifie: boolean) => {
    if (!commandeToChangeStatut) return

    const success = await changeStatus(commandeToChangeStatut.id, { statutId, estNotifie })
    if (success) {
      if (selectedOrder && selectedOrder.id === commandeToChangeStatut.id) {
        // Trouver la commande mise à jour dans la liste
        const updatedCommande = commandes.find((c) => c.id === commandeToChangeStatut.id)
        if (updatedCommande) {
          setSelectedOrder(updatedCommande)
        }
      }
      setCommandeToChangeStatut(null)
      // Recharger les commandes paginées
      const paginationFilters = {
        search: filters.search || undefined,
        statut_id: filters.statut_id !== "all" ? filters.statut_id : undefined,
      }
      fetchCommandesPaginated(currentPage, itemsPerPage, paginationFilters)
    }
  }

  if (loading && commandes.length === 0) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Chargement des commandes...</p>
            </div>
          </main>
        </SidebarInset>
      </>
    )
  }

  if (error) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-4">Erreur: {error}</p>
                <Button
                  onClick={() => {
                    const paginationFilters = {
                      search: filters.search || undefined,
                      statut_id: filters.statut_id !== "all" ? filters.statut_id : undefined,
                    }
                    fetchCommandesPaginated(currentPage, itemsPerPage, paginationFilters)
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
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
          {/* En-tête de la page */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Gestion des commandes</h1>
              <p className="text-muted-foreground">
                Affichage {(currentPage - 1) * itemsPerPage + 1} à{" "}
                {Math.min(currentPage * itemsPerPage, pagination.total)} sur {pagination.total} commandes
              </p>
            </div>
            <Button
              onClick={() => {
                const paginationFilters = {
                  search: filters.search || undefined,
                  statut_id: filters.statut_id !== "all" ? filters.statut_id : undefined,
                }
                fetchCommandesPaginated(currentPage, itemsPerPage, paginationFilters)
              }}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total commandes</p>
                  <p className="text-2xl font-bold">{stats.nombreTotal}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.chiffreAffaires)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En cours</p>
                  <p className="text-2xl font-bold">{stats.enCours}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Terminées</p>
                  <p className="text-2xl font-bold">{stats.terminees}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
          </div>

          {/* Tableau des commandes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Toutes les commandes</CardTitle>
                <div className="flex items-center gap-2">
                  {/* Barre de recherche */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une commande..."
                      className="pl-10 w-64"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  {/* Filtre par statut */}
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange} disabled={loading}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      {statuts.map((statut) => (
                        <SelectItem key={statut.id} value={statut.id.toString()}>
                          {statut.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={itemsPerPage.toString()} onValueChange={(val) => handlePageSizeChange(Number(val))}>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Par page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Délai</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commandes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        {loading ? "Chargement..." : "Aucune commande trouvée"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    commandes.map((order) => {
                      const currentStatut = getCurrentStatut(order)
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.numeroCommande || `#${order.id}`}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {order.client?.user?.prenom || order.client?.prenom || ""}{" "}
                                {order.client?.user?.nom || order.client?.nom || "N/A"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.client?.user?.email || order.client?.email || ""}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{order.delaiLivraison?.nom || "N/A"}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(order.montantTotal)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(currentStatut.nom)}>{currentStatut.nom}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(order.dateCommande)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setIsDetailsModalOpen(true)
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenChangeStatut(order)}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Changer le statut
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>

              {pagination.total > 0 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} sur {pagination.lastPage}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      {/* Bouton précédent */}
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          disabled={currentPage === 1 || loading}
                        />
                      </PaginationItem>

                      {/* Numéros de page */}
                      {generatePageNumbers().map((page, index) => (
                        <PaginationItem key={index}>
                          {page === "..." ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => setCurrentPage(page as number)}
                              isActive={currentPage === page}
                              className={currentPage === page ? "cursor-default" : "cursor-pointer"}
                              disabled={loading}
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      {/* Bouton suivant */}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(Math.min(pagination.lastPage, currentPage + 1))}
                          className={
                            currentPage === pagination.lastPage ? "pointer-events-none opacity-50" : "cursor-pointer"
                          }
                          disabled={currentPage === pagination.lastPage || loading}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modal de détails de commande */}
          <CommandeDetailModal
            commande={selectedOrder}
            open={isDetailsModalOpen}
            onOpenChange={setIsDetailsModalOpen}
          />

          {/* Dialog de changement de statut */}
          <ChangeStatutDialog
            open={isChangeStatutDialogOpen}
            onOpenChange={setIsChangeStatutDialogOpen}
            onConfirm={handleConfirmChangeStatut}
            currentStatutId={commandeToChangeStatut ? getCurrentStatut(commandeToChangeStatut).id : undefined}
          />
        </main>
      </SidebarInset>
    </>
  )
}
