"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface User {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  roles: Array<{ nom: string }>
  statut: "actif" | "inactif" | "suspendu"
  created_at: string
  updated_at: string
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  onSave: (user: Partial<User> & { motDePasse?: string }) => void
}

const availableRoles = ["Administrateur", "Gestionnaire", "Support Client", "Marketing", "Livreur", "Client"]

export function UserModal({ isOpen, onClose, user, onSave }: UserModalProps) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    roles: [] as string[],
    statut: "actif" as const,
    motDePasse: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        roles: user.roles.map((role) => role.nom),
        statut: user.statut,
        motDePasse: "",
      })
    } else {
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        roles: [],
        statut: "actif",
        motDePasse: "",
      })
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const addRole = (role: string) => {
    if (!formData.roles.includes(role)) {
      setFormData((prev) => ({
        ...prev,
        roles: [...prev.roles, role],
      }))
    }
  }

  const removeRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r !== role),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {user ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData((prev) => ({ ...prev, prenom: e.target.value }))}
                placeholder="Prénom de l'utilisateur"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
                placeholder="Nom de l'utilisateur"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemple.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone *</Label>
            <Input
              id="telephone"
              value={formData.telephone}
              onChange={(e) => setFormData((prev) => ({ ...prev, telephone: e.target.value }))}
              placeholder="+33 1 23 45 67 89"
              required
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="motDePasse">Mot de passe *</Label>
              <Input
                id="motDePasse"
                type="password"
                value={formData.motDePasse}
                onChange={(e) => setFormData((prev) => ({ ...prev, motDePasse: e.target.value }))}
                placeholder="Mot de passe temporaire"
                required={!user}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="statut">Statut</Label>
            <Select
              value={formData.statut}
              onValueChange={(value: any) => setFormData((prev) => ({ ...prev, statut: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Rôles et permissions</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.roles.map((role) => (
                <Badge key={role} variant="secondary" className="flex items-center gap-1">
                  {role}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeRole(role)} />
                </Badge>
              ))}
            </div>
            <Select onValueChange={addRole}>
              <SelectTrigger>
                <SelectValue placeholder="Ajouter un rôle" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles
                  .filter((role) => !formData.roles.includes(role))
                  .map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {user ? "Mettre à jour" : "Créer l'utilisateur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
