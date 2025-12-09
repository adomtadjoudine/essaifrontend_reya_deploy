"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Archive, RotateCcw } from "lucide-react"

interface Offer {
  id: number
  name: string
  price: number
}

interface Service {
  id: number
  name: string
  description: string
  pricing: string
  price: string
  status: string
  offers?: Offer[]
  archived?: boolean
}

interface ArchivedServicesModalProps {
  archivedServices: Service[]
  onRestore: (serviceId: number) => void
}

export function ArchivedServicesModal({ archivedServices, onRestore }: ArchivedServicesModalProps) {
  const formatPrice = (price: string) => {
    return `${Number.parseInt(price).toLocaleString()} FCFA`
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Archive className="mr-2 h-4 w-4" />
          Voir services archivés ({archivedServices.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Services archivés</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {archivedServices.length === 0 ? (
            <div className="text-center py-8">
              <Archive className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Aucun service archivé</h3>
              <p className="text-sm text-muted-foreground">Les services archivés apparaîtront ici</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Tarification</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{service.description}</div>
                    </TableCell>
                    <TableCell>{service.pricing}</TableCell>
                    <TableCell className="font-medium">{formatPrice(service.price)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          service.status === "Actif"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }
                      >
                        {service.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRestore(service.id)}
                        className="text-primary hover:text-primary"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restaurer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
