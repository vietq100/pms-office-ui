import { action, observable, makeObservable } from 'mobx'

import { AssetTypeModel, IAssetTypeModel } from '@models/asset/AssetTypeModel'
import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import assetTypeService from '../../services/facility/assetTypeService'

class AssetTypeStore {
  @observable isLoading!: boolean
  @observable pageResult!: PagedResultDto<AssetTypeModel>
  @observable assetTypeOptions: any = []

  constructor() {
    makeObservable(this)
    this.pageResult = { items: [], totalCount: 0 }
    this.assetTypeOptions = []
  }

  @action
  async getAll(params: any = {}) {
    this.isLoading = true
    this.pageResult = await assetTypeService.getAll(params).finally(() => (this.isLoading = false))
  }

  @action
  async activateOrDeactivate(id: number, isActive?: boolean) {
    await assetTypeService.activateOrDeactivate(id, isActive)
  }

  @action
  async create(assetType: IAssetTypeModel) {
    return await assetTypeService.create(assetType)
  }

  @action
  async update(assetType: IAssetTypeModel) {
    return await assetTypeService.update(assetType)
  }

  @action
  async filterOptions(params: any) {
    params.maxResultCount = 1000
    params.isActive = true
    params.sorting = 'Name ASC'
    this.assetTypeOptions = await assetTypeService.filterOptions(params)
  }
}

export default AssetTypeStore
