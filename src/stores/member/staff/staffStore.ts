import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../../services/dto/pagedResultDto'
import staffService from '../../../services/member/staff/staffService'

class StaffStore {
  @observable isLoading!: boolean
  @observable staffs!: PagedResultDto<any>
  @observable editStaff!: any
  @observable staffProjectRoles: any = []
  @observable staffOverview: any[] = []
  constructor() {
    this.staffs = { items: [], totalCount: 0 }
    makeObservable(this)
  }

  @action
  async create(body: any) {
    this.isLoading = true
    this.editStaff = await staffService.create(body).finally(() => (this.isLoading = false))
  }
  @action async getOverview(params) {
    this.isLoading = true
    this.staffOverview = await staffService.getOverview(params).finally(() => (this.isLoading = false))
  }
  @action
  async createStaff() {
    this.editStaff = {
      userName: '',
      name: '',
      surname: '',
      displayName: '',
      emailAddress: '',
      isActive: true,
      roleNames: [],
      password: '',
      id: 0
    }
  }

  @action
  async update(updateStaffInput: any) {
    this.isLoading = true
    await staffService.update(updateStaffInput).finally(() => (this.isLoading = false))
  }

  @action
  async delete(id: number) {
    await staffService.delete(id)
    this.staffs.items = this.staffs.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await staffService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    this.isLoading = true
    this.editStaff = await staffService.get(id).finally(() => (this.isLoading = false))
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await staffService.getAll(params).finally(() => (this.isLoading = false))
    this.staffs = result
  }

  @action
  async getProjectRoles(params: any, roles) {
    const result = await staffService.getProjectRoles(params)

    this.staffProjectRoles = result.map((projectRole) => {
      const initProjectRoles = (roles || []).map((role) => {
        return {
          ...role,
          isSelected: projectRole.roles.findIndex((item) => item.id === role.id) > -1
        }
      })

      projectRole.roles = initProjectRoles
      return projectRole
    })
  }

  @action
  async createStaffProject(projects, roles) {
    if (!this.staffProjectRoles) {
      this.staffProjectRoles = []
    }
    projects.map((project) => {
      if (this.staffProjectRoles.findIndex((item) => item.project.id === project.id) === -1) {
        this.staffProjectRoles.push({ project, roles })
      }
    })
  }

  @action
  async removeStaffProject(record) {
    if (!this.staffProjectRoles) {
      this.staffProjectRoles = []
    }

    this.staffProjectRoles = this.staffProjectRoles.filter((item) => item.project.id !== record.project.id)
  }

  @action
  async updateProjectRoles(userId) {
    this.isLoading = true
    const body = {
      userId,
      projects: this.staffProjectRoles.map((item) => ({
        projectId: item.project.id,
        roleIds: item.roles.filter((role) => role.isSelected).map((role) => role.id)
      }))
    }
    await staffService.setProjectRole(body).finally(() => (this.isLoading = false))
  }
}

export default StaffStore
