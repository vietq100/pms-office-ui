import { action, observable, makeObservable } from 'mobx'

import { InventoryModel } from '@models/Inventory'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import inventoryService from '@services/inventory/inventoryBrandService'

class InventoryBrandStore {
  @observable isLoading!: boolean
  @observable inventories!: PagedResultDto<any>
  @observable editInventoryBrand!: any
  @observable inventoryBrandOptions!: Array<any>

  constructor() {
    this.inventories = { items: [], totalCount: 0 }
    this.editInventoryBrand = {}
    this.inventoryBrandOptions = []
    makeObservable(this)
  }

  @action
  async create(body: any) {
    this.isLoading = true
    this.editInventoryBrand = await inventoryService.create(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async update(updateInventoryInput: any) {
    this.isLoading = true
    await inventoryService.update(updateInventoryInput).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await inventoryService.activateOrDeactivate(id, isActive)
  }

  @action
  async createInventoryBrand() {
    this.editInventoryBrand = {
      id: 0,
      name: '',
      description: ''
    }
  }

  @action
  async edit(inventoryBrand: InventoryModel) {
    this.editInventoryBrand = inventoryBrand
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await inventoryService.getAll(params).finally(() => (this.isLoading = false))
    this.inventories = result
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
    this.inventoryBrandOptions = await inventoryService.filterOptions({
      ...query,
      ...params
    })
  }
}

export default InventoryBrandStore
