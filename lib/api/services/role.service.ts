import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type { Role, CreateRoleData, UpdateRoleData, AssignRoleData } from "../types"

class RoleService extends BaseService<Role, CreateRoleData, UpdateRoleData> {
  constructor() {
    super(ENDPOINTS.ROLES.BASE)
  }

  async assignToUser(data: AssignRoleData) {
    return this.customRequest<{ message: string }>("POST", ENDPOINTS.ROLES.ASSIGN, data)
  }

  async removeFromUser(data: AssignRoleData) {
    return this.customRequest<{ message: string }>("POST", ENDPOINTS.ROLES.REMOVE, data)
  }
}

export const roleService = new RoleService()
export default roleService
