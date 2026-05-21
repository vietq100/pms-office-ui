import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import fileService from '../../services/common/fileService'
import { moduleFile } from '../../lib/appconst'
import contractOfficeService from '@services/project/contractOfficeService'

class ContractOfficeStore {
  @observable isLoading!: boolean
  @observable isSyncing!: boolean

  @observable editContract!: any
  @observable contractOffices!: PagedResultDto<any>
  @observable laStage: any[] = []
  @observable leaseAgreementStatus: any[] = []
  @observable listPaymentSchedule: any[] = []

  constructor() {
    this.editContract = { workflow: {} }
    makeObservable(this)
  }

  @action
  async createOrUpdate(updateContractInput: any, files, notify = true) {
    this.isLoading = true
    const result = await contractOfficeService.createOrUpdate(updateContractInput, notify).finally(() => {
      this.isLoading = false
    })
    const { uniqueId } = this.editContract
    if (files && files.length && uniqueId) {
      this.isLoading = true
      await fileService.upload(moduleFile.contractOffice, uniqueId, files).finally(() => {
        this.isLoading = false
      })
    } else {
      this.isLoading = false
    }
    return result
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await contractOfficeService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await contractOfficeService.get(id)
    this.editContract = result
    return result
  }

  @action
  async createContract(projectId?) {
    this.editContract = {
      id: 0,
      isActive: true,
      projectId,
      relatedTo: undefined
    }
  }
  @action async getListLAStatus(keyword) {
    const res = await contractOfficeService.getListLAStatus(keyword)
    this.laStage = res?.filter((item) => item.code === 'LAStage')
    this.leaseAgreementStatus = res?.filter((item) => item.code === 'LAStatus')
  }
  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await contractOfficeService.getAll(params).finally(() => (this.isLoading = false))
    this.contractOffices = result
  }
  @action
  async createPaymentSchedule(params) {
    this.isLoading = true
    await contractOfficeService.createPaymentSchedule(params).finally(() => (this.isLoading = false))

    // this.listPaymentAmount = result;
  }
  @action async getPaymentSchedule(id) {
    this.isLoading = true
    const res = await contractOfficeService.getPaymentSchedule(id).finally(() => (this.isLoading = false))
    this.listPaymentSchedule = res
    return res
  }
  @action
  async updateStatusPaymentSchedule(body) {
    this.isLoading = true
    await contractOfficeService.updateStatusPaymentSchedule(body).finally(() => (this.isLoading = false))

    // this.listPaymentAmount = result;
  }

  @action
  async syncToSap(id: number) {
    this.isSyncing = true
    const result = await contractOfficeService.syncToSap(id).finally(() => (this.isSyncing = false))
    return result
  }
  @action
  async reSyncToSap(id: number) {
    this.isSyncing = true
    const result = await contractOfficeService.reSyncToSap(id).finally(() => (this.isSyncing = false))
    return result
  }
}

export default ContractOfficeStore
