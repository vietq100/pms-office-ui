import { action, observable, makeObservable } from 'mobx'
import type { PagedResultDto } from '../../../services/dto/pagedResultDto'
import developService from '@services/member/develop/developService'
import staffService from '@services/member/staff/staffService'

class DevelopStore {
  @observable isLoading!: boolean
  @observable develops!: PagedResultDto<any>
  @observable staffProjectRoles: any = []

  @observable editDevelop!: any

  constructor() {
    this.develops = { items: [], totalCount: 0 }
    this.editDevelop = {}
    makeObservable(this)
  }

  @action
  async create(body: any) {
    this.isLoading = true
    await developService.create(body).finally(() => (this.isLoading = false))
  }

  @action
  async update(body: any) {
    this.isLoading = true
    await developService.update(body).finally(() => (this.isLoading = false))
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await developService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await developService.get(id)
    this.editDevelop = result
  }

  @action
  async createDevelop() {
    this.editDevelop = {
      userName: '',
      name: '',
      surname: '',
      displayName: '',
      emailAddress: '',
      phoneNumber: '',
      identityNumber: '',
      passport: '',
      birthDate: null,
      identityIssuedOn: null,
      isActive: true,
      gender: undefined,
      profilePictureId: '',
      roleNames: [],
      password: '',
      id: 0
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await developService.getAll(params).finally(() => (this.isLoading = false))

    this.develops = result
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

export default DevelopStore
