"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Livreur } from "@/lib/api/types/livreur"

interface LivreurModalProps {
  isOpen: boolean
  onClose: () => void
  livreur?: Livreur | null
  onSave: (livreurData: any) => void
}

export function LivreurModal({ isOpen, onClose, livreur, onSave }: LivreurModalProps) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    password_confirmation: "",
    typeVehicule: "",
    immatriculationVehicule: "",
    telephoneUrgence: "",
    estDisponible: true,
    raisonIndisponibilite: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (livreur) {
      setFormData({
        nom: livreur.user?.nom || "",
        prenom: livreur.user?.prenom || "",
        email: livreur.user?.email || "",
        telephone: livreur.user?.telephone || "",
        password: "",
        password_confirmation: "",
        typeVehicule: livreur.typeVehicule || "",
        immatriculationVehicule: livreur.immatriculationVehicule || "",
        telephoneUrgence: livreur.telephoneUrgence || "",
        estDisponible: livreur.estDisponible,
        raisonIndisponibilite: "",
      })
    } else {
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        password: "",
        password_confirmation: "",
        typeVehicule: "",
        immatriculationVehicule: "",
        telephoneUrgence: "",
        estDisponible: true,
        raisonIndisponibilite: "",
      })
    }
    setErrors({})
  }, [livreur, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis"
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis"
    if (!formData.email.trim()) newErrors.email = "L'email est requis"
    if (!formData.telephone.trim()) newErrors.telephone = "Le téléphone est requis"
    if (!formData.typeVehicule) newErrors.typeVehicule = "Le type de véhicule est requis"

    if (!livreur) {
      if (!formData.password) newErrors.password = "Le mot de passe est requis"
      else if (formData.password.length < 8) newErrors.password = "Le mot de passe doit contenir au moins 8 caractères"

      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = "Les mots de passe ne correspondent pas"
      }
    }

    if (!formData.estDisponible && !formData.raisonIndisponibilite.trim()) {
      newErrors.raisonIndisponibilite = "Une raison est requise quand le livreur est indisponible"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {livreur ? "Modifier le livreur" : "Nouveau livreur"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations personnelles</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">
                  Prénom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, prenom: e.target.value }))}
                  placeholder="Prénom du livreur"
                  className={errors.prenom ? "border-red-500" : ""}
                />
                {errors.prenom && <p className="text-sm text-red-500">{errors.prenom}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nom">
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
                  placeholder="Nom du livreur"
                  className={errors.nom ? "border-red-500" : ""}
                />
                {errors.nom && <p className="text-sm text-red-500">{errors.nom}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemple.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">
                  Téléphone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, telephone: e.target.value }))}
                  placeholder="+228 XX XX XX XX"
                  className={errors.telephone ? "border-red-500" : ""}
                />
                {errors.telephone && <p className="text-sm text-red-500">{errors.telephone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephoneUrgence">Téléphone d'urgence</Label>
              <Input
                id="telephoneUrgence"
                value={formData.telephoneUrgence}
                onChange={(e) => setFormData((prev) => ({ ...prev, telephoneUrgence: e.target.value }))}
                placeholder="+228 XX XX XX XX (contact en cas d'urgence)"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations du véhicule</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="typeVehicule">
                  Type de véhicule <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.typeVehicule}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, typeVehicule: value }))}
                >
                  <SelectTrigger className={errors.typeVehicule ? "border-red-500" : ""}>
                    <SelectValue placeholder="Sélectionner le type de véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moto">Moto</SelectItem>
                    <SelectItem value="scooter">Scooter</SelectItem>
                    <SelectItem value="velo">Vélo</SelectItem>
                    <SelectItem value="voiture">Voiture</SelectItem>
                    <SelectItem value="camionnette">Camionnette</SelectItem>
                  </SelectContent>
                </Select>
                {errors.typeVehicule && <p className="text-sm text-red-500">{errors.typeVehicule}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="immatriculationVehicule">Immatriculation (optionnel)</Label>
                <Input
                  id="immatriculationVehicule"
                  value={formData.immatriculationVehicule}
                  onChange={(e) => setFormData((prev) => ({ ...prev, immatriculationVehicule: e.target.value }))}
                  placeholder="Ex: TG-1234-AB"
                />
              </div>
            </div>
          </div>

          {/* Mot de passe (uniquement pour création) */}
          {!livreur && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sécurité</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Mot de passe <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimum 8 caractères"
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">
                    Confirmer le mot de passe <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password_confirmation: e.target.value }))}
                    placeholder="Confirmer le mot de passe"
                    className={errors.password_confirmation ? "border-red-500" : ""}
                  />
                  {errors.password_confirmation && (
                    <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Disponibilité */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Disponibilité</h3>

            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="estDisponible" className="text-base font-medium cursor-pointer">
                  Livreur disponible
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activez pour marquer le livreur comme disponible pour les tournées
                </p>
              </div>
              <Switch
                id="estDisponible"
                checked={formData.estDisponible}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, estDisponible: checked }))}
              />
            </div>

            {!formData.estDisponible && (
              <div className="space-y-2">
                <Label htmlFor="raisonIndisponibilite">
                  Raison de l'indisponibilité <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="raisonIndisponibilite"
                  value={formData.raisonIndisponibilite}
                  onChange={(e) => setFormData((prev) => ({ ...prev, raisonIndisponibilite: e.target.value }))}
                  placeholder="Ex: En congé, Arrêt maladie, Formation..."
                  rows={3}
                  className={errors.raisonIndisponibilite ? "border-red-500" : ""}
                />
                {errors.raisonIndisponibilite && <p className="text-sm text-red-500">{errors.raisonIndisponibilite}</p>}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {livreur ? "Mettre à jour" : "Créer le livreur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
