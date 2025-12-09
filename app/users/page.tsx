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
import { UserModal } from "@/components/user-modal"
import { userService } from "@/lib/api/services/user.service"
import type { User, CreateUserData, UpdateUserData } from "@/lib/api/types"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Clock, Loader2 } from "lucide-react"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("[v0] Chargement des utilisateurs depuis l'API...")

      const apiUsers = await userService.getAllUsers()
      console.log("[v0] Utilisateurs récupérés:", apiUsers)

      if (Array.isArray(apiUsers)) {
        setUsers(apiUsers)
      } else {
        console.error("[v0] Les données reçues ne sont pas un tableau:", apiUsers)
        setUsers([])
        setError("Format de données invalide reçu de l'API")
      }
    } catch (err) {
      console.error("[v0] Erreur lors du chargement des utilisateurs:", err)
      setError("Impossible de charger les utilisateurs. Vérifiez votre connexion.")
      setUsers([]) // Initialiser avec un tableau vide en cas d'erreur
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const matchesSearch =
          user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesRole = roleFilter === "all" || user.roles.some((role) => role.nom === roleFilter)

        return matchesSearch && matchesRole
      })
    : []

  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleSaveUser = async (userData: Partial<User> & { motDePasse?: string }) => {
    try {
      console.log("[v0] Sauvegarde de l'utilisateur:", userData)

      if (selectedUser) {
        // Mise à jour d'un utilisateur existant
        const updateData: UpdateUserData = {
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          telephone: userData.telephone,
        }

        await userService.updateUser(selectedUser.id, updateData)
        console.log("[v0] Utilisateur mis à jour avec succès")
      } else {
        // Création d'un nouvel utilisateur
        const createData: CreateUserData = {
          nom: userData.nom!,
          prenom: userData.prenom!,
          email: userData.email!,
          password: userData.motDePasse!,
          telephone: userData.telephone!,
        }

        await userService.createUser(createData)
        console.log("[v0] Utilisateur créé avec succès")
      }

      // Rechargement de la liste des utilisateurs
      await loadUsers()
      setIsModalOpen(false)
    } catch (err) {
      console.error("[v0] Erreur lors de la sauvegarde:", err)
      setError("Erreur lors de la sauvegarde de l'utilisateur")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return
    }

    try {
      console.log("[v0] Suppression de l'utilisateur ID:", userId)
      await userService.deleteUser(userId)
      console.log("[v0] Utilisateur supprimé avec succès")
      await loadUsers()
    } catch (err) {
      console.error("[v0] Erreur lors de la suppression:", err)
      setError("Erreur lors de la suppression de l'utilisateur")
    }
  }

  const getStatusBadge = (typeCompte: string) => {
    switch (typeCompte) {
      case "super_admin":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Super Admin</Badge>
      case "admin":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Admin</Badge>
      case "client":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Client</Badge>
      default:
        return <Badge variant="secondary">Utilisateur</Badge>
    }
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      Administrateur: "bg-purple-100 text-purple-800",
      Gestionnaire: "bg-blue-100 text-blue-800",
      "Support Client": "bg-orange-100 text-orange-800",
      Marketing: "bg-pink-100 text-pink-800",
      Livreur: "bg-yellow-100 text-yellow-800",
      Client: "bg-gray-100 text-gray-800",
    }
    return colors[role] || "bg-gray-100 text-gray-800"
  }

  const uniqueRoles = Array.isArray(users)
    ? Array.from(new Set(users.flatMap((user) => user.roles.map((role) => role.nom))))
    : []

  if (loading) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Chargement des utilisateurs...</span>
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
                <div className="flex items-center justify-between">
                  <p className="text-red-800">{error}</p>
                  <Button variant="outline" size="sm" onClick={() => setError(null)}>
                    Fermer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* En-tête */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Gestion des utilisateurs</h1>
              <p className="text-muted-foreground">Gérez les comptes utilisateurs, rôles et permissions</p>
            </div>
            <Button onClick={handleCreateUser} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </div>

          {/* Filtres et recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, prénom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    {uniqueRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des utilisateurs ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Rôles</TableHead>
                    <TableHead>Type de compte</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.prenom} {user.nom}
                          </div>
                          <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.telephone}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role.id} variant="secondary" className={getRoleColor(role.nom)}>
                              {role.nom}
                            </Badge>
                          ))}
                          {user.roles.length === 0 && <Badge variant="outline">Aucun rôle</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.typeCompte)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive">
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
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </>
  )
}
