import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '@services/dto/pagedResultDto'
import inventoryService from '@services/inventory/inventoryItemsService'
import fileService from '@services/common/fileService'
import { moduleFile } from '@lib/appconst'
import { InventoryItemModel } from '@models/Inventory/InventoryItemModel'

class InventoryItemsStore {
  @observable isLoading!: boolean
  @observable inventories!: PagedResultDto<any>
  @observable editInventoryItem!: any
  @observable itemsToQRCode!: Array<any>
  @observable inventoryItemsOptions!: Array<any>
  @observable inventoryHistories!: PagedResultDto<any>
  @observable allocateHistories!: PagedResultDto<any>

  constructor() {
    this.inventories = { items: [], totalCount: 0 }
    this.editInventoryItem = {}
    this.itemsToQRCode = []
    this.inventoryItemsOptions = []
    this.inventoryHistories = { items: [], totalCount: 0 }
    this.allocateHistories = { items: [], totalCount: 0 }
    makeObservable(this)
  }

  @action
  async create(body: any, files) {
    this.isLoading = true
    this.editInventoryItem = await inventoryService.create(body)
    const { documentId } = this.editInventoryItem
    if (files && files.length && documentId) {
      await fileService.upload(moduleFile.inventory, documentId, files)
    }
  }

  @action
  async update(updateInventoryInput: any, files) {
    this.isLoading = true
    await inventoryService.update(updateInventoryInput).finally(async () => {
      const { documentId } = this.editInventoryItem
      if (files && files.length && documentId) {
        await fileService.upload(moduleFile.inventory, documentId, files)
      }
    })
  }

  @action
  async get(id: number) {
    this.isLoading = true
    this.editInventoryItem = await inventoryService.get(id).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    this.isLoading = true
    await inventoryService.activateOrDeactivate(id, isActive).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async createInventory() {
    this.editInventoryItem = {
      id: 0,
      name: '',
      description: ''
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    this.inventories = await inventoryService.getAll(params).finally(() => (this.isLoading = false))
  }

  @action
  async getAllInventoryHistories(params: any) {
    this.isLoading = true
    this.inventoryHistories = await inventoryService
      .getInventoryHistories(params)
      .finally(() => (this.isLoading = false))
  }

  @action
  async getAllAllocateHistories(params: any) {
    this.isLoading = true
    this.allocateHistories = await inventoryService
      .getInventoryHistories(params)
      .finally(() => (this.isLoading = false))
  }

  @action
  setLoading(isLoading: boolean) {
    this.isLoading = isLoading
  }

  @action
  async storeItemsToQRCode(items: InventoryItemModel[]) {
    this.itemsToQRCode = items
  }

  @action
  async filterOptions(params: any) {
    const query = {
      maxResultCount: 1000,
      isActive: true,
      sorting: 'Name ASC',
      assetTypeIds: [],
      companyIds: [],
      keyword: ''
    }
    this.inventoryItemsOptions = await inventoryService.filterOptions({
      ...query,
      ...params
    })
  }

  @action
  async exportExcel(params: any) {
    this.isLoading = true
    await inventoryService.exportExcel(params).finally(() => (this.isLoading = false))
  }
}

export default InventoryItemsStore
