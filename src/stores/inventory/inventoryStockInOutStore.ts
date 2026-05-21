import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '@services/dto/pagedResultDto'
import inventoryStockInOutService from '@services/inventory/inventoryStockInOutService'
import fileService from '@services/common/fileService'
import {
  InventoryStockInModel,
  InventoryStockOutModel,
  IInventoryStockTypes,
  IInventoryItem
} from '@models/Inventory/InventoryItemModel'
import { moduleFile } from '@lib/appconst'

class InventoryStockInOutStore {
  @observable isLoading!: boolean
  @observable inventories!: PagedResultDto<any>
  @observable editStockIn: any
  @observable editStockOut: any

  constructor() {
    this.inventories = { items: [], totalCount: 0 }
    this.editStockIn = new InventoryStockInModel()
    this.editStockOut = new InventoryStockOutModel()
    makeObservable(this)
  }

  @action
  async createStockIn(body: any, files) {
    this.isLoading = true
    this.editStockIn = await inventoryStockInOutService.createStockIn(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { documentId } = this.editStockIn
    if (files && files.length && documentId) {
      await fileService.upload(moduleFile.inventory, documentId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async createStockStockOut(body: any, files) {
    this.isLoading = true
    this.editStockOut = await inventoryStockInOutService.createStockOut(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { documentId } = this.editStockOut
    if (files && files.length && documentId) {
      await fileService.upload(moduleFile.inventory, documentId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async updateStockIn(updateInventoryInput: any, files) {
    this.isLoading = true
    await inventoryStockInOutService.updateStockIn(updateInventoryInput).finally(async () => {
      const { documentId } = this.editStockIn
      this.isLoading = !!(files && files.length && documentId)
      if (files && files.length && documentId) {
        await fileService.upload(moduleFile.inventory, documentId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async updateStockOut(updateInventoryInput: any, files) {
    this.isLoading = true
    await inventoryStockInOutService.updateStockOut(updateInventoryInput).finally(async () => {
      const { documentId } = this.editStockIn
      this.isLoading = !!(files && files.length && documentId)
      if (files && files.length && documentId) {
        await fileService.upload(moduleFile.inventory, documentId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async activateOrDeactivate(id: number, isActive: boolean) {
    await inventoryStockInOutService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(type: IInventoryStockTypes, id: number) {
    if (type === IInventoryStockTypes.stockIn) {
      this.editStockIn = await inventoryStockInOutService.getStockIn(id)
    } else {
      this.editStockOut = await inventoryStockInOutService.getStockOut(id)
    }
  }

  @action
  async createInventoryStock(type: IInventoryStockTypes, inventoryItem: IInventoryItem) {
    if (type === IInventoryStockTypes.stockIn) {
      this.editStockIn = new InventoryStockInModel()
      this.editStockIn.inventoryId = inventoryItem.id
      this.editStockIn.currentQuantity = inventoryItem.quantity
    } else {
      this.editStockOut = new InventoryStockOutModel()
      this.editStockOut.inventoryId = inventoryItem.id
      this.editStockOut.currentQuantity = inventoryItem.quantity
    }
  }

  @action
  async getAll(type: IInventoryStockTypes, params: any) {
    this.isLoading = true
    this.inventories = await inventoryStockInOutService.getAll(type, params).finally(() => (this.isLoading = false))
  }

  @action
  async exportExcelStockIn(params: any) {
    this.isLoading = true
    await inventoryStockInOutService.exportExcelStockIn(params).finally(() => (this.isLoading = false))
  }
  @action
  async exportExcelStockOut(params: any) {
    this.isLoading = true
    await inventoryStockInOutService.exportExcelStockOut(params).finally(() => (this.isLoading = false))
  }
}

export default InventoryStockInOutStore
