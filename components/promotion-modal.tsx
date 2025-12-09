"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { promotionService } from "@/lib/api/services/promotion.service"
import type { Promotion, TypeReduction, CreatePromotionData, UpdatePromotionData } from "@/lib/api/types/promotion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"

interface PromotionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion?: Promotion | null
  onSave: () => void
}

interface ValidationErrors {
  code?: string
  valeurReduction?: string
  dateDebut?: string
  dateFin?: string
  nombreUtilisationsMax?: string
  montantMinimum?: string
  plafondReduction?: string
}

/**
 * Modal de création/modification d'une promotion
 */
export function PromotionModal({ open, onOpenChange, promotion, onSave }: PromotionModalProps) {
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    typeReduction: "pourcentage" as TypeReduction,
    valeurReduction: "",
    plafondReduction: "",
    montantMinimum: "",
    dateDebut: "",
    dateFin: "",
    nombreUtilisationsMax: "",
    estCumulable: false,
    premierAchatUniquement: false,
  })

  const isEditMode = Boolean(promotion)

  useEffect(() => {
    if (open) {
      setValidationErrors({})
      if (promotion) {
        // Mode édition : charger les données de la promotion
        setFormData({
          code: promotion.code,
          description: promotion.description || "",
          typeReduction: promotion.typeReduction,
          valeurReduction: promotion.valeurReduction.toString(),
          plafondReduction: promotion.plafondReduction?.toString() || "",
          montantMinimum: promotion.montantMinimum?.toString() || "",
          dateDebut: format(new Date(promotion.dateDebut), "yyyy-MM-dd'T'HH:mm"),
          dateFin: format(new Date(promotion.dateFin), "yyyy-MM-dd'T'HH:mm"),
          nombreUtilisationsMax: promotion.nombreUtilisationsMax?.toString() || "",
          estCumulable: promotion.estCumulable,
          premierAchatUniquement: promotion.premierAchatUniquement,
        })
      } else {
        // Mode création : réinitialiser le formulaire
        setFormData({
          code: "",
          description: "",
          typeReduction: "pourcentage",
          valeurReduction: "",
          plafondReduction: "",
          montantMinimum: "",
          dateDebut: "",
          dateFin: "",
          nombreUtilisationsMax: "",
          estCumulable: false,
          premierAchatUniquement: false,
        })
      }
    }
  }, [open, promotion])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (!formData.code.trim()) {
      errors.code = "Le code est requis"
    }

    if (!formData.valeurReduction || Number(formData.valeurReduction) <= 0) {
      errors.valeurReduction = "La valeur de réduction doit être supérieure à 0"
    }

    if (formData.typeReduction === "pourcentage" && Number(formData.valeurReduction) > 100) {
      errors.valeurReduction = "Le pourcentage ne peut pas dépasser 100%"
    }

    if (!formData.dateDebut) {
      errors.dateDebut = "La date de début est requise"
    }

    if (!formData.dateFin) {
      errors.dateFin = "La date de fin est requise"
    }

    if (formData.dateDebut && formData.dateFin && new Date(formData.dateDebut) >= new Date(formData.dateFin)) {
      errors.dateFin = "La date de fin doit être après la date de début"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      setValidationErrors({})

      const data: CreatePromotionData | UpdatePromotionData = {
        code: formData.code,
        description: formData.description || undefined,
        typeReduction: formData.typeReduction,
        valeurReduction: Number(formData.valeurReduction),
        plafondReduction: formData.plafondReduction ? Number(formData.plafondReduction) : undefined,
        montantMinimum: formData.montantMinimum ? Number(formData.montantMinimum) : undefined,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        nombreUtilisationsMax: formData.nombreUtilisationsMax ? Number(formData.nombreUtilisationsMax) : undefined,
        estCumulable: formData.estCumulable,
        premierAchatUniquement: formData.premierAchatUniquement,
      }

      if (promotion) {
        await promotionService.update(promotion.id, data)
        toast({
          title: "Succès",
          description: "Promotion mise à jour avec succès",
        })
      } else {
        await promotionService.create(data as CreatePromotionData)
        toast({
          title: "Succès",
          description: "Promotion créée avec succès",
        })
      }

      onSave()
      onOpenChange(false)
    } catch (error: any) {
      console.error("[v0] Erreur lors de la sauvegarde:", error)

      if (error.response?.data?.errors) {
        const backendErrors: ValidationErrors = {}
        const errors = error.response.data.errors

        if (errors.code) backendErrors.code = errors.code[0]
        if (errors.valeurReduction) backendErrors.valeurReduction = errors.valeurReduction[0]
        if (errors.dateDebut) backendErrors.dateDebut = errors.dateDebut[0]
        if (errors.dateFin) backendErrors.dateFin = errors.dateFin[0]

        setValidationErrors(backendErrors)

        toast({
          title: "Erreur de validation",
          description: "Veuillez corriger les erreurs dans le formulaire",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors de la sauvegarde",
          variant: "destructive",
        })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? "Modifier la promotion" : "Créer une nouvelle promotion"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informations de base */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium text-sm">Informations de base</h3>

            <div className="space-y-2">
              <Label htmlFor="code">
                Code promo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                placeholder="Ex: BIENVENUE20, NOEL2024..."
                disabled={saving}
                className={validationErrors.code ? "border-red-500" : ""}
              />
              {validationErrors.code && <p className="text-sm text-red-500">{validationErrors.code}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Décrivez la promotion..."
                rows={2}
                disabled={saving}
              />
            </div>
          </div>

          {/* Configuration de la réduction */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium text-sm">Configuration de la réduction</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="typeReduction">
                  Type de réduction <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.typeReduction}
                  onValueChange={(value: TypeReduction) => handleInputChange("typeReduction", value)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pourcentage">Pourcentage (%)</SelectItem>
                    <SelectItem value="montant_fixe">Montant fixe (FCFA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valeurReduction">
                  Valeur {formData.typeReduction === "pourcentage" ? "(%)" : "(FCFA)"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="valeurReduction"
                  type="number"
                  min="0"
                  max={formData.typeReduction === "pourcentage" ? 100 : undefined}
                  step={formData.typeReduction === "pourcentage" ? "1" : "100"}
                  value={formData.valeurReduction}
                  onChange={(e) => handleInputChange("valeurReduction", e.target.value)}
                  placeholder={formData.typeReduction === "pourcentage" ? "Ex: 20" : "Ex: 5000"}
                  disabled={saving}
                  className={validationErrors.valeurReduction ? "border-red-500" : ""}
                />
                {validationErrors.valeurReduction && (
                  <p className="text-sm text-red-500">{validationErrors.valeurReduction}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montantMinimum">Montant minimum (FCFA)</Label>
                <Input
                  id="montantMinimum"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.montantMinimum}
                  onChange={(e) => handleInputChange("montantMinimum", e.target.value)}
                  placeholder="Ex: 10000"
                  disabled={saving}
                  className={validationErrors.montantMinimum ? "border-red-500" : ""}
                />
                {validationErrors.montantMinimum && (
                  <p className="text-sm text-red-500">{validationErrors.montantMinimum}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="plafondReduction">Plafond réduction (FCFA)</Label>
                <Input
                  id="plafondReduction"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.plafondReduction}
                  onChange={(e) => handleInputChange("plafondReduction", e.target.value)}
                  placeholder="Ex: 20000"
                  disabled={saving || formData.typeReduction === "montant_fixe"}
                  className={validationErrors.plafondReduction ? "border-red-500" : ""}
                />
                {validationErrors.plafondReduction && (
                  <p className="text-sm text-red-500">{validationErrors.plafondReduction}</p>
                )}
                {formData.typeReduction === "montant_fixe" && (
                  <p className="text-xs text-muted-foreground">Non applicable pour un montant fixe</p>
                )}
              </div>
            </div>
          </div>

          {/* Période de validité */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium text-sm">Période de validité</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateDebut">
                  Date de début <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dateDebut"
                  type="datetime-local"
                  value={formData.dateDebut}
                  onChange={(e) => handleInputChange("dateDebut", e.target.value)}
                  disabled={saving}
                  className={validationErrors.dateDebut ? "border-red-500" : ""}
                />
                {validationErrors.dateDebut && <p className="text-sm text-red-500">{validationErrors.dateDebut}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFin">
                  Date de fin <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dateFin"
                  type="datetime-local"
                  value={formData.dateFin}
                  onChange={(e) => handleInputChange("dateFin", e.target.value)}
                  disabled={saving}
                  className={validationErrors.dateFin ? "border-red-500" : ""}
                />
                {validationErrors.dateFin && <p className="text-sm text-red-500">{validationErrors.dateFin}</p>}
              </div>
            </div>
          </div>

          {/* Limitations */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium text-sm">Limitations et options</h3>

            <div className="space-y-2">
              <Label htmlFor="nombreUtilisationsMax">Nombre d'utilisations maximum</Label>
              <Input
                id="nombreUtilisationsMax"
                type="number"
                min="1"
                value={formData.nombreUtilisationsMax}
                onChange={(e) => handleInputChange("nombreUtilisationsMax", e.target.value)}
                placeholder="Laisser vide pour illimité"
                disabled={saving}
                className={validationErrors.nombreUtilisationsMax ? "border-red-500" : ""}
              />
              {validationErrors.nombreUtilisationsMax && (
                <p className="text-sm text-red-500">{validationErrors.nombreUtilisationsMax}</p>
              )}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="estCumulable" className="text-sm font-medium">
                  Cumulable avec d'autres promotions
                </Label>
                <p className="text-xs text-muted-foreground">Permettre l'utilisation avec d'autres codes promo</p>
              </div>
              <Switch
                id="estCumulable"
                checked={formData.estCumulable}
                onCheckedChange={(checked) => handleInputChange("estCumulable", checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="premierAchatUniquement" className="text-sm font-medium">
                  Premier achat uniquement
                </Label>
                <p className="text-xs text-muted-foreground">Réserver cette promotion aux nouveaux clients</p>
              </div>
              <Switch
                id="premierAchatUniquement"
                checked={formData.premierAchatUniquement}
                onCheckedChange={(checked) => handleInputChange("premierAchatUniquement", checked)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Alerte informative */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Les promotions seront automatiquement activées à la date de début et désactivées à la date de fin.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditMode ? "Mettre à jour" : "Créer la promotion"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
