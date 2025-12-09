"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateTourneeModal } from "@/components/create-tournee-modal"
import { TourneeDetailModal } from "@/components/tournee-detail-modal"
import {
  Search,
  Eye,
  MoreHorizontal,
  Plus,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  PlayCircle,
  XCircle,
  Package,
} from "lucide-react"
import { useState, useMemo } from "react"
import { useTournees } from "@/hooks/use-tournees"
import { useLivreurs } from "@/hooks/use-livreurs"
import { useCommandes } from "@/hooks/use-commandes"
import type { Tournee } from "@/lib/api/types/tournee"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const getStatusColor = (status: string) => {
  switch (status) {
    case "planifiee":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "en_cours":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case "completee":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "annulee":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    planifiee: "Planifiée",
    en_cours: "En cours",
    completee: "Terminée",
    annulee: "Annulée",
  }
  return labels[status] || status
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A"
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: fr })
  } catch {
    return dateString
  }
}

export default function ToursPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [livreurFilter, setLivreurFilter] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTournee, setSelectedTournee] = useState<Tournee | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const {
    tournees,
    loading: tourneesLoading,
    error: tourneesError,
    fetchTournees,
    createTournee,
    demarrer,
    terminer,
    annuler,
  } = useTournees()

  const { livreurs, loading: livreursLoading } = useLivreurs()
  const { commandes, loading: commandesLoading } = useCommandes()

  const stats = useMemo(() => {
    const tourneesParStatut: Record<string, number> = {
      planifiee: 0,
      en_cours: 0,
      completee: 0,
      annulee: 0,
    }

    tournees.forEach((tournee) => {
      if (tournee.statut in tourneesParStatut) {
        tourneesParStatut[tournee.statut]++
      }
    })

    return {
      nombreTotal: tournees.length,
      tourneesParStatut,
    }
  }, [tournees])

  const filteredTournees = useMemo(() => {
    return tournees.filter((tournee) => {
      const matchesSearch =
        tournee.numeroTournee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournee.livreur?.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournee.livreur?.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournee.id.toString().includes(searchTerm)

      const matchesStatus = statusFilter === "all" || tournee.statut === statusFilter
      const matchesLivreur = livreurFilter === "all" || tournee.livreurId.toString() === livreurFilter

      return matchesSearch && matchesStatus && matchesLivreur
    })
  }, [tournees, searchTerm, statusFilter, livreurFilter])

  const handleCreateTournee = async (data: any) => {
    const success = await createTournee(data)
    if (success) {
      setIsCreateModalOpen(false)
      await fetchTournees()
    }
  }

  const handleDemarrer = async (tourneeId: number) => {
    await demarrer(tourneeId)
    await fetchTournees()
  }

  const handleTerminer = async (tourneeId: number) => {
    await terminer(tourneeId)
    await fetchTournees()
  }

  const handleAnnuler = async (tourneeId: number) => {
    await annuler(tourneeId)
    await fetchTournees()
  }

  const handleViewDetails = (tournee: Tournee) => {
    setSelectedTournee(tournee)
    setIsDetailModalOpen(true)
  }

  const planifiedCount = stats.tourneesParStatut?.planifiee || 0
  const inProgressCount = stats.tourneesParStatut?.en_cours || 0
  const completedCount = stats.tourneesParStatut?.completee || 0

  if (tourneesLoading || livreursLoading || commandesLoading) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Chargement des tournées...</p>
            </div>
          </main>
        </SidebarInset>
      </>
    )
  }

  if (tourneesError) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-red-500">Erreur: {tourneesError}</p>
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
              <h1 className="text-3xl font-bold text-balance">Gestion des tournées</h1>
              <p className="text-muted-foreground">Planifiez et suivez les tournées de livraison</p>
            </div>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle tournée
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total tournées</p>
                  <p className="text-2xl font-bold">{stats.nombreTotal}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Planifiées</p>
                  <p className="text-2xl font-bold">{planifiedCount}</p>
                </div>
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En cours</p>
                  <p className="text-2xl font-bold">{inProgressCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Terminées</p>
                  <p className="text-2xl font-bold">{completedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Tournées actives et planifiées
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par numéro, livreur..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="planifiee">Planifiée</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="completee">Terminée</SelectItem>
                    <SelectItem value="annulee">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTournees.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Aucune tournée trouvée selon vos filtres</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTournees.map((tournee) => (
                    <div
                      key={tournee.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow hover:border-primary/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-lg">Tournée #{tournee.numeroTournee}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(tournee.date)}</p>
                        </div>
                        <Badge className={getStatusColor(tournee.statut)}>{getStatusLabel(tournee.statut)}</Badge>
                      </div>

                      <div className="mb-3 pb-3 border-b">
                        <p className="text-sm text-muted-foreground mb-1">Livreur assigné</p>
                        <p className="font-medium">
                          {tournee.livreur?.user
                            ? `${tournee.livreur.user.nom} ${tournee.livreur.user.prenom || ""}`
                            : "Non assigné"}
                        </p>
                        {tournee.livreur?.matricule && (
                          <p className="text-xs text-muted-foreground mt-1">Matricule: {tournee.livreur.matricule}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b">
                        <div>
                          <p className="text-xs text-muted-foreground">Total opérations</p>
                          <p className="text-lg font-bold">{tournee.operations?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Complétées</p>
                          <p className="text-lg font-bold text-green-600">
                            {tournee.operations?.filter((op) => op.statut === "completee").length || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleViewDetails(tournee)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Détails
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {tournee.statut === "planifiee" && (
                              <DropdownMenuItem onClick={() => handleDemarrer(tournee.id)}>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Démarrer
                              </DropdownMenuItem>
                            )}
                            {tournee.statut === "en_cours" && (
                              <DropdownMenuItem onClick={() => handleTerminer(tournee.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Terminer
                              </DropdownMenuItem>
                            )}
                            {tournee.statut !== "completee" && tournee.statut !== "annulee" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleAnnuler(tournee.id)} className="text-red-600">
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Annuler
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vue complète - Toutes les tournées</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={livreurFilter} onValueChange={setLivreurFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Filtrer par livreur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les livreurs</SelectItem>
                      {livreurs.map((livreur) => (
                        <SelectItem key={livreur.id} value={livreur.id.toString()}>
                          {livreur.user?.nom} {livreur.user?.prenom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Numéro</TableHead>
                      <TableHead className="font-semibold">Livreur</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-center">Opérations</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTournees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Aucune tournée trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTournees.map((tournee) => (
                        <TableRow key={tournee.id} className="hover:bg-muted/50">
                          <TableCell className="font-semibold text-primary">#{tournee.numeroTournee}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {tournee.livreur?.user?.nom} {tournee.livreur?.user?.prenom}
                              </p>
                              <p className="text-xs text-muted-foreground">{tournee.livreur?.matricule}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{formatDate(tournee.date)}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-semibold">{tournee.operations?.length || 0}</span>
                              {tournee.operations && tournee.operations.length > 0 && (
                                <span className="text-xs text-green-600 font-medium">
                                  ({tournee.operations.filter((op) => op.statut === "completee").length} ✓)
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(tournee.statut)}>{getStatusLabel(tournee.statut)}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(tournee)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {tournee.statut === "planifiee" && (
                                  <DropdownMenuItem onClick={() => handleDemarrer(tournee.id)}>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Démarrer
                                  </DropdownMenuItem>
                                )}
                                {tournee.statut === "en_cours" && (
                                  <DropdownMenuItem onClick={() => handleTerminer(tournee.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Terminer
                                  </DropdownMenuItem>
                                )}
                                {tournee.statut !== "completee" && tournee.statut !== "annulee" && (
                                  <DropdownMenuItem onClick={() => handleAnnuler(tournee.id)} className="text-red-600">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Annuler
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
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      <CreateTourneeModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        livreurs={livreurs}
        commandes={commandes}
        onSubmit={handleCreateTournee}
        loading={tourneesLoading}
      />

      <TourneeDetailModal
        tournee={selectedTournee}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onDemarrer={handleDemarrer}
        onTerminer={handleTerminer}
        onAnnuler={handleAnnuler}
      />
    </>
  )
}
