"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Undo2, Loader2, Clock, Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import { useDelaiLivraisons } from "@/hooks/use-delai-livraisons"
import { useCreneauCollectes } from "@/hooks/use-creneau-collectes"
import { useTarifKilometriques } from "@/hooks/use-tarif-kilometriques"
import type { DelaiLivraison } from "@/lib/api/types/delai-livraison"
import type { CreneauCollecte } from "@/lib/api/types/creneau-collecte"
import type { TarifKilometrique } from "@/lib/api/types/tarif-kilometrique"

/**
 * Page des paramètres de livraison archivés
 */
export default function ParametresLivraisonArchivedPage() {
  const { fetchArchivedDelaiLivraisons, restoreDelaiLivraison } = useDelaiLivraisons()
  const { fetchArchivedCreneauCollectes, restoreCreneauCollecte } = useCreneauCollectes()
  const { fetchArchivedTarifKilometriques, restoreTarifKilometrique } = useTarifKilometriques()

  const [delaisArchived, setDelaisArchived] = useState<DelaiLivraison[]>([])
  const [creneauxArchived, setCreneauxArchived] = useState<CreneauCollecte[]>([])
  const [tarifsArchived, setTarifsArchived] = useState<TarifKilometrique[]>([])
  const [loading, setLoading] = useState(true)

  // Charger les données archivées
  useEffect(() => {
    loadArchivedData()
  }, [])

  const loadArchivedData = async () => {
    setLoading(true)
    try {
      console.log("[v0] Chargement des données archivées...")

      const [delaisData, creneauxData, tarifsData] = await Promise.all([
        fetchArchivedDelaiLivraisons(),
        fetchArchivedCreneauCollectes(),
        fetchArchivedTarifKilometriques(),
      ])

      console.log("[v0] Délais archivés reçus:", delaisData)
      console.log("[v0] Créneaux archivés reçus:", creneauxData)
      console.log("[v0] Tarifs archivés reçus:", tarifsData)

      setDelaisArchived(Array.isArray(delaisData) ? delaisData : [])
      setCreneauxArchived(Array.isArray(creneauxData) ? creneauxData : [])
      setTarifsArchived(Array.isArray(tarifsData) ? tarifsData : [])

      console.log(
        "[v0] État mis à jour - Délais:",
        delaisData?.length,
        "Créneaux:",
        creneauxData?.length,
        "Tarifs:",
        tarifsData?.length,
      )
    } catch (error) {
      console.error("[v0] Erreur lors du chargement des données archivées:", error)
    } finally {
      setLoading(false)
    }
  }

  // Restaurer un délai de livraison
  const handleRestoreDelai = async (id: number) => {
    const success = await restoreDelaiLivraison(id)
    if (success) {
      loadArchivedData()
    }
  }

  // Restaurer un créneau de collecte
  const handleRestoreCreneau = async (id: number) => {
    const success = await restoreCreneauCollecte(id)
    if (success) {
      loadArchivedData()
    }
  }

  // Restaurer un tarif kilométrique
  const handleRestoreTarif = async (id: number) => {
    const success = await restoreTarifKilometrique(id)
    if (success) {
      loadArchivedData()
    }
  }

  return (
    <>
      <AdminSidebar />
      <SidebarInset>
        <AdminTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Paramètres de Livraison Archivés</h1>
              <p className="text-muted-foreground">Gérez et restaurez les paramètres de livraison archivés</p>
            </div>
            <Link href="/parametres-livraison">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="delais-livraison" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="delais-livraison">
                <Clock className="h-4 w-4 mr-2" />
                Délais ({delaisArchived.length})
              </TabsTrigger>
              <TabsTrigger value="creneaux-collecte">
                <Calendar className="h-4 w-4 mr-2" />
                Créneaux ({creneauxArchived.length})
              </TabsTrigger>
              <TabsTrigger value="tarifs-kilometriques">
                <MapPin className="h-4 w-4 mr-2" />
                Tarifs ({tarifsArchived.length})
              </TabsTrigger>
            </TabsList>

            {/* Délais de livraison archivés */}
            <TabsContent value="delais-livraison">
              <Card>
                <CardHeader>
                  <CardTitle>Délais de Livraison Archivés</CardTitle>
                  <CardDescription>Liste des délais de livraison archivés</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement...</span>
                    </div>
                  ) : delaisArchived.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Aucun délai de livraison archivé</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Délai (heures)</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Prix/Remise</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {delaisArchived.map((delai) => {
                          return (
                            <TableRow key={delai.id}>
                              <TableCell className="font-medium">{delai.nom}</TableCell>
                              <TableCell>{delai.delaiHeures}h</TableCell>
                              <TableCell className="max-w-md truncate">{delai.description || "-"}</TableCell>
                              <TableCell>
                                {delai.remise !== null && delai.remise !== undefined ? (
                                  <span className="text-green-600 font-medium">Remise: {delai.remise}%</span>
                                ) : delai.prix !== null && delai.prix !== undefined ? (
                                  <span className="font-medium">{delai.prix} FCFA</span>
                                ) : (
                                  <span className="text-muted-foreground">Non défini</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={delai.estActif ? "default" : "secondary"}
                                  className={!delai.estActif ? "bg-red-500 text-white" : ""}
                                >
                                  {delai.estActif ? "Actif" : "Inactif"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleRestoreDelai(delai.id)}>
                                  <Undo2 className="mr-2 h-4 w-4" />
                                  Restaurer
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Créneaux de collecte archivés */}
            <TabsContent value="creneaux-collecte">
              <Card>
                <CardHeader>
                  <CardTitle>Créneaux de Collecte Archivés</CardTitle>
                  <CardDescription>Liste des créneaux de collecte archivés</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement...</span>
                    </div>
                  ) : creneauxArchived.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Aucun créneau de collecte archivé</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jour</TableHead>
                          <TableHead>Heure de début</TableHead>
                          <TableHead>Heure de fin</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {creneauxArchived.map((creneau) => (
                          <TableRow key={creneau.id}>
                            <TableCell className="font-medium">{creneau.jourSemaine}</TableCell>
                            <TableCell>{creneau.heureDebut}</TableCell>
                            <TableCell>{creneau.heureFin}</TableCell>
                            <TableCell>
                              <Badge
                                variant={creneau.estActif ? "default" : "secondary"}
                                className={!creneau.estActif ? "bg-red-500 text-white" : ""}
                              >
                                {creneau.estActif ? "Actif" : "Inactif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleRestoreCreneau(creneau.id)}>
                                <Undo2 className="mr-2 h-4 w-4" />
                                Restaurer
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tarifs kilométriques archivés */}
            <TabsContent value="tarifs-kilometriques">
              <Card>
                <CardHeader>
                  <CardTitle>Tarifs Kilométriques Archivés</CardTitle>
                  <CardDescription>Liste des tarifs kilométriques archivés</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement...</span>
                    </div>
                  ) : tarifsArchived.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Aucun tarif kilométrique archivé</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Prix par km (FCFA)</TableHead>
                          <TableHead>Distance min (km)</TableHead>
                          <TableHead>Distance max (km)</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tarifsArchived.map((tarif) => (
                          <TableRow key={tarif.id}>
                            <TableCell className="font-medium">{tarif.prixParKm} FCFA</TableCell>
                            <TableCell>{tarif.distanceMin !== null ? `${tarif.distanceMin} km` : "-"}</TableCell>
                            <TableCell>{tarif.distanceMax !== null ? `${tarif.distanceMax} km` : "-"}</TableCell>
                            <TableCell>
                              <Badge
                                variant={tarif.estActif ? "default" : "secondary"}
                                className={!tarif.estActif ? "bg-red-500 text-white" : ""}
                              >
                                {tarif.estActif ? "Actif" : "Inactif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleRestoreTarif(tarif.id)}>
                                <Undo2 className="mr-2 h-4 w-4" />
                                Restaurer
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
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
