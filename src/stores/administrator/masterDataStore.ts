import { action, makeObservable, observable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import masterDataService from '../../services/administrator/masterDataService'
import { initMultiLanguageField } from '@lib/helper'

class MasterDataStore {
  @observable isLoading!: boolean
  @observable masterDatas!: PagedResultDto<any>
  @observable editMasterData!: any
  @observable targetOptions: any = []
  constructor() {
    makeObservable(this)
  }
  @action
  async create(body: any) {
    await masterDataService.create(body)
  }

  @action
  async update(body: any) {
    this.isLoading = true
    await masterDataService.update(body).finally(() => (this.isLoading = false))
  }

  @action
  async delete(id: number) {
    await masterDataService.delete(id)
    this.masterDatas.items = this.masterDatas.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await masterDataService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await masterDataService.get(id)
    this.editMasterData = result
  }

  @action
  async createMasterData() {
    this.editMasterData = {
      id: 0,
      isActive: true,
      code: '',
      description: '',
      names: initMultiLanguageField(),
      target: '',
      parentCode: '',
      tenantType: ''
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await masterDataService.getAll(params).finally(() => (this.isLoading = false))
    this.masterDatas = result
  }

  @action
  async getTargetOptions(params: any) {
    this.targetOptions = await masterDataService.getTargetOptions(params)
    // let {masterDataTargets} = appConsts
    // this.targetOptions = Object.keys(masterDataTargets).map(key => {
    //   return {label: LCategory('MASTER_DATA_TARGET_' + key), value: masterDataTargets[key]}
    // })
  }
}

export default MasterDataStore
