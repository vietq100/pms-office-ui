import { action, observable, makeObservable } from 'mobx'

import { initMultiLanguageField } from '@lib/helper'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import inventoryService from '@services/inventory/inventoryCategoryService'

class InventoryCategoryStore {
  @observable isLoading!: boolean
  @observable inventories!: PagedResultDto<any>
  @observable subCategories!: Array<any>
  @observable editInventoryCategory!: any
  @observable inventoryCategoryOptions!: Array<any>

  constructor() {
    this.inventories = { items: [], totalCount: 0 }
    this.subCategories = []
    this.editInventoryCategory = {}
    this.inventoryCategoryOptions = []
    makeObservable(this)
  }

  @action
  async create(body: any) {
    this.isLoading = true
    this.editInventoryCategory = await inventoryService.create(body).finally(async () => {
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
  async activateOrDeactivateV2(body) {
    await inventoryService.activateOrDeactivateV2(body)
  }

  @action
  async createInventoryCategory() {
    this.editInventoryCategory = {
      id: 0,
      names: initMultiLanguageField(),
      description: ''
    }
  }

  @action
  async createInventorySubCategory(parentId?: number) {
    this.editInventoryCategory = {
      parent: { ...this.editInventoryCategory },
      id: 0,
      names: initMultiLanguageField(),
      description: '',
      parentId
    }
  }

  @action
  async edit(inventoryCategory) {
    console.log(inventoryCategory)
  }

  @action
  async sort(id: number, ids: Array<number>) {
    await inventoryService.sort(ids)
  }

  @action
  async get(id: number) {
    this.isLoading = true
    this.editInventoryCategory = await inventoryService.get(id)
    this.isLoading = false
  }

  @action
  async getChildren(parentId: number) {
    this.subCategories = await inventoryService.getChildren(parentId)
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    this.inventories = await inventoryService.getAll(params).finally(() => (this.isLoading = false))
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
    this.inventoryCategoryOptions = await inventoryService.filterOptions({
      ...query,
      ...params
    })
  }
}

export default InventoryCategoryStore
