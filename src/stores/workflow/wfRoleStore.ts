import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
// import { PagedRoleResultRequestDto } from '../../services/workflow/dto/PagedResultRequestDto'
import type { Role } from '../../services/workflow/dto/role'
import wfRoleService from '../../services/workflow/wfRoleService'
import { initMultiLanguageField } from '../../lib/helper'
import { IUserModel } from '../../models/User/IUserModel'

class WfRoleStore {
  @observable isLoading!: boolean
  @observable wfRole!: PagedResultDto<Role>
  @observable editWfRole!: Role
  @observable allRoles!: Role[]
  @observable roleMembers!: IUserModel[]

  constructor() {
    makeObservable(this)
  }
  @action
  async create(createWfRoleInput) {
    this.isLoading = true
    await wfRoleService.create(createWfRoleInput).finally(() => (this.isLoading = false))
  }

  @action
  async update(updateWfRoleInput) {
    this.isLoading = true
    await wfRoleService.update(updateWfRoleInput).finally(() => (this.isLoading = false))
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await wfRoleService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id) {
    this.editWfRole = await wfRoleService.get(id)
  }

  @action
  async createWfRole() {
    this.editWfRole = {
      id: 0,
      names: initMultiLanguageField(),
      isActive: true
    }
  }

  @action
  async getAll(pagedFilterAndSortedRequest: any) {
    this.isLoading = true
    this.wfRole = await wfRoleService.getAll(pagedFilterAndSortedRequest).finally(() => (this.isLoading = false))
  }

  @action
  async getList(moduleId?) {
    this.allRoles = await wfRoleService.getList({ moduleId })
  }

  @action
  async getRoleMembers(roleId) {
    this.roleMembers = await wfRoleService.getRoleMember({ roleId })
  }

  @action
  async updateRoleMembers(roleId, userIds) {
    await wfRoleService.updateRoleMember({ roleId, userIds })
    this.roleMembers = []
  }
}

export default WfRoleStore
