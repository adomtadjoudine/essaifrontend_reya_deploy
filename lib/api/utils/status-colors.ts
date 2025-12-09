/**
 * Utilitaire centralisé pour la gestion des couleurs et labels des statuts de commande
 * Assurant la cohérence visuelle dans toute l'application
 */

/**
 * Retourne les classes Tailwind de couleur pour un statut de commande
 * basé sur le nom du statut
 * @param statutNom - Le nom du statut (ex: "En attente", "Collecte", "Traitement", etc.)
 * @returns Les classes Tailwind CSS pour le badge de statut
 */
export function getStatusColor(statutNom: string): string {
  const nom = statutNom?.toLowerCase() || ""

  // En attente - Jaune/Amber
  if (nom.includes("attente")) {
    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
  }

  // Collecte - Bleu
  if (nom.includes("collect")) {
    return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
  }

  // Traitement/En cours - Violet/Purple
  if (nom.includes("cours") || nom.includes("traitement")) {
    return "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400"
  }

  // Prêt - Vert
  if (nom.includes("prêt") || nom.includes("pret")) {
    return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
  }

  // Livraison - Violet/Indigo
  if (nom.includes("livr")) {
    return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400"
  }

  // Annulée - Rouge
  if (nom.includes("annul")) {
    return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
  }

  // Défaut - Gris
  return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-400"
}

/**
 * Récupère le statut actuel d'une commande (le plus récent)
 * @param commande - L'objet commande avec l'array de statuts
 * @returns L'objet du statut actuel avec id et nom
 */
export function getCurrentStatutFromCommande(commande: any) {
  if (!commande.statuts || commande.statuts.length === 0) {
    return { id: 0, nom: "En attente" }
  }

  // Trier les statuts par date de création pour s'assurer d'avoir le plus récent
  const statutsTries = [...commande.statuts].sort((a, b) => {
    const dateA = new Date(a.pivot?.createdAt || a.createdAt || 0).getTime()
    const dateB = new Date(b.pivot?.createdAt || b.createdAt || 0).getTime()
    return dateB - dateA // Du plus récent au plus ancien
  })

  const dernierStatut = statutsTries[0]
  return { id: dernierStatut.id, nom: dernierStatut.nom }
}

/**
 * Formate le nom complet du client à partir de ses données
 * @param client - L'objet client ou objet avec informations utilisateur
 * @returns Le nom complet formaté (prénom + nom)
 */
export function getClientFullName(client: any): string {
  if (!client) return "Client"

  // Vérifier d'abord si client a un utilisateur lié
  const user = client.user
  if (user) {
    const prenom = user.prenom || ""
    const nom = user.nom || ""
    return `${prenom} ${nom}`.trim() || "Client"
  }

  // Sinon utiliser les données du client directement
  const prenom = client.prenom || ""
  const nom = client.nom || ""
  return `${prenom} ${nom}`.trim() || "Client"
}

/**
 * Récupère les initiales du client pour l'avatar
 * @param client - L'objet client
 * @returns Les initiales (ex: "JD" pour Jean Dupont)
 */
export function getClientInitials(client: any): string {
  const fullName = getClientFullName(client)
  return (
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CL"
  )
}
