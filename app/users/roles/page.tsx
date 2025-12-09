"use client"

import type React from "react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Shield, Users, Settings, Loader2 } from "lucide-react"
import { roleService } from "@/lib/api/services/role.service"
import { permissionService } from "@/lib/api/services/permission.service"

import type { Role, Permission, CreateRoleData, UpdateRoleData } from "@/lib/api/types"

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    permissions: [] as number[],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [rolesData, permissionsData] = await Promise.all([roleService.getAll(), permissionService.getAll()])
      setRoles(rolesData)
      setPermissions(permissionsData)
    } catch (err) {
      setError("Erreur lors du chargement des données")
      console.error("Error loading data:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRoles = roles.filter(
    (role) =>
      role.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleCreateRole = () => {
    setSelectedRole(null)
    setFormData({ nom: "", description: "", permissions: [] })
    setIsModalOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      nom: role.nom,
      description: role.description || "",
      permissions: role.permissions.map((p) => p.id),
    })
    setIsModalOpen(true)
  }

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)

      if (selectedRole) {
        // Modifier rôle existant
        const updateData: UpdateRoleData = {
          nom: formData.nom,
          description: formData.description,
        }
        await roleService.update(selectedRole.id, updateData)
      } else {
        // Créer nouveau rôle
        const createData: CreateRoleData = {
          nom: formData.nom,
          description: formData.description,
        }
        await roleService.create(createData)
      }

      await loadData() // Recharger les données
      setIsModalOpen(false)
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce rôle ?")) return

    try {
      setError(null)
      await roleService.delete(roleId)
      await loadData() // Recharger les données
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression")
    }
  }

  const togglePermission = (permissionId: number) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const getPermissionsByModule = () => {
    const modules: Record<string, Permission[]> = {}
    permissions.forEach((permission) => {
      // Extraire le module du nom de la permission ou utiliser "Général" par défaut
      const module = permission.nom.includes("Gérer")
        ? "Gestion"
        : permission.nom.includes("Voir")
          ? "Consultation"
          : "Général"
      if (!modules[module]) {
        modules[module] = []
      }
      modules[module].push(permission)
    })
    return modules
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
              <span>Chargement des rôles...</span>
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
            <Card className="border-destructive">
              <CardContent className="p-4">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={loadData} className="mt-2 bg-transparent">
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          )}

          {/* En-tête */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Rôles & Permissions</h1>
              <p className="text-muted-foreground mt-1">Gérez les rôles utilisateurs et leurs permissions</p>
            </div>
            <Button onClick={handleCreateRole} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau rôle
            </Button>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total rôles</p>
                    <p className="text-2xl font-bold">{roles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Permissions</p>
                    <p className="text-2xl font-bold">{permissions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Utilisateurs assignés</p>
                    <p className="text-2xl font-bold">
                      {roles.reduce((sum, role) => sum + (role.utilisateurs?.length || 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un rôle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tableau des rôles */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des rôles ({filteredRoles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Utilisateurs</TableHead>
                      <TableHead>Date création</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="font-medium">{role.nom}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-muted-foreground truncate">
                            {role.description || "Aucune description"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{role.permissions.length} permissions</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{role.utilisateurs?.length || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(role.created_at).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteRole(role.id)}
                                className="text-destructive"
                                disabled={(role.utilisateurs?.length || 0) > 0}
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

      {/* Modal de création/modification */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedRole ? "Modifier le rôle" : "Nouveau rôle"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveRole} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom du rôle *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
                  placeholder="Ex: Gestionnaire"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description du rôle et de ses responsabilités"
                rows={3}
                disabled={submitting}
              />
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              <div className="space-y-6">
                {Object.entries(getPermissionsByModule()).map(([module, modulePermissions]) => (
                  <div key={module} className="space-y-3">
                    <h4 className="font-medium text-sm text-primary">{module}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                      {modulePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={permission.id.toString()}
                            checked={formData.permissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                            disabled={submitting}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={permission.id.toString()}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {permission.nom}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description || "Aucune description"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                Annuler
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {selectedRole ? "Mettre à jour" : "Créer le rôle"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
