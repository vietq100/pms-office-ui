import type { PagedResultDto } from '@services/dto/pagedResultDto'
import { IFeeType } from '@models/fee'
import { action, observable, makeObservable } from 'mobx'
import feeTypeService from '@services/fee/feeTypeService'
import { initMultiLanguageField } from '@lib/helper'

class FeeTypeStore {
  @observable pagedResult!: PagedResultDto<IFeeType>
  @observable isLoading!: boolean
  @observable editFeeType!: IFeeType
  @observable filters!: any
  @observable feeTypesReservation!: any
  @observable feeTypesManagement!: any
  @observable feeTypeConfig!: any
  @observable listVehicelType!: any
  @observable listsFeeUnitUserByUnit!: any
  @observable listFeeTypeDetail!: any
  constructor() {
    makeObservable(this)
    this.pagedResult = {
      items: [],
      totalCount: 0
    }
    this.filters = {}
  }

  @action
  public setFilter(key, value) {
    this.filters = { ...this.filters, [key as any]: value }
  }

  @action
  async create(body) {
    const result = await feeTypeService.create(body)
    this.editFeeType = result
  }

  @action
  async update(body) {
    await feeTypeService.update(body)
  }

  @action
  async activateOrDeactivate(id, isActive) {
    await feeTypeService.activateOrDeactivate(id, isActive)
  }

  @action
  async delete(id) {
    await feeTypeService.delete(id)
    this.pagedResult.items = this.pagedResult.items.filter((x) => x.id !== id)
  }

  @action
  async get(id) {
    const result = await feeTypeService.get(id)
    this.editFeeType = result
  }

  @action
  async createFeeType() {
    this.editFeeType = {
      names: initMultiLanguageField(),
      code: '',
      description: '',
      feeGenerateConfiguration: null,
      isFeeNotification: true
    }
  }

  @action
  async getAll(params) {
    this.isLoading = true
    const result = await feeTypeService.getAll(params).finally(() => (this.isLoading = false))
    this.pagedResult = result
  }

  @action
  async getLists(params) {
    this.pagedResult.items = await feeTypeService.getList({
      ...params
    })
  }
  @action
  async getListDetail() {
    const res = await feeTypeService.getListDetail()
    this.listFeeTypeDetail = res
  }

  @action
  async getListsFeeReservation(params) {
    this.feeTypesReservation = await feeTypeService.getList({
      ...params
    })
  }
  @action
  async getListsFeeManagement(params) {
    this.feeTypesManagement = await feeTypeService.getList({
      ...params
    })
  }

  @action
  async createConfig(body) {
    await feeTypeService.createConfig(body)
  }
  @action
  async updateConfig(body) {
    await feeTypeService.updateConfig(body)
  }

  @action
  async getFeeConfigByFeeType(id) {
    const result = await feeTypeService.getFeeConfigByFeeType(id)

    this.feeTypeConfig = result
  }
  @action
  async GetListVehicelType() {
    const result = await feeTypeService.GetListVehicelType()
    this.listVehicelType = result
  }

  @action
  async createOrUpdateFeeUnitUser(body) {
    await feeTypeService.createOrUpdateFeeUnitUser(body)
  }

  @action
  async getListsFeeUnitUserByUnit(params: any) {
    const result = await feeTypeService.getListsFeeUnitUserByUnit(params)
    this.listsFeeUnitUserByUnit = result.sort(
      (a, b) => (new Number(a.unitUserId) as any) - (new Number(b.unitUserId) as any)
    )
  }
}

export default FeeTypeStore
