"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Loader2, XCircle, MoreHorizontal, ArchiveRestore, ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { temperatureService } from "@/lib/api/services/temperature.service"
import { optionTraitementService } from "@/lib/api/services/option-traitement.service"
import { typeLingeService } from "@/lib/api/services/type-linge.service"
import type { Temperature } from "@/lib/api/types/temperature"
import type { OptionTraitement } from "@/lib/api/types/option-traitement"
import type { TypeLinge } from "@/lib/api/types/type-linge"
import Link from "next/link"

export default function ArchivedOptionsPage() {
  const [temperatures, setTemperatures] = useState<Temperature[]>([])
  const [optionTraitements, setOptionTraitements] = useState<OptionTraitement[]>([])
  const [typeLinges, setTypeLinges] = useState<TypeLinge[]>([])

  const [temperaturesLoading, setTemperaturesLoading] = useState(true)
  const [optionTraitementsLoading, setOptionTraitementsLoading] = useState(true)
  const [typeLingesLoading, setTypeLingesLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  /**
   * Charge les éléments archivés au montage du composant
   */
  useEffect(() => {
    loadArchivedData()
  }, [])

  /**
   * Charge toutes les données archivées
   */
  const loadArchivedData = async () => {
    try {
      setError(null)

      // Charger les températures archivées
      setTemperaturesLoading(true)
      const archivedTemperatures = await temperatureService.getArchived()
      setTemperatures(archivedTemperatures)
      setTemperaturesLoading(false)

      // Charger les options de traitement archivées
      setOptionTraitementsLoading(true)
      const archivedOptions = await optionTraitementService.getArchived()
      setOptionTraitements(archivedOptions)
      setOptionTraitementsLoading(false)

      // Charger les types de linge archivés
      setTypeLingesLoading(true)
      const archivedTypes = await typeLingeService.getArchived()
      setTypeLinges(archivedTypes)
      setTypeLingesLoading(false)
    } catch (err: any) {
      console.error("[v0] Erreur lors du chargement des archives:", err)
      setError(err?.message || "Erreur lors du chargement des données archivées")
      setTemperaturesLoading(false)
      setOptionTraitementsLoading(false)
      setTypeLingesLoading(false)
    }
  }

  /**
   * Restaure un élément archivé
   */
  const handleRestore = async (id: number, type: string) => {
    // if (!confirm("Êtes-vous sûr de vouloir restaurer cet élément ?")) {
    //   return
    // }

    try {
      if (type === "options-traitement") {
        await optionTraitementService.restore(id)
      } else if (type === "types-linge") {
        await typeLingeService.restore(id)
      } else if (type === "temperatures") {
        await temperatureService.restore(id)
      }

      toast({
        title: "Succès",
        description: "L'élément a été restauré avec succès.",
      })

      // Recharger les données après restauration
      await loadArchivedData()
    } catch (error) {
      console.error("[v0] Erreur lors de la restauration:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la restauration.",
        variant: "destructive",
      })
    }
  }

  /**
   * Affichage des erreurs de chargement
   */
  if (error) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadArchivedData}>Réessayer</Button>
              </div>
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
              <h1 className="text-3xl font-bold text-balance">Options Archivées</h1>
              <p className="text-muted-foreground">Consultez et restaurez les options archivées</p>
            </div>
            <Link href="/services/options">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux options
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="options-traitement" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="options-traitement">Options Traitement</TabsTrigger>
              <TabsTrigger value="types-linge">Types de Linge</TabsTrigger>
              <TabsTrigger value="temperatures">Températures</TabsTrigger>
            </TabsList>

            <TabsContent value="options-traitement">
              <Card>
                <CardHeader>
                  <CardTitle>Options de Traitement Archivées</CardTitle>
                  <CardDescription>Options de traitement qui ont été archivées</CardDescription>
                </CardHeader>
                <CardContent>
                  {optionTraitementsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement des options archivées...</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {optionTraitements.map((option) => (
                          <TableRow key={option.id}>
                            <TableCell className="font-medium">{option.nom}</TableCell>
                            <TableCell className="max-w-md truncate">{option.description}</TableCell>
                            <TableCell>
                              <Badge
                                variant={option.estActif ? "default" : "secondary"}
                                className={!option.estActif ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                              >
                                {option.estActif ? "Actif" : "Inactif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleRestore(option.id, "options-traitement")}>
                                    <ArchiveRestore className="h-4 w-4 mr-2" />
                                    Restaurer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {optionTraitements.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              Aucune option de traitement archivée
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="types-linge">
              <Card>
                <CardHeader>
                  <CardTitle>Types de Linge Archivés</CardTitle>
                  <CardDescription>Types de linge qui ont été archivés</CardDescription>
                </CardHeader>
                <CardContent>
                  {typeLingesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement des types archivés...</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {typeLinges.map((type) => (
                          <TableRow key={type.id}>
                            <TableCell className="font-medium">{type.nom}</TableCell>
                            <TableCell className="max-w-md truncate">{type.description || "-"}</TableCell>
                            <TableCell>
                              <Badge
                                variant={type.estActif ? "default" : "secondary"}
                                className={!type.estActif ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                              >
                                {type.estActif ? "Actif" : "Inactif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleRestore(type.id, "types-linge")}>
                                    <ArchiveRestore className="h-4 w-4 mr-2" />
                                    Restaurer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {typeLinges.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              Aucun type de linge archivé
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="temperatures">
              <Card>
                <CardHeader>
                  <CardTitle>Températures Archivées</CardTitle>
                  <CardDescription>Températures qui ont été archivées</CardDescription>
                </CardHeader>
                <CardContent>
                  {temperaturesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement des températures archivées...</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Valeur</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {temperatures.map((temp) => (
                          <TableRow key={temp.id}>
                            <TableCell className="font-medium">{temp.valeur} °C</TableCell>
                            <TableCell className="max-w-md truncate">{temp.description || "-"}</TableCell>
                            <TableCell>
                              <Badge
                                variant={temp.estActif ? "default" : "secondary"}
                                className={!temp.estActif ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                              >
                                {temp.estActif ? "Actif" : "Inactif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleRestore(temp.id, "temperatures")}>
                                    <ArchiveRestore className="h-4 w-4 mr-2" />
                                    Restaurer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {temperatures.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              Aucune température archivée
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </>
  )
}
