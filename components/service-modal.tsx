"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Package,
  Thermometer,
  Settings,
  Upload,
  X,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { optionTraitementService } from "@/lib/api/services/option-traitement.service"
import { typeLingeService } from "@/lib/api/services/type-linge.service"
import { temperatureService } from "@/lib/api/services/temperature.service"
import { serviceService } from "@/lib/api/services/service.service"
import { tarifService } from "@/lib/api/services/tarif.service"
import { getFileUrl } from "@/lib/api/config"
import type { OptionTraitement } from "@/lib/api/types/option-traitement"
import type { TypeLinge } from "@/lib/api/types/type-linge"
import type { Temperature } from "@/lib/api/types/temperature"
import type { Service, TypeTarification } from "@/lib/api/types/service"
import { toast } from "@/hooks/use-toast"

interface ServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: Service | null
  onSave: () => void
}

interface ValidationErrors {
  nom?: string
  description?: string
  typeTarification?: string
  prixBase?: string
  images?: string
}

/**
 * Modal de création/modification d'un service
 *
 * Workflow de création (3 étapes) :
 * 1. Informations de base (nom, description, type de tarification)
 * 2. Prix de base du service
 * 3. Options avec prix supplémentaires (types de linge, températures, options de traitement)
 *
 * Mode édition : modification uniquement des informations de base
 * (les tarifs sont gérés séparément pour préserver l'historique)
 */
