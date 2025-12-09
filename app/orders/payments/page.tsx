/**
 * Page de gestion des paiements
 * Interface professionnelle pour gérer tous les paiements du pressing
 */

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
} from "@/components/ui/pagination"
import { PaiementDetailModal } from "@/components/paiement-detail-modal"
import {
  Search,
  Eye,
  MoreHorizontal,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { useState, useEffect } from "react"
import { usePaiements } from "@/hooks/use-paiements"
import type { Paiement } from "@/lib/api/types/paiement"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

/**
 * Retourne la couleur du badge selon le statut
 */
const getStatutColor = (statut: string) => {
  switch (statut.toLowerCase()) {
    case "valide":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "en_attente":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case "echoue":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case "annule":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    default:
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
  }
}

/**
 * Retourne le libellé du statut
 */
const getStatutLabel = (statut: string) => {
  switch (statut.toLowerCase()) {
    case "valide":
      return "Validé"
    case "en_attente":
      return "En attente"
    case "echoue":
      return "Échoué"
    case "annule":
      return "Annulé"
    default:
      return statut
  }
}

/**
 * Retourne le libellé de la méthode de paiement
 */
const getMethodeLabel = (methode: string) => {
  switch (methode.toLowerCase()) {
    case "especes":
      return "Espèces"
    case "mobile_money":
      return "Mobile Money"
    case "carte_bancaire":
      return "Carte bancaire"
    case "virement":
      return "Virement"
    case "cheque":
      return "Chèque"
    default:
      return methode
  }
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

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statutFilter, setStatutFilter] = useState("all")
  const [methodeFilter, setMethodeFilter] = useState("all")
  const [selectedPaiement, setSelectedPaiement] = useState<Paiement | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    search: "",
    statut: "",
    methode: "",
  })

  const {
    paiements,
    loading,
    error,
    pagination,
    fetchPaiementsPaginated,
    validerPaiement,
    rejeterPaiement,
    rembourserPaiement,
    getStatistics,
  } = usePaiements()

  const stats = getStatistics()

  useEffect(() => {
    const paginationFilters = {
      search: filters.search || undefined,
      statut: filters.statut !== "all" ? filters.statut : undefined,
      methode: filters.methode !== "all" ? filters.methode : undefined,
    }
    fetchPaiementsPaginated(currentPage, itemsPerPage, paginationFilters)
  }, [currentPage, itemsPerPage, filters, fetchPaiementsPaginated])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setFilters((prev) => ({ ...prev, search: value }))
    setCurrentPage(1)
  }

  const handleStatutFilterChange = (value: string) => {
    setStatutFilter(value)
    setFilters((prev) => ({ ...prev, statut: value }))
    setCurrentPage(1)
  }

  const handleMethodeFilterChange = (value: string) => {
    setMethodeFilter(value)
    setFilters((prev) => ({ ...prev, methode: value }))
    setCurrentPage(1)
  }

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size)
    setCurrentPage(1)
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
      pages.push(1)

      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      if (startPage > 2) {
        pages.push("...")
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages - 1) {
        pages.push("...")
      }

      pages.push(totalPages)
    }

    return pages
  }

  const handleValider = async (id: number) => {
    const success = await validerPaiement(id)
    if (success) {
      toast.success("Paiement validé avec succès")
      setIsDetailsModalOpen(false)
    } else {
      toast.error("Erreur lors de la validation du paiement")
    }
  }

  const handleRejeter = async (id: number) => {
    const success = await rejeterPaiement(id)
    if (success) {
      toast.success("Paiement rejeté")
      setIsDetailsModalOpen(false)
    } else {
      toast.error("Erreur lors du rejet du paiement")
    }
  }

  const handleRembourser = async (id: number) => {
    const montant = prompt("Montant à rembourser (FCFA):")
    if (!montant) return

    const montantRembourse = Number.parseFloat(montant)
    if (isNaN(montantRembourse) || montantRembourse <= 0) {
      toast.error("Montant invalide")
      return
    }

    const success = await rembourserPaiement(id, { montantRembourse })
    if (success) {
      toast.success("Paiement remboursé avec succès")
      setIsDetailsModalOpen(false)
    } else {
      toast.error("Erreur lors du remboursement")
    }
  }

  if (loading && paiements.length === 0) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Chargement des paiements...</p>
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
                      statut: filters.statut !== "all" ? filters.statut : undefined,
                      methode: filters.methode !== "all" ? filters.methode : undefined,
                    }
                    fetchPaiementsPaginated(currentPage, itemsPerPage, paginationFilters)
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Gestion des paiements</h1>
              <p className="text-muted-foreground">
                Affichage {(currentPage - 1) * itemsPerPage + 1} à{" "}
                {Math.min(currentPage * itemsPerPage, pagination.total)} sur {pagination.total} paiements
              </p>
            </div>
            <Button
              onClick={() => {
                const paginationFilters = {
                  search: filters.search || undefined,
                  statut: filters.statut !== "all" ? filters.statut : undefined,
                  methode: filters.methode !== "all" ? filters.methode : undefined,
                }
                fetchPaiementsPaginated(currentPage, itemsPerPage, paginationFilters)
              }}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Montant total</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(stats.montantTotal)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total paiements</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.totalPaiements}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-900">En attente</p>
                  <p className="text-2xl font-bold text-yellow-700">{stats.paiementsEnAttente}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Validés</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.paiementsValides}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Paiements échoués</p>
                  <p className="text-xl font-bold">{stats.paiementsEchoues}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Montant remboursé</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.montantRembourse)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Taux de validation</p>
                  <p className="text-xl font-bold">
                    {stats.totalPaiements > 0 ? Math.round((stats.paiementsValides / stats.totalPaiements) * 100) : 0}%
                  </p>
                </div>
              </div>
            </Card>
          </div> */}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tous les paiements</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un paiement..."
                      className="pl-10 w-64"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <Select value={statutFilter} onValueChange={handleStatutFilterChange} disabled={loading}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                      <SelectItem value="valide">Validé</SelectItem>
                      <SelectItem value="echoue">Échoué</SelectItem>
                      <SelectItem value="annule">Annulé</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={methodeFilter} onValueChange={handleMethodeFilterChange} disabled={loading}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Méthode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les méthodes</SelectItem>
                      <SelectItem value="especes">Espèces</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="carte_bancaire">Carte bancaire</SelectItem>
                      <SelectItem value="virement">Virement</SelectItem>
                      <SelectItem value="cheque">Chèque</SelectItem>
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
                    <TableHead>N° Paiement</TableHead>
                    <TableHead>Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paiements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        {loading ? "Chargement..." : "Aucun paiement trouvé"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paiements.map((paiement) => (
                      <TableRow key={paiement.id}>
                        <TableCell className="font-medium">{paiement.numeroPaiement}</TableCell>
                        <TableCell>{paiement.commande?.numeroCommande || `#${paiement.commandeId}`}</TableCell>
                        <TableCell>
                          {paiement.commande?.client?.user ? (
                            <div>
                              <p className="font-medium">
                                {paiement.commande.client.user.prenom} {paiement.commande.client.user.nom}
                              </p>
                              <p className="text-sm text-muted-foreground">{paiement.commande.client.user.email}</p>
                            </div>
                          ) : (
                            "Client non trouvé"
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(paiement.montant)}</TableCell>
                        <TableCell>{getMethodeLabel(paiement.methode)}</TableCell>
                        <TableCell>
                          <Badge className={getStatutColor(paiement.statut)}>{getStatutLabel(paiement.statut)}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(paiement.datePaiement)}</TableCell>
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
                                  setSelectedPaiement(paiement)
                                  setIsDetailsModalOpen(true)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              {paiement.statut === "en_attente" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleValider(paiement.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Valider
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRejeter(paiement.id)}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Rejeter
                                  </DropdownMenuItem>
                                </>
                              )}
                              {paiement.statut === "valide" && !paiement.estRembourse && (
                                <DropdownMenuItem onClick={() => handleRembourser(paiement.id)}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Rembourser
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
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
                      <PaginationItem>
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1 || loading}
                          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 gap-1 pr-2.5 ${
                            currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-muted"
                          }`}
                          aria-label="Aller à la page précédente"
                        >
                          <span>Précédent</span>
                        </button>
                      </PaginationItem>

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

                      <PaginationItem>
                        <button
                          onClick={() => setCurrentPage(Math.min(pagination.lastPage, currentPage + 1))}
                          disabled={currentPage === pagination.lastPage || loading}
                          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 gap-1 pl-2.5 ${
                            currentPage === pagination.lastPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer hover:bg-muted"
                          }`}
                          aria-label="Aller à la page suivante"
                        >
                          <span>Suivant</span>
                        </button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>

          <PaiementDetailModal
            paiement={selectedPaiement}
            open={isDetailsModalOpen}
            onOpenChange={setIsDetailsModalOpen}
            onValider={handleValider}
            onRejeter={handleRejeter}
            onRembourser={handleRembourser}
          />
        </main>
      </SidebarInset>
    </>
  )
}
