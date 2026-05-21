import { action, observable, computed, toJS, makeObservable } from 'mobx'

import type { PagedResultDto } from '@services/dto/pagedResultDto'
import assetService from '@services/facility/assetService'
import fileService from '@services/common/fileService'
import { AssetModel } from '@models/asset/AssetModel'
import { moduleFile } from '@lib/appconst'
import { convertFilterDate } from '@lib/helper'

class AssetStore {
  @observable isLoading!: boolean
  @observable currentPage!: number
  @observable pageResult!: PagedResultDto<any>
  @observable editAsset!: AssetModel
  @observable itemsToQRCode!: AssetModel[]
  @observable assetOptions: any = []
  @observable filterObject: any

  constructor() {
    makeObservable(this)
    this.filterObject = {
      isActive: true,
      skipCount: 0,
      maxResultCount: 10
    }
    this.currentPage = 1
    this.pageResult = { items: [], totalCount: 0 }
    this.editAsset = new AssetModel()
    this.itemsToQRCode = []
    this.assetOptions = []
  }

  @action
  public setFilter(key, value) {
    if (key === 'purchasedDateFromTo') {
      this.filterObject = convertFilterDate(this.filterObject, value, 'fromPurchasedDate', 'toPurchasedDate')
    } else if (key === 'warrantyDateFromTo') {
      this.filterObject = convertFilterDate(this.filterObject, value, 'fromWarrantDate', 'toWarrantDate')
    } else {
      this.filterObject = {
        ...this.filterObject,
        [key as any]: value
      }
    }

    if (key !== 'skipCount') {
      this.currentPage = 1
      this.filterObject.skipCount = 0
    }
  }

  @action
  public resetFilter() {
    this.filterObject = {
      skipCount: 0,
      isActive: true,
      maxResultCount: 10
    }
    this.currentPage = 1
  }

  @action
  public setCurrentPage(page) {
    this.currentPage = page
  }

  @action
  async create(body: any, files?: any) {
    this.isLoading = true
    this.editAsset = await assetService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { documentId } = this.editAsset
    if (files && files.length && documentId) {
      await fileService.upload(moduleFile.asset, documentId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(updateAssetInput: any, files?: any) {
    this.isLoading = true
    await assetService.update(updateAssetInput).finally(async () => {
      const { documentId } = this.editAsset
      this.isLoading = !!(files && files.length && documentId)
      if (files && files.length && documentId) {
        await fileService.upload(moduleFile.asset, documentId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async delete(id: number) {
    await assetService.delete(id)
    this.pageResult.items = this.pageResult.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await assetService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await assetService.get(id)
    this.editAsset = result
  }

  @computed
  get assets() {
    return this.pageResult ? toJS(this.pageResult.items) : []
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    this.pageResult = await assetService
      .getAll({ ...this.filterObject, ...params })
      .finally(() => (this.isLoading = false))
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
    this.assetOptions = await assetService.filterOptions({
      ...query,
      ...params
    })
  }

  @action
  async getAllMyAsset(params: any) {
    this.isLoading = true
    const result = await assetService.getAllMyAsset(params).finally(() => (this.isLoading = false))
    this.pageResult = result
  }

  @action
  async getByCode(code) {
    this.editAsset = await assetService.getByCode(code)
  }

  @action
  async exportAssets(params: any) {
    this.isLoading = true
    return await assetService.exportAsset(params).finally(() => (this.isLoading = false))
  }

  @action
  async storeItemsToQRCode(items: AssetModel[]) {
    this.itemsToQRCode = items
  }

  @action
  async setReminder(key: string, value: any) {
    this.editAsset.reminder[key] = value
  }

  @action
  async createAssetModel() {
    this.editAsset = new AssetModel()
  }

  @action
  async setEditAsset(key: string, value: any) {
    this.editAsset[key] = value
  }
}

export default AssetStore
