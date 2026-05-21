import { moduleFile } from '@lib/appconst'
import fileService from '@services/common/fileService'
import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../../services/dto/pagedResultDto'
import shopOwnerService from '../../../services/member/shopOwner/shopOwnerService'

class ShopOwnerStore {
  @observable isLoading!: boolean
  @observable shopOwners!: PagedResultDto<any>
  @observable editShopOwner!: any
  @observable shopOwnerProjectRoles: any = []

  constructor() {
    this.shopOwners = { items: [], totalCount: 0 }
    makeObservable(this)
  }

  @action
  async create(body: any, files?, projectId?) {
    this.editShopOwner = await shopOwnerService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const bodyProjectId = {
      userId: this.editShopOwner.id,
      projects: [
        {
          projectId,
          roleIds: []
        }
      ]
    }
    await shopOwnerService.setProjectRole(bodyProjectId)
    const { uniqueId } = this.editShopOwner
    if (files && files.length && uniqueId) {
      files.forEach(async (file) => {
        const fileUpload = [file]
        await fileService.upload(moduleFile.shopOwner, uniqueId, fileUpload)
      })

      this.isLoading = false
    }
  }

  @action
  async createShopOwner() {
    this.editShopOwner = {
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
  async update(updateShopOwnerInput: any, files?) {
    this.isLoading = true
    this.editShopOwner = await shopOwnerService.update(updateShopOwnerInput).finally(async () => {
      const { uniqueId } = this.editShopOwner
      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        files.forEach(async (file) => {
          const fileUpload = [file]
          await fileService.upload(moduleFile.shopOwner, uniqueId, fileUpload)
        })
        this.isLoading = false
      }
    })
  }

  @action
  async delete(id: number) {
    await shopOwnerService.delete(id)
    this.shopOwners.items = this.shopOwners.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await shopOwnerService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await shopOwnerService.get(id)
    this.editShopOwner = result
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await shopOwnerService.getAll(params).finally(() => (this.isLoading = false))
    this.shopOwners = result
  }

  @action
  async getProjectRoles(params: any) {
    const result = await shopOwnerService.getProjectRoles(params)
    this.shopOwnerProjectRoles = result.map((projectRole) => {
      // let initProjectRoles = (roles || []).map((role) => {
      //   return { ...role, isSelected: projectRole.roles.findIndex((item) => item.id === role.id) > -1 }
      // })

      // projectRole.roles = initProjectRoles
      return projectRole
    })
  }

  @action
  async createShopOwnerProject(project, roles) {
    if (!this.shopOwnerProjectRoles) {
      this.shopOwnerProjectRoles = []
    }
    if (this.shopOwnerProjectRoles.findIndex((item) => item.project.id === project.id) === -1) {
      this.shopOwnerProjectRoles.push({ project, roles })
    }
  }

  @action
  async removeShopOwnerProject(record) {
    if (!this.shopOwnerProjectRoles) {
      this.shopOwnerProjectRoles = []
    }

    this.shopOwnerProjectRoles = this.shopOwnerProjectRoles.filter((item) => item.project.id !== record.project.id)
  }

  @action
  async updateProjectRoles(userId) {
    this.isLoading = true
    const body = {
      userId,
      projects: this.shopOwnerProjectRoles.map((item) => ({
        projectId: item.project.id,
        roleIds: item.roles.filter((role) => role.isSelected).map((role) => role.id)
      }))
    }
    await shopOwnerService.setProjectRole(body).finally(() => (this.isLoading = false))
  }
}

export default ShopOwnerStore
