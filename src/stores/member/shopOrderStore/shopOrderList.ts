import { moduleFile } from '@lib/appconst'
import fileService from '@services/common/fileService'
import shopOrderService from '@services/member/shopOrder/shopOrderService'
import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../../services/dto/pagedResultDto'

class ShopOrderStore {
  @observable isLoading!: boolean
  @observable editShopOrder!: any
  @observable shopOwnerProjectRoles: any = []
  @observable activeMesTab!: boolean
  @observable orderStatus: any = []
  @observable shopOrderList!: PagedResultDto<any>
  constructor() {
    makeObservable(this)
  }
  @action activeMessageTab(value: boolean) {
    this.activeMesTab = value
  }

  @action
  async update(updateProductInput: any, files?) {
    this.isLoading = true
    await shopOrderService.update(updateProductInput).finally(async () => {
      const { uniqueId } = this.editShopOrder
      this.isLoading = !!(files && files.length && uniqueId)
      if (files && files.length && uniqueId) {
        files.forEach(async (file) => {
          const fileUpload = [file.originFileObj]
          await fileService.upload(moduleFile.product, uniqueId, fileUpload)
        })
        this.isLoading = false
      }
    })
  }

  @action
  async getOrderStatus() {
    const res = await shopOrderService.getOrderStatus()
    this.orderStatus = res.result
  }

  @action
  async get(id: number) {
    const result = await shopOrderService.get(id)
    this.editShopOrder = result
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await shopOrderService.getAll(params).finally(() => (this.isLoading = false))
    this.shopOrderList = result
  }

  @action
  async getAllMyOrder(params: any) {
    this.isLoading = true
    const result = await shopOrderService.getAllMyOrder(params).finally(() => (this.isLoading = false))
    this.shopOrderList = result
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
  async updateOrderDetail(status, details) {
    await shopOrderService.updateOrderStatus(status)
    details.map(async (element) => {
      delete element.product
    })
    await shopOrderService.updateOrderDetails(details)
  }

  @action
  async removeShopOwnerProject(record) {
    if (!this.shopOwnerProjectRoles) {
      this.shopOwnerProjectRoles = []
    }

    this.shopOwnerProjectRoles = this.shopOwnerProjectRoles.filter((item) => item.project.id !== record.project.id)
  }
}

export default ShopOrderStore
