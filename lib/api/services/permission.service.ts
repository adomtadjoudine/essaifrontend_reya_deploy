import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type { Permission, CreatePermissionData, UpdatePermissionData, AssignPermissionData } from "../types"

class PermissionService extends BaseService<Permission, CreatePermissionData, UpdatePermissionData> {
  constructor() {
    super(ENDPOINTS.PERMISSIONS.BASE)
  }

  async assignToRole(data: AssignPermissionData) {
    return this.customRequest<{ message: string }>("POST", ENDPOINTS.PERMISSIONS.ASSIGN, data)
  }

  async removeFromRole(data: AssignPermissionData) {
    return this.customRequest<{ message: string }>("POST", ENDPOINTS.PERMISSIONS.REMOVE, data)
  }
}

export const permissionService = new PermissionService()
export default permissionService
