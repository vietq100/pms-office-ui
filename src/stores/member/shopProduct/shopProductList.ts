import { moduleFile } from '@lib/appconst'
import fileService from '@services/common/fileService'
import shopProductService from '@services/member/shopProduct/shopProductService'
import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../../services/dto/pagedResultDto'

class ShopProductStore {
  @observable isLoading!: boolean
  @observable shopProductList!: PagedResultDto<any>
  @observable editShopProduct!: any
  @observable shopOwnerProjectRoles: any = []
  @observable productCategory: any = []

  constructor() {
    this.shopProductList = { items: [], totalCount: 0 }
    makeObservable(this)
  }

  @action
  async create(body: any, files?) {
    this.isLoading = true
    this.editShopProduct = await shopProductService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { uniqueId } = this.editShopProduct
    if (files && files.length && uniqueId) {
      files.forEach(async (file) => {
        const fileUpload = [file.originFileObj]
        await fileService.upload(moduleFile.shopOwner, uniqueId, fileUpload)
      })
      this.isLoading = false
    }
    // this.isLoading = true
    // this.editShopProduct = await shopProductService.create(body).finally(() => (this.isLoading = false))
  }

  @action
  async createShopOwner() {
    this.editShopProduct = {
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
  async update(updateProductInput: any, files?) {
    this.isLoading = true
    await shopProductService.update(updateProductInput).finally(async () => {
      const { uniqueId } = this.editShopProduct
      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        files.forEach(async (file) => {
          if (file.originFileObj !== undefined) {
            const fileUpload = [file.originFileObj]
            await fileService.upload(moduleFile.product, uniqueId, fileUpload)
          }
        })
        this.isLoading = false
      }
    })
  }

  @action
  async delete(id: number) {
    await shopProductService.delete(id)
    this.shopProductList.items = this.shopProductList.items.filter((x) => x.id !== id)
  }

  @action
  async getProductCategory() {
    const res = await shopProductService.getProductCategory()
    this.productCategory = res.result
  }

  @action
  async get(id: number) {
    const result = await shopProductService.get(id)
    this.editShopProduct = result
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await shopProductService.getAll(params).finally(() => (this.isLoading = false))
    this.shopProductList = result
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
}

export default ShopProductStore
