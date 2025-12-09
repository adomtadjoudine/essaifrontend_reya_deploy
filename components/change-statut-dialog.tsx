"use client"

/**
 * Composant Dialog pour changer le statut d'une commande
 * Permet de sélectionner un nouveau statut et d'indiquer si le client doit être notifié
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useStatuts } from "@/hooks/use-statuts"
import { Loader2 } from "lucide-react"

interface ChangeStatutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (statutId: number, estNotifie: boolean) => Promise<void>
  currentStatutId?: number
}

export function ChangeStatutDialog({ open, onOpenChange, onConfirm, currentStatutId }: ChangeStatutDialogProps) {
  const { statuts, loading: loadingStatuts } = useStatuts()
  const [selectedStatutId, setSelectedStatutId] = useState<string>("")
  const [estNotifie, setEstNotifie] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (!selectedStatutId) return

    setIsSubmitting(true)
    try {
      await onConfirm(Number.parseInt(selectedStatutId), estNotifie)
      onOpenChange(false)
      setSelectedStatutId("")
      setEstNotifie(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtrer les statuts pour ne pas afficher le statut actuel
  const availableStatuts = statuts.filter((statut) => statut.id !== currentStatutId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Changer le statut de la commande</DialogTitle>
          <DialogDescription>
            Sélectionnez le nouveau statut pour cette commande. Le client peut être notifié automatiquement.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="statut">Nouveau statut</Label>
            {loadingStatuts ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={selectedStatutId} onValueChange={setSelectedStatutId}>
                <SelectTrigger id="statut">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuts.map((statut) => (
                    <SelectItem key={statut.id} value={statut.id.toString()}>
                      {statut.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="notifier" checked={estNotifie} onCheckedChange={(checked) => setEstNotifie(!!checked)} />
            <Label
              htmlFor="notifier"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Notifier le client par email
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedStatutId || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
