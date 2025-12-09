// Constantes des endpoints - Adaptées pour l'API AdonisJS backend

export const ENDPOINTS = {
  // ============================================
  // AUTHENTIFICATION ADMIN (WEB)
  // ============================================
  AUTH: {
    LOGIN: "/api/admin/auth/login", // Connexion admin avec email/password
    LOGOUT: "/api/admin/auth/logout", // Déconnexion admin
    ME: "/api/admin/auth/me", // Profil admin connecté (endpoint spécifique pour admin)
    REGISTER: "/api/auth/register", // Inscription client (mobile)
    CREATE_ADMIN: "/api/admin/auth/create-admin", // Création d'un admin (super_admin uniquement)
  },

  // ============================================
  // GESTION DES UTILISATEURS
  // ============================================
  USERS: {
    BASE: "/api/admin/users",
    BY_ID: (id: number) => `/api/admin/users/${id}`,
    TOGGLE_ACTIVE: (id: number) => `/api/admin/users/${id}/toggle-active`,
    ROLES: (id: number) => `/api/admin/users/${id}/roles`,
    PERMISSIONS: (id: number) => `/api/admin/users/${id}/permissions`,
  },

  // ============================================
  // GESTION DES RÔLES
  // ============================================
  ROLES: {
    BASE: "/api/admin/roles",
    BY_ID: (id: number) => `/api/admin/roles/${id}`,
    ASSIGN_PERMISSIONS: (id: number) => `/api/admin/roles/${id}/permissions`,
    REMOVE_PERMISSIONS: (id: number) => `/api/admin/roles/${id}/permissions`,
  },

  // ============================================
  // GESTION DES PERMISSIONS
  // ============================================
  PERMISSIONS: {
    BASE: "/api/admin/permissions",
    ALL: "/api/admin/permissions/all", // Toutes les permissions sans pagination
    BY_ID: (id: number) => `/api/admin/permissions/${id}`,
    ACTIFS: "/api/admin/permissions/actifs",
    TOGGLE_ACTIVE: (id: number) => `/api/admin/permissions/${id}/toggle-active`,
  },

  // ============================================
  // GESTION DES SERVICES (PRESSING)
  // ============================================
  SERVICES: {
    BASE: "/api/services", // Route publique pour consultation
    ADMIN_BASE: "/api/admin/services", // Route admin pour gestion
    ADMIN_ARCHIVED: "/api/admin/services/archived",
    BY_ID: (id: number) => `/api/services/${id}`,
    ADMIN_BY_ID: (id: number) => `/api/admin/services/${id}`,
    ACTIFS: "/api/services/actifs",
    SEARCH: (term: string) => `/api/services/search/${term}`,
    ADMIN_SEARCH: (term: string) => `/api/admin/services/search/${term}`,
    TOGGLE_ACTIVE: (id: number) => `/api/admin/services/${id}/toggle-active`,
    RESTORE: (id: number) => `/api/admin/services/${id}/restore`,
  },

  // ============================================
  // TYPES DE LINGE
  // ============================================
  TYPE_LINGES: {
    BASE: "/api/type-linges",
    ADMIN_BASE: "/api/admin/type-linges",
    ADMIN_ARCHIVED: "/api/admin/type-linges/archived",
    BY_ID: (id: number) => `/api/type-linges/${id}`,
    ADMIN_BY_ID: (id: number) => `/api/admin/type-linges/${id}`,
    ACTIFS: "/api/type-linges/actifs",
    TOGGLE_ACTIVE: (id: number) => `/api/admin/type-linges/${id}/toggle-active`,
    RESTORE: (id: number) => `/api/admin/type-linges/${id}/restore`,
  },

  // ============================================
  // TEMPÉRATURES
  // ============================================
  TEMPERATURES: {
    BASE: "/api/temperatures",
    ADMIN_BASE: "/api/admin/temperatures",
    ADMIN_ARCHIVED: "/api/admin/temperatures/archived",
    BY_ID: (id: number) => `/api/temperatures/${id}`,
    ADMIN_BY_ID: (id: number) => `/api/admin/temperatures/${id}`,
    ACTIFS: "/api/temperatures/actifs",
    TOGGLE_ACTIVE: (id: number) => `/api/admin/temperatures/${id}/toggle-active`,
    RESTORE: (id: number) => `/api/admin/temperatures/${id}/restore`,
  },

  // ============================================
  // OPTIONS DE TRAITEMENT
  // ============================================
  OPTION_TRAITEMENTS: {
    BASE: "/api/option-traitements",
    ADMIN_BASE: "/api/admin/option-traitements",
    ADMIN_ARCHIVED: "/api/admin/option-traitements/archived",
    BY_ID: (id: number) => `/api/option-traitements/${id}`,
    ADMIN_BY_ID: (id: number) => `/api/admin/option-traitements/${id}`,
    ACTIFS: "/api/option-traitements/actifs",
    TOGGLE_ACTIVE: (id: number) => `/api/admin/option-traitements/${id}/toggle-active`,
    RESTORE: (id: number) => `/api/admin/option-traitements/${id}/restore`,
  },

  // ============================================
  // TARIFS KILOMÉTRIQUES
  // ============================================
  TARIF_KILOMETRIQUES: {
    BASE: "/api/tarif-kilometriques", // Route publique (mobile)
    ADMIN_BASE: "/api/admin/tarif-kilometriques", // Route admin (web)
    BY_ID: (id: number) => `/api/tarif-kilometriques/${id}`,
    ADMIN_BY_ID: (id: number) => `/api/admin/tarif-kilometriques/${id}`,
    ACTIFS: "/api/tarif-kilometriques/actifs",
    TOGGLE_ACTIVE: (id: number) => `/api/admin/tarif-kilometriques/${id}/toggle-active`,
    ADMIN_ARCHIVED: "/api/admin/tarif-kilometriques/archived",
    RESTORE: (id: number) => `/api/admin/tarif-kilometriques/${id}/restore`,
  },

  // ============================================
  // GESTION DES LIVREURS
  // ============================================
  LIVREURS: {
    BASE: "/api/admin/livreurs",
    BY_ID: (id: number) => `/api/admin/livreurs/${id}`,
    DISPONIBILITE: (id: number) => `/api/admin/livreurs/${id}/disponibilite`,
    STATISTIQUES: (id: number) => `/api/admin/livreurs/${id}/statistiques`,
    STATISTICS: "/api/admin/livreurs/statistiques/globales",
    DISPONIBLES: "/api/admin/livreurs/disponibles",
    TOGGLE_ACTIVE: (id: number) => `/api/admin/livreurs/${id}/toggle-active`,
  },

  // ============================================
  // COMMANDES (À IMPLÉMENTER)
  // ============================================
  COMMANDES: {
    BASE: "/api/commandes",
    BY_ID: (id: number) => `/api/commandes/${id}`,
    CHANGE_STATUS: (id: number) => `/api/commandes/${id}/statut`,
    ADD_LINE: (id: number) => `/api/commandes/${id}/lignes`,
    STATISTICS: "/api/commandes/statistiques/globales",
  },

  // ============================================
  // LIGNE COMMANDES (À IMPLÉMENTER)
  // ============================================
  LIGNE_COMMANDES: {
    BASE: "/api/ligne-commandes",
    BY_ID: (id: number) => `/api/ligne-commandes/${id}`,
    UPDATE_QUANTITY: (id: number) => `/api/ligne-commandes/${id}/quantite`,
  },

  // ============================================
  // PAIEMENTS (À IMPLÉMENTER)
  // ============================================
  PAIEMENTS: {
    BASE: "/api/paiements",
    BY_ID: (id: number) => `/api/paiements/${id}`,
    VALIDATE: (id: number) => `/api/paiements/${id}/valider`,
    MARK_FAILED: (id: number) => `/api/paiements/${id}/echec`,
  },

  // ============================================
  // TOURNÉES (À IMPLÉMENTER)
  // ============================================
  TOURNEES: {
    BASE: "/api/admin/tournees", // Route admin pour gestion
    BY_ID: (id: number) => `/api/admin/tournees/${id}`,
    CHANGE_STATUS: (id: number) => `/api/admin/tournees/${id}/statut`,
    ADD_OPERATIONS: (id: number) => `/api/admin/tournees/${id}/operations`, // Endpoint pour ajouter des opérations
    REMOVE_OPERATIONS: (id: number) => `/api/admin/tournees/${id}/operations`,
    STATISTICS: "/api/admin/tournees/statistiques/globales",
    DEMARRER: (id: number) => `/api/admin/tournees/${id}/demarrer`,
    TERMINER: (id: number) => `/api/admin/tournees/${id}/terminer`,
    ANNULER: (id: number) => `/api/admin/tournees/${id}/annuler`,
  },

  // ============================================
  // OPÉRATIONS LOGISTIQUES (À IMPLÉMENTER)
  // ============================================
  OPERATION_LOGISTIQUES: {
    BASE: "/api/admin/operations-logistiques", // Route admin
    BY_ID: (id: number) => `/api/admin/operations-logistiques/${id}`,
    CREATE_WITH_PREUVES: "/api/admin/operations-logistiques/avec-preuves",
    CHANGE_STATUS: (id: number) => `/api/admin/operations-logistiques/${id}/statut`,
    MARK_DONE: (id: number) => `/api/admin/operations-logistiques/${id}/realiser`,
    ADD_PREUVES: (id: number) => `/api/admin/operations-logistiques/${id}/preuves`,
    REMOVE_PREUVES: (id: number) => `/api/admin/operations-logistiques/${id}/preuves`,
    EN_RETARD: "/api/admin/operations-logistiques/retard/liste",
    STATISTICS: "/api/admin/operations-logistiques/statistiques/globales",
    DEMARRER: (id: number) => `/api/admin/operations-logistiques/${id}/demarrer`, // Endpoint demarrer
    COMPLETER: (id: number) => `/api/admin/operations-logistiques/${id}/completer`, // Endpoint completer
    ANNULER: (id: number) => `/api/admin/operations-logistiques/${id}/annuler`, // Endpoint annuler
  },

  // ============================================
  // PREUVES (À IMPLÉMENTER)
  // ============================================
  PREUVES: {
    BASE: "/api/preuves",
    BY_ID: (id: number) => `/api/preuves/${id}`,
    UPLOAD: "/api/preuves/upload",
    STATISTICS: "/api/preuves/statistiques/globales",
  },

  // ============================================
  // STATISTIQUES (À IMPLÉMENTER)
  // ============================================
  STATISTIQUES: {
    TABLEAU_DE_BORD: "/api/admin/statistiques/tableau-de-bord",
    PERFORMANCE_DELAIS: "/api/admin/statistiques/performance-delais",
    CLIENTS_ACTIFS: "/api/admin/statistiques/clients-actifs",
  },

  // ============================================
  // DÉLAIS DE LIVRAISON
  // ============================================
  DELAI_LIVRAISONS: {
    BASE: "/api/delai-livraisons", // Route publique (mobile)
    ADMIN_BASE: "/api/admin/delai-livraisons", // Route admin (web)
    BY_ID: (id: number) => `/api/delai-livraisons/${id}`,
    ADMIN_BY_ID: (id: number) => `/api/admin/delai-livraisons/${id}`,
    ACTIFS: "/api/delai-livraisons/actifs",
    TOGGLE_ACTIVE: (id: number) => `/api/admin/delai-livraisons/${id}/toggle-active`,
    ADMIN_ARCHIVED: "/api/admin/delai-livraisons/archived",
    RESTORE: (id: number) => `/api/admin/delai-livraisons/${id}/restore`,
  },

  // ============================================
  // CRÉNEAUX DE COLLECTE
  // ============================================
  CRENEAU_COLLECTES: {
    BASE: "/api/creneau-collectes", // Route publique (mobile)
    ADMIN_BASE: "/api/admin/creneau-collectes", // Route admin (web)
    ADMIN_ARCHIVED: "/api/admin/creneau-collectes/archived",
    BY_ID: (id: number) => `/api/creneau-collectes/${id}`,
    ADMIN_BY_ID: (id: number) => `/api/admin/creneau-collectes/${id}`,
    ACTIFS: "/api/creneau-collectes/actifs",
    TOGGLE_ACTIVE: (id: number) => `/api/admin/creneau-collectes/${id}/toggle-active`,
    RESTORE: (id: number) => `/api/admin/creneau-collectes/${id}/restore`,
  },

  // ============================================
  // TARIFS
  // ============================================
  TARIFS: {
    BASE: "/api/admin/tarifs",
    BY_ID: (id: number) => `/api/admin/tarifs/${id}`,
    CALCULER: "/api/tarifs/calculer", // Route publique pour calcul de prix
    BASE_TARIF: "/api/admin/tarifs/base",
    SUPPLEMENTAIRE: "/api/admin/tarifs/supplementaire",
    HISTORIQUE: (entityType: string, entityId: number) => `/api/admin/tarifs/historique/${entityType}/${entityId}`,
    ACTUEL: (entityType: string, entityId: number) => `/api/admin/tarifs/actuel/${entityType}/${entityId}`,
    TOGGLE_ACTIVE: (id: number) => `/api/admin/tarifs/${id}/toggle-active`,
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================
  NOTIFICATIONS: {
    BASE: "/api/notifications",
    BY_ID: (id: number) => `/api/notifications/${id}`,
    MOI: "/api/notifications", // Utilise l'endpoint /api/notifications qui récupère déjà les notifs de l'utilisateur connecté
    UNREAD: "/api/notifications/unread",
    UNREAD_COUNT: "/api/notifications/unread/count",
    STATS: "/api/notifications/stats",
    BY_TYPE: (type: string) => `/api/notifications/type/${type}`,
    MARK_AS_READ: (id: number) => `/api/notifications/${id}`,
    BULK_MARK_AS_READ: "/api/notifications/bulk/mark-as-read",
    MARK_ALL_AS_READ: "/api/notifications/mark-all-as-read",

    // Admin endpoints
    ADMIN_BASE: "/api/admin/notifications",
    ADMIN_MOI: "/api/admin/notifications",
    ADMIN_UNREAD_COUNT: "/api/admin/notifications/unread/count",
    ADMIN_STATS: "/api/admin/notifications/stats",
    ADMIN_CREATE: "/api/admin/notifications",
    ADMIN_BULK_CREATE: "/api/admin/notifications/bulk",
  },

  // ============================================
  // PROMOTIONS
  // ============================================
  PROMOTIONS: {
    BASE: "/api/promotions", // Route publique
    ADMIN_BASE: "/api/admin/promotions", // Route admin
    ADMIN_ARCHIVED: "/api/admin/promotions/archived",
    BY_ID: (id: number) => `/api/promotions/${id}`,
    ADMIN_BY_ID: (id: number) => `/api/admin/promotions/${id}`,
    ACTIVES: "/api/promotions/actives",
    SEARCH: (term: string) => `/api/admin/promotions/search/${term}`,
    TOGGLE_ACTIVE: (id: number) => `/api/admin/promotions/${id}/toggle-active`,
    RESTORE: (id: number) => `/api/admin/promotions/${id}/restore`,
    VERIFIER: "/api/promotions/verifier",
    STATISTIQUES: (id: number) => `/api/admin/promotions/${id}/statistiques`,
  },
} as const

export type EndpointKeys = keyof typeof ENDPOINTS
