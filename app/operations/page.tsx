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
import { Search, Eye, Edit, MoreHorizontal, Plus, Package, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { useOperationLogistiques } from "@/hooks/use-operation-logistiques"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { OperationLogistiqueModal } from "@/components/operation-logistique-modal"
import { tourneeService } from "@/lib/api/services/tournee.service"
import { commandeService } from "@/lib/api/services/commande.service"
import type { Tournee } from "@/lib/api/types/tournee"
import type { Commande } from "@/lib/api/types/commande"
import type { OperationLogistique } from "@/lib/api/types/operation-logistique"

const getStatusColor = (status: string) => {
  switch (status) {
    case "planifiee":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "en_cours":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case "realisee":
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
    realisee: "Réalisée",
    annulee: "Annulée",
  }
  return labels[status] || status
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    collecte: "Collecte",
    livraison: "Livraison",
  }
  return labels[type] || type
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: fr })
  } catch {
    return dateString
  }
}

export default function OperationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const { operations, loading, error, fetchOperations, getStatistics, createOperation, updateOperation } =
    useOperationLogistiques()
  const [stats, setStats] = useState({
    nombreTotal: 0,
    operationsParType: {} as Record<string, number>,
    operationsParStatut: {} as Record<string, number>,
    operationsEnRetard: 0,
    tauxRealisation: 0,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState<OperationLogistique | null>(null)
  const [tournees, setTournees] = useState<Tournee[]>([])
  const [commandes, setCommandes] = useState<Commande[]>([])

  useEffect(() => {
    const loadStatistics = async () => {
      const statistics = await getStatistics()
      if (statistics) {
        setStats(statistics)
      }
    }
    loadStatistics()
  }, [getStatistics])

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[v0] Loading tournees and commandes...")
        const [tourneesData, commandesData] = await Promise.all([tourneeService.getAll(), commandeService.getAll()])
        console.log("[v0] Tournees loaded:", tourneesData)
        console.log("[v0] Commandes loaded:", commandesData)
        setTournees(Array.isArray(tourneesData) ? tourneesData : [])
        setCommandes(Array.isArray(commandesData) ? commandesData : [])
      } catch (err) {
        console.error("[v0] Erreur lors du chargement des données:", err)
      }
    }
    loadData()
  }, [])

  const handleSaveOperation = async (data: any) => {
    if (selectedOperation) {
      await updateOperation(selectedOperation.id, data)
    } else {
      await createOperation(data)
    }
    setSelectedOperation(null)
    await fetchOperations()
  }

  const handleEditClick = (operation: OperationLogistique) => {
    setSelectedOperation(operation)
    setIsModalOpen(true)
  }

  const handleNewOperation = () => {
    setSelectedOperation(null)
    setIsModalOpen(true)
  }

  const filteredOperations = operations.filter((operation) => {
    const matchesSearch =
      operation.tournee?.livreur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.id.toString().includes(searchTerm)

    const matchesStatus = statusFilter === "all" || operation.statut === statusFilter
    const matchesType = typeFilter === "all" || operation.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const planifiedCount = operations.filter((o) => o.statut === "planifiee").length
  const inProgressCount = operations.filter((o) => o.statut === "en_cours").length
  const completedCount = operations.filter((o) => o.statut === "realisee").length

  if (loading) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Chargement des opérations...</p>
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
              <h1 className="text-3xl font-bold text-balance">Opérations logistiques</h1>
              <p className="text-muted-foreground">Gérez les collectes et livraisons</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleNewOperation}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle opération
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total opérations</p>
                  <p className="text-2xl font-bold">{stats.nombreTotal}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En retard</p>
                  <p className="text-2xl font-bold">{stats.operationsEnRetard}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
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
                  <p className="text-sm font-medium text-muted-foreground">Réalisées</p>
                  <p className="text-2xl font-bold">{completedCount}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Toutes les opérations</CardTitle>
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
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="collecte">Collecte</SelectItem>
                      <SelectItem value="livraison">Livraison</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="planifiee">Planifiée</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="realisee">Réalisée</SelectItem>
                      <SelectItem value="annulee">Annulée</SelectItem>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Tournée</TableHead>
                    <TableHead>Livreur</TableHead>
                    <TableHead>Date prévue</TableHead>
                    <TableHead>Preuves</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Aucune opération trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOperations.map((operation) => (
                      <TableRow key={operation.id}>
                        <TableCell className="font-medium">#{operation.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(operation.type)}</Badge>
                        </TableCell>
                        <TableCell>#{operation.tourneeId}</TableCell>
                        <TableCell>
                          {operation.tournee?.livreur
                            ? `${operation.tournee.livreur.nom} ${operation.tournee.livreur.prenom || ""}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>{formatDate(operation.datePrevue)}</TableCell>
                        <TableCell>{operation.preuves?.length || 0} preuve(s)</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(operation.statut)}>{getStatusLabel(operation.statut)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(operation)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
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

          <OperationLogistiqueModal
            operation={selectedOperation}
            onSave={handleSaveOperation}
            tournees={tournees}
            commandes={commandes}
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
        </main>
      </SidebarInset>
    </>
  )
}