export function ServiceModal({ open, onOpenChange, service, onSave }: ServiceModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    typeTarification: "unitaire" as TypeTarification,
    prixBase: "",
    images: [] as File[],
    imagePreviews: [] as string[],
    // Options avec leurs prix supplémentaires
    optionsWithPrices: [] as Array<{
      type: "typeLinge" | "temperature" | "optionTraitement"
      id: number
      nom: string
      prixSupplementaire: string
    }>,
  })

  const [availableOptions, setAvailableOptions] = useState<{
    optionTraitements: OptionTraitement[]
    typeLinges: TypeLinge[]
    temperatures: Temperature[]
  }>({
    optionTraitements: [],
    typeLinges: [],
    temperatures: [],
  })

  const isEditMode = Boolean(service)

  /**
   * Charge les options disponibles depuis l'API au chargement du modal
   */
  const loadAvailableOptions = async () => {
    try {
      setLoading(true)
      const optionTraitements = await optionTraitementService.getAll()
      const typeLinges = await typeLingeService.getAll()
      const temperatures = await temperatureService.getAll()

      setAvailableOptions({
        optionTraitements,
        typeLinges,
        temperatures,
      })
    } catch (error) {
      console.error("[v0] Erreur lors du chargement des options disponibles:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du chargement des options disponibles",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadAvailableOptions()
      setValidationErrors({})
      if (service) {
        const imagePreviews = (service.images || []).map((imagePath) => getFileUrl(imagePath))
        setFormData({
          nom: service.nom,
          description: service.description || "",
          typeTarification: service.typeTarification,
          prixBase: "",
          images: [],
          imagePreviews: imagePreviews,
          optionsWithPrices: [],
        })
      }
    }
  }, [open, service])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  /**
   * Gère la sélection de plusieurs images
   * Nouvelle méthode pour gérer l'upload multiple
   */
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: File[] = []
    const newPreviews: string[] = []
    const errors: string[] = []

    const previewPromises: Promise<string>[] = []

    // Validation et traitement de chaque fichier
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validation du type de fichier
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} n'est pas une image`)
        continue
      }

      // Validation de la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} dépasse 5MB`)
        continue
      }

      // Limitation du nombre d'images (ex: max 10)
      if (formData.images.length + newFiles.length + formData.imagePreviews.length >= 10) {
        errors.push("Maximum 10 images autorisées")
        break
      }

      newFiles.push(file)

      // Créer une promesse pour chaque preview
      const previewPromise = new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
      })
      previewPromises.push(previewPromise)
    }

    if (errors.length > 0) {
      setValidationErrors((prev) => ({ ...prev, images: errors.join(", ") }))
      return
    }

    // Attendre que tous les previews soient créés
    Promise.all(previewPromises).then((previews) => {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
        imagePreviews: [...prev.imagePreviews, ...previews],
      }))
    })

    setValidationErrors((prev) => ({ ...prev, images: undefined }))
  }

  /**
   * Supprime une image spécifique
   * Nouvelle méthode pour supprimer une image de la liste
   */
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const existingImagesCount = service?.images?.length || 0

      if (index < existingImagesCount) {
        // C'est une image existante du service
        return {
          ...prev,
          imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
        }
      } else {
        // C'est une nouvelle image uploadée
        const newImageIndex = index - existingImagesCount
        return {
          ...prev,
          images: prev.images.filter((_, i) => i !== newImageIndex),
          imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
        }
      }
    })
  }

  const handleNext = () => {
    const errors: ValidationErrors = {}

    if (currentStep === 1) {
      if (!formData.nom.trim()) {
        errors.nom = "Le nom du service est obligatoire"
      } else if (formData.nom.trim().length < 2) {
        errors.nom = "Le nom doit contenir au moins 2 caractères"
      } else if (formData.nom.trim().length > 100) {
        errors.nom = "Le nom ne peut pas dépasser 100 caractères"
      }

      if (formData.description && formData.description.length > 500) {
        errors.description = "La description ne peut pas dépasser 500 caractères"
      }

      if (!formData.typeTarification) {
        errors.typeTarification = "Le type de tarification est obligatoire"
      }
    }

    if (currentStep === 2) {
      if (!formData.prixBase || formData.prixBase.trim() === "") {
        errors.prixBase = "Le prix de base est obligatoire"
      } else if (Number(formData.prixBase) < 0) {
        errors.prixBase = "Le prix de base doit être positif"
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  /**
   * Ajoute ou met à jour une option avec son prix supplémentaire
   */
  const toggleOptionWithPrice = (
    type: "typeLinge" | "temperature" | "optionTraitement",
    id: number,
    nom: string,
    currentPrice?: string,
  ) => {
    const existingIndex = formData.optionsWithPrices.findIndex((opt) => opt.type === type && opt.id === id)

    if (existingIndex >= 0) {
      // Retirer l'option
      handleInputChange(
        "optionsWithPrices",
        formData.optionsWithPrices.filter((_, i) => i !== existingIndex),
      )
    } else {
      // Ajouter l'option avec un prix par défaut
      handleInputChange("optionsWithPrices", [
        ...formData.optionsWithPrices,
        {
          type,
          id,
          nom,
          prixSupplementaire: currentPrice || "0",
        },
      ])
    }
  }

  /**
   * Met à jour le prix supplémentaire d'une option
   */
  const updateOptionPrice = (index: number, price: string) => {
    const updatedOptions = [...formData.optionsWithPrices]
    updatedOptions[index] = { ...updatedOptions[index], prixSupplementaire: price }
    handleInputChange("optionsWithPrices", updatedOptions)
  }

  /**
   * Vérifie si une option est sélectionnée
   */
  const isOptionSelected = (type: "typeLinge" | "temperature" | "optionTraitement", id: number) => {
    return formData.optionsWithPrices.some((opt) => opt.type === type && opt.id === id)
  }

  /**
   * Sauvegarde le service (création ou modification)
   */
  const handleSave = async () => {
    try {
      setSaving(true)
      setValidationErrors({})

      if (service) {
        await serviceService.update(service.id, {
          nom: formData.nom,
          description: formData.description || undefined,
          typeTarification: formData.typeTarification,
          images: formData.images.length > 0 ? formData.images : undefined,
        })

        toast({
          title: "Succès",
          description: "Service mis à jour avec succès",
        })
      } else {
        // Étape 1 : Créer le service avec ses images
        const newService = await serviceService.create({
          nom: formData.nom,
          description: formData.description || undefined,
          typeTarification: formData.typeTarification,
          code: "", // Le code sera généré automatiquement par le backend
          images: formData.images.length > 0 ? formData.images : undefined,
        })

        // Étape 2 : Créer le tarif de base
        await tarifService.createBase({
          serviceId: newService.id,
          prix: Number(formData.prixBase),
        })

        // Étape 3 : Créer les tarifs supplémentaires pour chaque option
        for (const option of formData.optionsWithPrices) {
          const tarifData: any = {
            serviceId: newService.id,
            prixSupplementaire: Number(option.prixSupplementaire),
          }

          // Ajouter l'ID de l'option selon son type
          if (option.type === "typeLinge") {
            tarifData.typeLingeId = option.id
          } else if (option.type === "temperature") {
            tarifData.temperatureId = option.id
          } else if (option.type === "optionTraitement") {
            tarifData.optionTraitementId = option.id
          }

          await tarifService.createSupplementaire(tarifData)
        }

        toast({
          title: "Succès",
          description: "Service créé avec succès avec tous ses tarifs",
        })
      }

      onSave()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      console.error("[v0] Erreur lors de la sauvegarde:", error)

      if (error.response?.data?.errors) {
        const backendErrors: ValidationErrors = {}
        const errors = error.response.data.errors

        if (errors.nom) backendErrors.nom = errors.nom[0]
        if (errors.description) backendErrors.description = errors.description[0]
        if (errors.typeTarification) backendErrors.typeTarification = errors.typeTarification[0]
        if (errors.images) backendErrors.images = errors.images[0]

        setValidationErrors(backendErrors)

        toast({
          title: "Erreur de validation",
          description: "Veuillez corriger les erreurs dans le formulaire",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Erreur lors de la sauvegarde du service",
          variant: "destructive",
        })
      }
    } finally {
      setSaving(false)
    }
  }

  /**
   * Réinitialise le formulaire
   */
  const resetForm = () => {
    setCurrentStep(1)
    setFormData({
      nom: "",
      description: "",
      typeTarification: "unitaire",
      prixBase: "",
      images: [],
      imagePreviews: [],
      optionsWithPrices: [],
    })
    setValidationErrors({})
  }

  /**
   * Obtient le libellé du type de tarification
   */
  const getTypeTarificationLabel = (type: TypeTarification) => {
    switch (type) {
      case "unitaire":
        return "Unitaire (par pièce)"
      case "poids":
        return "Au poids (par kg)"
      case "forfait":
        return "Forfait (prix fixe)"
      default:
        return type
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[800px] sm:w-[800px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? "Modifier le service" : "Créer un nouveau service"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-6 py-4">
            {!service && (
              <div className="flex items-center justify-between px-4">
                {[
                  { step: 1, label: "Informations" },
                  { step: 2, label: "Prix de base" },
                  { step: 3, label: "Options" },
                ].map(({ step, label }) => (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full font-medium transition-colors ${
                          currentStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step}
                      </div>
                      {step < 3 && (
                        <div
                          className={`h-1 flex-1 transition-colors ${currentStep > step ? "bg-primary" : "bg-muted"}`}
                        />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">{label}</span>
                  </div>
                ))}
              </div>
            )}

            {(service || currentStep === 1) && (
              <Card>
                <CardHeader>
                  <CardTitle>Informations de base</CardTitle>
                  <CardDescription>Définissez les informations principales du service</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">
                      Nom du service <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => handleInputChange("nom", e.target.value)}
                      placeholder="Ex: Nettoyage à sec, Repassage, Lavage express..."
                      disabled={saving}
                      className={validationErrors.nom ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {validationErrors.nom && <p className="text-sm text-red-500">{validationErrors.nom}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Décrivez le service en quelques mots..."
                      rows={3}
                      disabled={saving}
                      className={validationErrors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {validationErrors.description && (
                      <p className="text-sm text-red-500">{validationErrors.description}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="typeTarification">
                      Type de tarification <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.typeTarification}
                      onValueChange={(value: TypeTarification) => handleInputChange("typeTarification", value)}
                      disabled={saving}
                    >
                      <SelectTrigger className={validationErrors.typeTarification ? "border-red-500" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unitaire">Unitaire (par pièce)</SelectItem>
                        <SelectItem value="poids">Au poids (par kg)</SelectItem>
                        <SelectItem value="forfait">Forfait (prix fixe)</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.typeTarification && (
                      <p className="text-sm text-red-500">{validationErrors.typeTarification}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="images">
                      Images du service <span className="text-muted-foreground text-xs">(max 10 images)</span>
                    </Label>
                    {formData.imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {formData.imagePreviews.map((preview, index) => (
                          <div key={`preview-${index}`} className="relative group aspect-square">
                            <img
                              src={preview || "/placeholder.svg"}
                              alt={`Aperçu ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg border border-border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 opacity-90 hover:opacity-100 transition-opacity shadow-lg"
                              onClick={() => handleRemoveImage(index)}
                              disabled={saving}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                        disabled={saving || formData.imagePreviews.length >= 10}
                        className={validationErrors.images ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    {validationErrors.images && <p className="text-sm text-red-500">{validationErrors.images}</p>}
                    <p className="text-xs text-muted-foreground">
                      {formData.imagePreviews.length}/10 images • Format accepté : JPG, PNG • Taille max : 5MB par image
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {(service || currentStep === 2) && !service && (
              <Card>
                <CardHeader>
                  <CardTitle>Prix de base</CardTitle>
                  <CardDescription>Définissez le prix de base du service avant options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prixBase">
                      Prix de base <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="prixBase"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.prixBase}
                      onChange={(e) => handleInputChange("prixBase", e.target.value)}
                      placeholder="0.00"
                      disabled={saving}
                      className={validationErrors.prixBase ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {validationErrors.prixBase && <p className="text-sm text-red-500">{validationErrors.prixBase}</p>}
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Le prix de base est le tarif minimal sans aucune option supplémentaire
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {(service || currentStep === 3) && !service && (
              <Card>
                <CardHeader>
                  <CardTitle>Options avec tarifs supplémentaires</CardTitle>
                  <CardDescription>
                    Sélectionnez les options disponibles et leurs tarifs supplémentaires
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Types de linge */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Types de linge</h4>
                    </div>
                    <div className="space-y-2">
                      {availableOptions.typeLinges.map((typeLinge) => (
                        <div key={`linge-${typeLinge.id}`} className="flex items-center gap-3 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            id={`linge-${typeLinge.id}`}
                            checked={isOptionSelected("typeLinge", typeLinge.id)}
                            onChange={() => toggleOptionWithPrice("typeLinge", typeLinge.id, typeLinge.nom)}
                            disabled={saving}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`linge-${typeLinge.id}`} className="flex-1 cursor-pointer">
                            {typeLinge.nom}
                          </label>
                          {isOptionSelected("typeLinge", typeLinge.id) && (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Prix supplémentaire"
                              value={
                                formData.optionsWithPrices.find(
                                  (opt) => opt.type === "typeLinge" && opt.id === typeLinge.id,
                                )?.prixSupplementaire || ""
                              }
                              onChange={(e) => {
                                const index = formData.optionsWithPrices.findIndex(
                                  (opt) => opt.type === "typeLinge" && opt.id === typeLinge.id,
                                )
                                if (index >= 0) {
                                  updateOptionPrice(index, e.target.value)
                                }
                              }}
                              disabled={saving}
                              className="w-32"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Températures */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Températures</h4>
                    </div>
                    <div className="space-y-2">
                      {availableOptions.temperatures.map((temperature) => (
                        <div key={`temp-${temperature.id}`} className="flex items-center gap-3 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            id={`temp-${temperature.id}`}
                            checked={isOptionSelected("temperature", temperature.id)}
                            onChange={() => toggleOptionWithPrice("temperature", temperature.id, temperature.nom)}
                            disabled={saving}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`temp-${temperature.id}`} className="flex-1 cursor-pointer">
                            {temperature.valeur}
                          </label>
                          {isOptionSelected("temperature", temperature.id) && (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Prix supplémentaire"
                              value={
                                formData.optionsWithPrices.find(
                                  (opt) => opt.type === "temperature" && opt.id === temperature.id,
                                )?.prixSupplementaire || ""
                              }
                              onChange={(e) => {
                                const index = formData.optionsWithPrices.findIndex(
                                  (opt) => opt.type === "temperature" && opt.id === temperature.id,
                                )
                                if (index >= 0) {
                                  updateOptionPrice(index, e.target.value)
                                }
                              }}
                              disabled={saving}
                              className="w-32"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Options de traitement */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Options de traitement</h4>
                    </div>
                    <div className="space-y-2">
                      {availableOptions.optionTraitements.map((option) => (
                        <div key={`option-${option.id}`} className="flex items-center gap-3 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            id={`option-${option.id}`}
                            checked={isOptionSelected("optionTraitement", option.id)}
                            onChange={() => toggleOptionWithPrice("optionTraitement", option.id, option.nom)}
                            disabled={saving}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                            {option.nom}
                          </label>
                          {isOptionSelected("optionTraitement", option.id) && (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Prix supplémentaire"
                              value={
                                formData.optionsWithPrices.find(
                                  (opt) => opt.type === "optionTraitement" && opt.id === option.id,
                                )?.prixSupplementaire || ""
                              }
                              onChange={(e) => {
                                const index = formData.optionsWithPrices.findIndex(
                                  (opt) => opt.type === "optionTraitement" && opt.id === option.id,
                                )
                                if (index >= 0) {
                                  updateOptionPrice(index, e.target.value)
                                }
                              }}
                              disabled={saving}
                              className="w-32"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
          {!service && (
            <>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || saving}
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>

              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={saving} className="flex items-center gap-2">
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Créer le service
                </Button>
              )}
            </>
          )}

          {service && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Mettre à jour
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
