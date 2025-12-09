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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { GoogleMap } from "@/components/google-map"
import { Search, Eye, Edit, MoreHorizontal, Plus, Truck, MapPin, Clock, CheckCircle } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useTournees } from "@/hooks/use-tournees"
import { userService } from "@/lib/api/services/user.service"
import type { User } from "@/lib/api/types"
import type { Tournee } from "@/lib/api/types/tournee"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const getStatusColor = (status: string) => {
  switch (status) {
    case "planifiee":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "en_cours":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case "terminee":
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
    terminee: "Terminée",
    annulee: "Annulée",
  }
  return labels[status] || status
}

const formatDate = (dateString: string) => {
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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedTournee, setSelectedTournee] = useState<Tournee | null>(null)
  const [livreurs, setLivreurs] = useState<User[]>([])
  const [formData, setFormData] = useState({
    dateTournee: "",
    livreurId: "",
    statut: "planifiee",
  })

  const { tournees, loading, error, fetchTournees, getStatistics, createTournee, updateTournee, changeStatus } =
    useTournees()
  const [stats, setStats] = useState({
    nombreTotal: 0,
    tourneesParStatut: {} as Record<string, number>,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, statisticsData] = await Promise.all([userService.getUsersByRole("admin"), getStatistics()])
        setLivreurs(usersData)
        if (statisticsData) {
          setStats(statisticsData)
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
      }
    }
    loadData()
  }, [getStatistics])

  const filteredTournees = tournees.filter((tournee) => {
    const matchesSearch =
      tournee.livreur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournee.livreur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournee.id.toString().includes(searchTerm)

    const matchesStatus = statusFilter === "all" || tournee.statut === statusFilter
    const matchesLivreur = livreurFilter === "all" || tournee.livreurId.toString() === livreurFilter

    return matchesSearch && matchesStatus && matchesLivreur
  })

  const mapMarkers = useMemo(() => {
    const markers: Array<{
      position: { lat: number; lng: number }
      title: string
      label: string
    }> = []

    filteredTournees.forEach((tournee, index) => {
      if (tournee.operationsLogistiques && tournee.operationsLogistiques.length > 0) {
        tournee.operationsLogistiques.forEach((operation, opIndex) => {
          const baseLatLome = 6.1256
          const baseLngLome = 1.2223
          const offset = index * 0.01 + opIndex * 0.005

          markers.push({
            position: {
              lat: baseLatLome + offset,
              lng: baseLngLome + offset,
            },
            title: `${operation.type === "collecte" ? "Collecte" : "Livraison"} - Tournée #${tournee.id}`,
            label: `${index + 1}${String.fromCharCode(65 + opIndex)}`,
          })
        })
      }
    })

    return markers
  }, [filteredTournees])

  const handleCreateClick = () => {
    setSelectedTournee(null)
    setFormData({
      dateTournee: "",
      livreurId: "",
      statut: "planifiee",
    })
    setIsCreateModalOpen(true)
  }

  const handleEditClick = (tournee: Tournee) => {
    setSelectedTournee(tournee)
    setFormData({
      dateTournee: tournee.dateTournee.split("T")[0],
      livreurId: tournee.livreurId.toString(),
      statut: tournee.statut,
    })
    setIsCreateModalOpen(true)
  }

  const handleViewDetails = (tournee: Tournee) => {
    setSelectedTournee(tournee)
    setIsDetailsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.dateTournee || !formData.livreurId) {
      return
    }

    const data = {
      dateTournee: new Date(formData.dateTournee),
      livreurId: Number.parseInt(formData.livreurId),
      statut: formData.statut,
    }

    if (selectedTournee) {
      await updateTournee(selectedTournee.id, data)
    } else {
      await createTournee(data)
    }

    setIsCreateModalOpen(false)
    await fetchTournees()
  }

  const handleChangeStatus = async (tourneeId: number, newStatus: string) => {
    await changeStatus(tourneeId, { statut: newStatus })
    await fetchTournees()
  }

  const planifiedCount = stats.tourneesParStatut?.planifiee || 0
  const inProgressCount = stats.tourneesParStatut?.en_cours || 0
  const completedCount = stats.tourneesParStatut?.terminee || 0

  if (loading) {
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

  if (error) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-red-500">Erreur: {error}</p>
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
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCreateClick}>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Carte des tournées - Lomé</CardTitle>
              </CardHeader>
              <CardContent>
                <GoogleMap
                  center={{ lat: 6.1256, lng: 1.2223 }}
                  zoom={13}
                  markers={mapMarkers}
                  className="w-full h-[500px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tournées actives</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        className="pl-10 w-48"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="planifiee">Planifiée</SelectItem>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="terminee">Terminée</SelectItem>
                        <SelectItem value="annulee">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[450px] overflow-y-auto">
                  {filteredTournees.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">Aucune tournée trouvée</div>
                  ) : (
                    filteredTournees.slice(0, 8).map((tournee) => (
                      <div
                        key={tournee.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => handleViewDetails(tournee)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">Tournée #{tournee.id}</p>
                            <Badge className={getStatusColor(tournee.statut)}>{getStatusLabel(tournee.statut)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {tournee.livreur ? `${tournee.livreur.nom} ${tournee.livreur.prenom || ""}` : "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {tournee.operationsLogistiques?.length || 0} opérations • {formatDate(tournee.dateTournee)}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(tournee)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(tournee)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleChangeStatus(tournee.id, "en_cours")}>
                              Démarrer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeStatus(tournee.id, "terminee")}>
                              Terminer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeStatus(tournee.id, "annulee")}>
                              Annuler
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Toutes les tournées</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={livreurFilter} onValueChange={setLivreurFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Livreur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les livreurs</SelectItem>
                      {livreurs.map((livreur) => (
                        <SelectItem key={livreur.id} value={livreur.id.toString()}>
                          {livreur.nom} {livreur.prenom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Livreur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Opérations</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTournees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Aucune tournée trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTournees.map((tournee) => (
                      <TableRow key={tournee.id}>
                        <TableCell className="font-medium">#{tournee.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {tournee.livreur ? `${tournee.livreur.nom} ${tournee.livreur.prenom || ""}` : "N/A"}
                            </p>
                            <p className="text-sm text-muted-foreground">{tournee.livreur?.telephone || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(tournee.dateTournee)}</TableCell>
                        <TableCell>{tournee.operationsLogistiques?.length || 0} opérations</TableCell>
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
                              <DropdownMenuItem onClick={() => handleEditClick(tournee)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleChangeStatus(tournee.id, "en_cours")}>
                                Démarrer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus(tournee.id, "terminee")}>
                                Terminer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus(tournee.id, "annulee")}>
                                Annuler
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTournee ? "Modifier la tournée" : "Créer une tournée"}</DialogTitle>
            <DialogDescription>
              {selectedTournee ? "Modifiez les informations de la tournée" : "Créez une nouvelle tournée de livraison"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dateTournee">Date de la tournée</Label>
              <Input
                id="dateTournee"
                type="date"
                value={formData.dateTournee}
                onChange={(e) => setFormData({ ...formData, dateTournee: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="livreurId">Livreur</Label>
              <Select
                value={formData.livreurId}
                onValueChange={(value) => setFormData({ ...formData, livreurId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un livreur" />
                </SelectTrigger>
                <SelectContent>
                  {livreurs.map((livreur) => (
                    <SelectItem key={livreur.id} value={livreur.id.toString()}>
                      {livreur.nom} {livreur.prenom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(value) => setFormData({ ...formData, statut: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planifiee">Planifiée</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="terminee">Terminée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la tournée #{selectedTournee?.id}</DialogTitle>
          </DialogHeader>
          {selectedTournee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Livreur</p>
                  <p className="text-sm">
                    {selectedTournee.livreur
                      ? `${selectedTournee.livreur.nom} ${selectedTournee.livreur.prenom || ""}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-sm">{formatDate(selectedTournee.dateTournee)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <Badge className={getStatusColor(selectedTournee.statut)}>
                    {getStatusLabel(selectedTournee.statut)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Opérations</p>
                  <p className="text-sm">{selectedTournee.operationsLogistiques?.length || 0} opérations</p>
                </div>
              </div>
              {selectedTournee.operationsLogistiques && selectedTournee.operationsLogistiques.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Liste des opérations</p>
                  <div className="space-y-2">
                    {selectedTournee.operationsLogistiques.map((op) => (
                      <div key={op.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">
                            {op.type === "collecte" ? "Collecte" : "Livraison"} #{op.id}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(op.datePrevue)}</p>
                        </div>
                        <Badge variant="outline">{op.statut}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
