"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  User,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  Calendar,
  MoreVertical,
  UserCheck,
  UserX,
  Archive,
  Eye,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { clientService } from "@/lib/api/services/client.service"
import { useToast } from "@/hooks/use-toast"

interface UserWithClient {
  id: number
  email: string
  telephone: string
  nom: string | null
  prenom: string | null
  fullName: string | null
  isActive: boolean
  derniereConnexion: string | null
  typeCompte: string
  client?: {
    id: number
    codeClient: string
    nombreCommandeTotal: number
    montantTotalDepense: number
    estBloque: boolean
  }
}

export default function CustomersPage() {
  const [users, setUsers] = useState<UserWithClient[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<UserWithClient | null>(null)
  const [actionType, setActionType] = useState<"toggle" | "archive" | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchClients()
  }, [currentPage])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.telephone.includes(searchTerm),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await clientService.getClients(currentPage, 20, searchTerm)
      console.log("[v0] Clients fetched:", response)

      setUsers(response.data.data)
      setFilteredUsers(response.data.data)
      setTotalPages(response.data.meta.lastPage)
    } catch (err) {
      console.error("[v0] Error fetching clients:", err)
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async () => {
    if (!selectedUser) return

    try {
      const response = await clientService.toggleActive(selectedUser.id)
      toast({
        title: "Succès",
        description: response.message,
      })
      fetchClients()
    } catch (err) {
      console.error("[v0] Error toggling client status:", err)
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du client",
        variant: "destructive",
      })
    } finally {
      setSelectedUser(null)
      setActionType(null)
    }
  }

  const handleArchive = async () => {
    if (!selectedUser) return

    try {
      const response = await clientService.archiveClient(selectedUser.id)
      toast({
        title: "Succès",
        description: response.message,
      })
      fetchClients()
    } catch (err) {
      console.error("[v0] Error archiving client:", err)
      toast({
        title: "Erreur",
        description: "Impossible d'archiver le client",
        variant: "destructive",
      })
    } finally {
      setSelectedUser(null)
      setActionType(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const totalClients = users.filter((u) => u.client).length
  const activeClients = users.filter((u) => u.isActive && u.client).length
  const blockedClients = users.filter((u) => u.client?.estBloque).length
  const totalRevenue = users.reduce((sum, u) => {
    const montant = Number(u.client?.montantTotalDepense) || 0
    return sum + montant
  }, 0)

  if (loading) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Chargement des clients...</p>
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
              <h1 className="text-3xl font-bold text-balance">Clients</h1>
              <p className="text-muted-foreground">Gérez tous les clients de votre plateforme</p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Clients</p>
                  <p className="text-2xl font-bold text-blue-900">{totalClients}</p>
                  <p className="text-xs text-blue-700 mt-1">Tous les clients</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Clients Actifs</p>
                  <p className="text-2xl font-bold text-green-900">{activeClients}</p>
                  <p className="text-xs text-green-700 mt-1">Comptes actifs</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-900">Clients Bloqués</p>
                  <p className="text-2xl font-bold text-red-900">{blockedClients}</p>
                  <p className="text-xs text-red-700 mt-1">Comptes bloqués</p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Chiffre d'Affaires</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-purple-700 mt-1">Total dépensé</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
          </div>

          {/* Table des clients */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Liste des Clients</CardTitle>
                  <CardDescription>Gérez les comptes clients et leurs informations</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, email ou téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Code Client</TableHead>
                    <TableHead className="text-right">Commandes</TableHead>
                    <TableHead className="text-right">Total Dépensé</TableHead>
                    <TableHead>Dernière Connexion</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun client trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers
                      .filter((user) => user.client)
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {user.fullName || `${user.prenom || ""} ${user.nom || ""}`.trim() || "N/A"}
                                </div>
                                {/* <div className="text-sm text-muted-foreground">ID: {user.id}</div> */}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{user.telephone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {user.client?.codeClient || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{user.client?.nombreCommandeTotal || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(user.client?.montantTotalDepense || 0)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{formatDate(user.derniereConnexion)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {user.isActive ? (
                                <Badge className="bg-green-100 text-green-800 border-green-300">Actif</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 border-red-300">Inactif</Badge>
                              )}
                              {user.client?.estBloque && (
                                <Badge className="bg-red-100 text-red-800 border-red-300">Bloqué</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setActionType("toggle")
                                  }}
                                >
                                  {user.isActive ? (
                                    <>
                                      <UserX className="h-4 w-4 mr-2" />
                                      Désactiver
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Activer
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setActionType("archive")
                                  }}
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archiver
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      {/* Dialog de confirmation pour activer/désactiver */}
      <AlertDialog open={actionType === "toggle"} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedUser?.isActive ? "Désactiver" : "Activer"} le client</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir {selectedUser?.isActive ? "désactiver" : "activer"} le compte de{" "}
              <strong>{selectedUser?.fullName || selectedUser?.email}</strong> ?
              {selectedUser?.isActive
                ? " Le client ne pourra plus se connecter."
                : " Le client pourra à nouveau se connecter."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleActive}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation pour archiver */}
      <AlertDialog open={actionType === "archive"} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver le client</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir archiver le compte de{" "}
              <strong>{selectedUser?.fullName || selectedUser?.email}</strong> ? Cette action peut être annulée
              ultérieurement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} className="bg-red-600 hover:bg-red-700">
              Archiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
