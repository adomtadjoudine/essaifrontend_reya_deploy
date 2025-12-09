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
import { UserModal } from "@/components/user-modal"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Shield, ShieldCheck, Clock, AlertTriangle } from "lucide-react"

interface AdminUser {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  roles: string[]
  statut: "actif" | "inactif" | "suspendu"
  dateCreation: string
  derniereConnexion?: string
  niveauAcces: "Super Admin" | "Admin" | "Admin Limité"
  derniereActivite: string
}

// Données de démonstration pour les administrateurs
const mockAdmins: AdminUser[] = [
  {
    id: "1",
    nom: "Dubois",
    prenom: "Marie",
    email: "marie.dubois@ereya.com",
    telephone: "+33 1 23 45 67 89",
    roles: ["Administrateur"],
    statut: "actif",
    dateCreation: "2024-01-15",
    derniereConnexion: "2024-09-07 09:30",
    niveauAcces: "Super Admin",
    derniereActivite: "Modification des services",
  },
  {
    id: "2",
    nom: "Martin",
    prenom: "Pierre",
    email: "pierre.martin@ereya.com",
    telephone: "+33 1 23 45 67 90",
    roles: ["Administrateur", "Gestionnaire"],
    statut: "actif",
    dateCreation: "2024-02-20",
    derniereConnexion: "2024-09-06 16:45",
    niveauAcces: "Admin",
    derniereActivite: "Validation des commandes",
  },
  {
    id: "3",
    nom: "Leroy",
    prenom: "Sophie",
    email: "sophie.leroy@ereya.com",
    telephone: "+33 1 23 45 67 91",
    roles: ["Gestionnaire"],
    statut: "actif",
    dateCreation: "2024-03-10",
    derniereConnexion: "2024-09-07 08:15",
    niveauAcces: "Admin Limité",
    derniereActivite: "Gestion des livreurs",
  },
]

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>(mockAdmins)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null)

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateAdmin = () => {
    setSelectedAdmin(null)
    setIsModalOpen(true)
  }

  const handleEditAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin)
    setIsModalOpen(true)
  }

  const handleSaveAdmin = (userData: Partial<AdminUser>) => {
    if (selectedAdmin) {
      // Modifier admin existant
      setAdmins((prev) => prev.map((admin) => (admin.id === selectedAdmin.id ? { ...admin, ...userData } : admin)))
    } else {
      // Créer nouvel admin
      const newAdmin: AdminUser = {
        id: Date.now().toString(),
        ...(userData as Omit<AdminUser, "id">),
        dateCreation: new Date().toISOString().split("T")[0],
        niveauAcces: "Admin Limité",
        derniereActivite: "Compte créé",
      }
      setAdmins((prev) => [...prev, newAdmin])
    }
  }

  const handleDeleteAdmin = (adminId: string) => {
    setAdmins((prev) => prev.filter((admin) => admin.id !== adminId))
  }

  const getStatusBadge = (statut: AdminUser["statut"]) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
      case "suspendu":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspendu</Badge>
    }
  }

  const getAccessLevelBadge = (niveau: AdminUser["niveauAcces"]) => {
    switch (niveau) {
      case "Super Admin":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Super Admin</Badge>
      case "Admin":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Admin</Badge>
      case "Admin Limité":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Admin Limité</Badge>
    }
  }

  return (
    <>
      <AdminSidebar />
      <SidebarInset>
        <AdminTopbar />

        <main className="flex-1 space-y-6 p-6">
          {/* En-tête */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Administrateurs</h1>
              <p className="text-muted-foreground mt-1">Gérez les comptes administrateurs et leurs niveaux d'accès</p>
            </div>
            <Button onClick={handleCreateAdmin} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel administrateur
            </Button>
          </div>

          {/* Statistiques rapides */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total admins</p>
                    <p className="text-2xl font-bold">{admins.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Super Admins</p>
                    <p className="text-2xl font-bold">{admins.filter((a) => a.niveauAcces === "Super Admin").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Connectés aujourd'hui</p>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accès limité</p>
                    <p className="text-2xl font-bold">
                      {admins.filter((a) => a.niveauAcces === "Admin Limité").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}

          {/* Recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un administrateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tableau des administrateurs */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des administrateurs ({filteredAdmins.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Administrateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Niveau d'accès</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dernière connexion</TableHead>
                      <TableHead>Dernière activité</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                              <Shield className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {admin.prenom} {admin.nom}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Créé le {new Date(admin.dateCreation).toLocaleDateString("fr-FR")}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{getAccessLevelBadge(admin.niveauAcces)}</TableCell>
                        <TableCell>{getStatusBadge(admin.statut)}</TableCell>
                        <TableCell>
                          {admin.derniereConnexion ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {new Date(admin.derniereConnexion).toLocaleDateString("fr-FR")}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Jamais</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{admin.derniereActivite}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditAdmin(admin)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteAdmin(admin.id)}
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
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedAdmin}
        onSave={handleSaveAdmin}
      />
    </>
  )
}
