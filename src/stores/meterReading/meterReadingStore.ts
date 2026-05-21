import { action, observable, makeObservable } from 'mobx'

import { IMeterReadingModel } from '@models/meterReading/MeterReadingModel'
import meterReadingService from '@services/meterReading/meterReadingService'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import type { IPackageFee } from '@models/fee'

class MeterReadingStore {
  @observable isLoading!: boolean
  @observable profileWaters!: IMeterReadingModel[]
  @observable profileElictrics!: IMeterReadingModel[]
  @observable meters!: PagedResultDto<any>
  @observable meterLogs!: PagedResultDto<any>
  @observable currentPackage!: IPackageFee
  constructor() {
    makeObservable(this)
    this.meters = { items: [], totalCount: 0 }
    this.meterLogs = { items: [], totalCount: 0 }
  }

  @action
  async createOrUpdateElectricityProfile(body: any) {
    this.isLoading = true
    await meterReadingService.createOrUpdateElectricityProfile(body).finally(async () => {
      this.isLoading = false
    })
  }
  @action
  async createOrUpdateWaterProfile(body: any) {
    this.isLoading = true
    await meterReadingService.createOrUpdateWaterProfile(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async getMeterElectricityProfileForUnit(params: any) {
    this.isLoading = true
    const result = await meterReadingService
      .getMeterElectricityProfileForUnit(params)
      .finally(() => (this.isLoading = false))
    this.profileElictrics = result
  }
  @action
  async getMeterWaterProfileForUnit(params: any) {
    this.isLoading = true
    const result = await meterReadingService.getMeterWaterProfileForUnit(params).finally(() => (this.isLoading = false))
    this.profileWaters = result
  }

  @action
  async getOverviewMeterWater(params: any) {
    this.isLoading = true
    const result = await meterReadingService.getOverviewMeterWater(params).finally(() => (this.isLoading = false))
    this.meters = result
  }
  @action
  async getAllMeterWaterLogs(params: any) {
    this.isLoading = true
    const result = await meterReadingService.getAllMeterWaterLogs(params).finally(() => (this.isLoading = false))
    this.meterLogs = result
  }
  @action
  async exportMeterOverview(param: any) {
    this.isLoading = true
    return meterReadingService.exportMeterOverview(param).finally(() => (this.isLoading = false))
  }
  @action
  async downloadTemplate() {
    return meterReadingService.downloadTemplate()
  }
  @action
  async importFee(file) {
    return meterReadingService.importFee(file)
  }
  @action
  async getCurrentPackage() {
    this.isLoading = true
    const result = await meterReadingService.getCurrentPackage().finally(() => (this.isLoading = false))
    this.currentPackage = result
  }

  async updateCurrentPackage(body) {
    this.isLoading = true
    const result = await meterReadingService.updateCurrentPackage(body).finally(() => (this.isLoading = false))
    this.currentPackage = result
  }

  async completeWaterMeterPeriod(body) {
    this.isLoading = true
    await meterReadingService.completeWaterMeterPeriod(body).finally(() => (this.isLoading = false))
  }
}

export default MeterReadingStore
