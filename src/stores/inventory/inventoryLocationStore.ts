import { action, observable, makeObservable } from 'mobx'

import { InventoryModel } from '@models/Inventory'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import inventoryLocationService from '@services/inventory/inventoryLocationService'

class InventoryLocationStore {
  @observable isLoading!: boolean
  @observable inventories!: PagedResultDto<any>
  @observable editInventoryLocation!: any
  @observable inventoryLocationOptions!: Array<any>

  constructor() {
    this.inventories = { items: [], totalCount: 0 }
    this.editInventoryLocation = {}
    this.inventoryLocationOptions = []
    makeObservable(this)
  }

  @action
  async create(body: any) {
    this.isLoading = true
    this.editInventoryLocation = await inventoryLocationService.create(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async update(updateInventoryInput: any) {
    this.isLoading = true
    await inventoryLocationService.update(updateInventoryInput).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await inventoryLocationService.activateOrDeactivate(id, isActive)
  }

  @action
  async createInventoryLocation() {
    this.editInventoryLocation = {
      id: 0,
      name: '',
      description: ''
    }
  }

  @action
  async edit(inventoryLocation: InventoryModel) {
    this.editInventoryLocation = inventoryLocation
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await inventoryLocationService.getAll(params).finally(() => (this.isLoading = false))
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
    this.inventoryLocationOptions = await inventoryLocationService.filterOptions({ ...query, ...params })
  }
}

export default InventoryLocationStore
