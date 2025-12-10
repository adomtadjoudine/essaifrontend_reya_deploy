// Configuration centralisée de l'API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://a96c7bykrwf.preview.hosting-ik.com",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
      LOGOUT: "/api/auth/logout",
      ME: "/api/auth/me",
    },
    USERS: {
      BASE: "/api/utilisateurs",
      BY_ID: (id: number) => `/api/utilisateurs/${id}`,
      ROLES: (id: number) => `/api/utilisateurs/${id}/roles`,
    },
    ROLES: {
      BASE: "/api/roles",
      BY_ID: (id: number) => `/api/roles/${id}`,
      ASSIGN: "/api/roles/assign",
      REMOVE: "/api/roles/remove",
    },
    PERMISSIONS: {
      BASE: "/api/permissions",
      BY_ID: (id: number) => `/api/permissions/${id}`,
      ASSIGN: "/api/permissions/assign",
      REMOVE: "/api/permissions/remove",
    },
    SERVICES: {
      BASE: "/api/services",
      BY_ID: (id: number) => `/api/services/${id}`,
      ARCHIVE: (id: number) => `/api/services/${id}/archive`,
    },
  },
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const getFileUrl = (relativePath: string): string => {
  if (!relativePath) return ""
  // If already an absolute URL, return as is
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return relativePath
  }
  // Prepend API base URL to relative paths
  const baseUrl = API_CONFIG.BASE_URL
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`
  return `${baseUrl}${path}`
}
