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
import { Search, Eye, Edit, MoreHorizontal, Plus, Package, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { useOperationLogistiques } from "@/hooks/use-operation-logistiques"
import { tourneeService } from "@/lib/api/services/tournee.service"
import { commandeService } from "@/lib/api/services/commande.service"
import type { Tournee } from "@/lib/api/types/tournee"
import type { Commande } from "@/lib/api/types/commande"
import type { OperationLogistique } from "@/lib/api/types/operation-logistique"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

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
    case "en_retard":
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
    en_retard: "En retard",
  }
  return labels[status] || status
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    collecte: "Collecte",
    livraison: "Livraison",
    transport: "Transport",
    stockage: "Stockage",
    controle_qualite: "Contrôle qualité",
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
  const [tourneeFilter, setTourneeFilter] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState<OperationLogistique | null>(null)
  const [tournees, setTournees] = useState<Tournee[]>([])
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [formData, setFormData] = useState({
    type: "collecte",
    datePrevue: "",
    tourneeId: "",
    commandeId: "",
    statut: "planifiee",
  })

  const {
    operations,
    loading,
    error,
    fetchOperations,
    getStatistics,
    createOperation,
    updateOperation,
    changeStatus,
    marquerRealisee,
  } = useOperationLogistiques()
  const [stats, setStats] = useState({
    nombreTotal: 0,
    operationsParType: {} as Record<string, number>,
    operationsParStatut: {} as Record<string, number>,
    operationsEnRetard: 0,
    tauxRealisation: 0,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tourneesData, commandesData, statisticsData] = await Promise.all([
          tourneeService.getAll(),
          commandeService.getAll(),
          getStatistics(),
        ])
        setTournees(Array.isArray(tourneesData) ? tourneesData : [])
        setCommandes(Array.isArray(commandesData) ? commandesData : [])
        if (statisticsData) {
          setStats(statisticsData)
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
      }
    }
    loadData()
  }, [getStatistics])

  const filteredOperations = operations.filter((operation) => {
    const matchesSearch =
      operation.tournee?.livreur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.id.toString().includes(searchTerm) ||
      operation.commande?.id.toString().includes(searchTerm)

    const matchesStatus = statusFilter === "all" || operation.statut === statusFilter
    const matchesType = typeFilter === "all" || operation.type === typeFilter
    const matchesTournee = tourneeFilter === "all" || operation.tourneeId.toString() === tourneeFilter

    return matchesSearch && matchesStatus && matchesType && matchesTournee
  })

  const handleCreateClick = () => {
    setSelectedOperation(null)
    setFormData({
      type: "collecte",
      datePrevue: "",
      tourneeId: "",
      commandeId: "",
      statut: "planifiee",
    })
    setIsCreateModalOpen(true)
  }

  const handleEditClick = (operation: OperationLogistique) => {
    setSelectedOperation(operation)
    setFormData({
      type: operation.type,
      datePrevue: operation.datePrevue.split("T")[0],
      tourneeId: operation.tourneeId.toString(),
      commandeId: operation.commandeId.toString(),
      statut: operation.statut,
    })
    setIsCreateModalOpen(true)
  }

  const handleViewDetails = (operation: OperationLogistique) => {
    setSelectedOperation(operation)
    setIsDetailsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.datePrevue || !formData.tourneeId || !formData.commandeId) {
      return
    }

    const data = {
      type: formData.type,
      datePrevue: new Date(formData.datePrevue),
      tourneeId: Number.parseInt(formData.tourneeId),
      commandeId: Number.parseInt(formData.commandeId),
      statut: formData.statut,
    }

    if (selectedOperation) {
      await updateOperation(selectedOperation.id, data)
    } else {
      await createOperation(data)
    }

    setIsCreateModalOpen(false)
    await fetchOperations()
  }

  const handleChangeStatus = async (operationId: number, newStatus: string) => {
    await changeStatus(operationId, { statut: newStatus })
    await fetchOperations()
  }

  const handleMarkDone = async (operationId: number) => {
    await marquerRealisee(operationId)
    await fetchOperations()
  }

  const planifiedCount = stats.operationsParStatut?.planifiee || 0
  const inProgressCount = stats.operationsParStatut?.en_cours || 0
  const completedCount = stats.operationsParStatut?.realisee || 0

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
              <p className="text-muted-foreground">Suivez chaque opération de collecte et livraison</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCreateClick}>
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
                  <Select value={tourneeFilter} onValueChange={setTourneeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Tournée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {tournees.map((tournee) => (
                        <SelectItem key={tournee.id} value={tournee.id.toString()}>
                          Tournée #{tournee.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="collecte">Collecte</SelectItem>
                      <SelectItem value="livraison">Livraison</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="stockage">Stockage</SelectItem>
                      <SelectItem value="controle_qualite">Contrôle qualité</SelectItem>
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
                      <SelectItem value="en_retard">En retard</SelectItem>
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
                    <TableHead>Commande</TableHead>
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
                        <TableCell>Tournée #{operation.tourneeId}</TableCell>
                        <TableCell>Commande #{operation.commandeId}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleViewDetails(operation)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(operation)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleChangeStatus(operation.id, "en_cours")}>
                                Démarrer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMarkDone(operation.id)}>
                                Marquer comme réalisée
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus(operation.id, "annulee")}>
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
            <DialogTitle>{selectedOperation ? "Modifier l'opération" : "Créer une opération"}</DialogTitle>
            <DialogDescription>
              {selectedOperation
                ? "Modifiez les informations de l'opération"
                : "Créez une nouvelle opération logistique"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type d'opération</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collecte">Collecte</SelectItem>
                  <SelectItem value="livraison">Livraison</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="stockage">Stockage</SelectItem>
                  <SelectItem value="controle_qualite">Contrôle qualité</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="datePrevue">Date prévue</Label>
              <Input
                id="datePrevue"
                type="date"
                value={formData.datePrevue}
                onChange={(e) => setFormData({ ...formData, datePrevue: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tourneeId">Tournée</Label>
              <Select
                value={formData.tourneeId}
                onValueChange={(value) => setFormData({ ...formData, tourneeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une tournée" />
                </SelectTrigger>
                <SelectContent>
                  {tournees.map((tournee) => (
                    <SelectItem key={tournee.id} value={tournee.id.toString()}>
                      Tournée #{tournee.id} - {tournee.livreur?.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="commandeId">Commande</Label>
              <Select
                value={formData.commandeId}
                onValueChange={(value) => setFormData({ ...formData, commandeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une commande" />
                </SelectTrigger>
                <SelectContent>
                  {commandes.map((commande) => (
                    <SelectItem key={commande.id} value={commande.id.toString()}>
                      Commande #{commande.id}
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
                  <SelectItem value="realisee">Réalisée</SelectItem>
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
            <DialogTitle>Détails de l'opération #{selectedOperation?.id}</DialogTitle>
          </DialogHeader>
          {selectedOperation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-sm">{getTypeLabel(selectedOperation.type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <Badge className={getStatusColor(selectedOperation.statut)}>
                    {getStatusLabel(selectedOperation.statut)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date prévue</p>
                  <p className="text-sm">{formatDate(selectedOperation.datePrevue)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date réelle</p>
                  <p className="text-sm">
                    {selectedOperation.dateReelle ? formatDate(selectedOperation.dateReelle) : "Non réalisée"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tournée</p>
                  <p className="text-sm">Tournée #{selectedOperation.tourneeId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commande</p>
                  <p className="text-sm">Commande #{selectedOperation.commandeId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Preuves</p>
                  <p className="text-sm">{selectedOperation.preuves?.length || 0} preuve(s)</p>
                </div>
              </div>
              {selectedOperation.preuves && selectedOperation.preuves.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Liste des preuves</p>
                  <div className="space-y-2">
                    {selectedOperation.preuves.map((preuve) => (
                      <div key={preuve.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{preuve.typePreuve}</p>
                          <p className="text-xs text-muted-foreground">{preuve.fichiers?.length || 0} fichier(s)</p>
                        </div>
                        <Badge variant="outline">Preuve #{preuve.id}</Badge>
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
