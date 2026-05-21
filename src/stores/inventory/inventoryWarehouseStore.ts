import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '@services/dto/pagedResultDto'
import inventoryService from '@services/inventory/inventoryLocationService'

class InventoryWarehouseStore {
  @observable isLoading!: boolean
  @observable inventories!: PagedResultDto<any>
  @observable editInventoryBrand!: any

  constructor() {
    this.inventories = { items: [], totalCount: 0 }
    this.editInventoryBrand = { workflow: {} }
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
  async createInventory() {
    this.editInventoryBrand = {
      id: 0,
      name: '',
      description: ''
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await inventoryService.getAll(params).finally(() => (this.isLoading = false))
    this.inventories = result
  }
}

export default InventoryWarehouseStore
