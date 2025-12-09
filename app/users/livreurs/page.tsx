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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LivreurModal } from "@/components/livreur-modal"
import { useLivreurs } from "@/hooks/use-livreurs"
import type { Livreur, LivreurStatistics } from "@/lib/api/types/livreur"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react"

export default function LivreursPage() {
  const { livreurs, loading, error, createLivreur, updateLivreur, deleteLivreur, changerDisponibilite, getStatistics } =
    useLivreurs()

  const [searchTerm, setSearchTerm] = useState("")
  const [disponibiliteFilter, setDisponibiliteFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLivreur, setSelectedLivreur] = useState<Livreur | null>(null)
  const [statistics, setStatistics] = useState<LivreurStatistics | null>(null)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    const stats = await getStatistics()
    if (stats) {
      setStatistics(stats)
    }
  }

  const filteredLivreurs = livreurs.filter((livreur) => {
    const matchesSearch =
      livreur.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livreur.user?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livreur.user?.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livreur.user?.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDisponibilite =
      disponibiliteFilter === "all" ||
      (disponibiliteFilter === "disponible" && livreur.estDisponible) ||
      (disponibiliteFilter === "indisponible" && !livreur.estDisponible) ||
      (disponibiliteFilter === "en_tournee" && livreur.nombreTourneesEnCours > 0)

    return matchesSearch && matchesDisponibilite
  })

  const handleCreateLivreur = () => {
    setSelectedLivreur(null)
    setIsModalOpen(true)
  }

  const handleEditLivreur = (livreur: Livreur) => {
    setSelectedLivreur(livreur)
    setIsModalOpen(true)
  }

  const handleSaveLivreur = async (livreurData: any) => {
    console.log("[v0] handleSaveLivreur called with data:", livreurData)
    console.log("[v0] selectedLivreur:", selectedLivreur)

    if (selectedLivreur) {
      const success = await updateLivreur(selectedLivreur.id, livreurData)
      console.log("[v0] Update result:", success)
      if (success) {
        setIsModalOpen(false)
        await loadStatistics()
      }
    } else {
      console.log("[v0] Creating new livreur")
      const newLivreur = await createLivreur(livreurData)
      console.log("[v0] Create result:", newLivreur)
      if (newLivreur) {
        setIsModalOpen(false)
        await loadStatistics()
      }
    }
  }

  const handleDeleteLivreur = async (livreurId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce livreur ?")) {
      return
    }

    const success = await deleteLivreur(livreurId)
    if (success) {
      await loadStatistics()
    }
  }

  const handleToggleDisponibilite = async (livreur: Livreur) => {
    const success = await changerDisponibilite(livreur.id, {
      estDisponible: !livreur.estDisponible,
      raisonIndisponibilite: !livreur.estDisponible ? undefined : "Marqué indisponible par l'admin",
    })

    if (success) {
      await loadStatistics()
    }
  }

  const getDisponibiliteBadge = (livreur: Livreur) => {
    if (livreur.nombreTourneesEnCours > 0) {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">En tournée</Badge>
    }
    if (livreur.estDisponible) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disponible</Badge>
    }
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Indisponible</Badge>
  }

  if (loading) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Chargement des livreurs...</span>
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
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* En-tête */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Gestion des livreurs</h1>
              <p className="text-muted-foreground">Gérez vos livreurs, leur disponibilité et leurs performances</p>
            </div>
            <Button onClick={handleCreateLivreur} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau livreur
            </Button>
          </div>

          {/* Statistiques */}
          {statistics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total livreurs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.nombreTotal}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{statistics.disponibles}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En tournée</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{statistics.enTournee}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux de réussite moyen</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{statistics.tauxReussiteMoyen.toFixed(1)}%</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtres et recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par matricule, nom, prénom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={disponibiliteFilter} onValueChange={setDisponibiliteFilter}>
                  <SelectTrigger className="w-full sm:w-56">
                    <SelectValue placeholder="Filtrer par disponibilité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les livreurs</SelectItem>
                    <SelectItem value="disponible">Disponibles</SelectItem>
                    <SelectItem value="indisponible">Indisponibles</SelectItem>
                    <SelectItem value="en_tournee">En tournée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des livreurs */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des livreurs ({filteredLivreurs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Livreur</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Disponibilité</TableHead>
                    <TableHead>Tournées</TableHead>
                    <TableHead>Taux réussite</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLivreurs.map((livreur) => (
                    <TableRow key={livreur.id}>
                      <TableCell>
                        <div className="font-mono font-medium">{livreur.matricule}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {livreur.user?.prenom} {livreur.user?.nom}
                          </div>
                          <div className="text-sm text-muted-foreground">ID: {livreur.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{livreur.user?.email}</div>
                          <div className="text-sm text-muted-foreground">{livreur.user?.telephone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getDisponibiliteBadge(livreur)}
                          {!livreur.estDisponible && livreur.raisonIndisponibilite && (
                            <div className="text-xs text-muted-foreground">{livreur.raisonIndisponibilite}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">Total: {livreur.nombreTourneesTotal}</div>
                          <div className="text-sm text-orange-600">En cours: {livreur.nombreTourneesEnCours}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {livreur.tauxReussite != null ? livreur.tauxReussite.toFixed(1) : "0.0"}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditLivreur(livreur)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleDisponibilite(livreur)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {livreur.estDisponible ? "Marquer indisponible" : "Marquer disponible"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteLivreur(livreur.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLivreurs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun livreur trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      <LivreurModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        livreur={selectedLivreur}
        onSave={handleSaveLivreur}
      />
    </>
  )
}
