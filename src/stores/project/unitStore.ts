import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '@services/dto/pagedResultDto'
import unitService from '../../services/project/unitService'
import handoverService from '@services/handover/handoverService'

class UnitStore {
  @observable isLoading!: boolean
  @observable units!: PagedResultDto<any>
  @observable editUnit!: any
  @observable unitTypes: any = []
  @observable unitUseStatus: any = []
  @observable unitIds: any = []
  @observable unitResidents!: PagedResultDto<any>
  @observable publishedUnits!: any[]
  @observable unitOverview: any[] = []
  constructor() {
    this.units = { totalCount: 0, items: [] }
    this.unitResidents = { totalCount: 0, items: [] }
    this.editUnit = {}
    this.publishedUnits = []
    makeObservable(this)
  }
  @action async getOverview(params) {
    this.isLoading = true
    this.unitOverview = await unitService.getOverview(params).finally(() => (this.isLoading = false))
  }
  @action
  async create(body: any) {
    this.isLoading = true
    await unitService.create(body).finally(() => (this.isLoading = false))
  }

  @action
  async update(updateUnitInput: any) {
    this.isLoading = true
    await unitService.update(updateUnitInput).finally(() => (this.isLoading = false))
  }

  @action
  async updateUnitUser(body: any) {
    this.isLoading = true
    await unitService.updateUnitUser(body).finally(() => (this.isLoading = false))
  }

  @action
  async getAllUnits(params: any) {
    const result = await handoverService.getListUnit(params)
    this.unitIds = result
  }

  @action
  async delete(id: number) {
    await unitService.delete(id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await unitService.activateOrDeactivate(id, isActive)
  }

  @action
  async getUnitTypes() {
    const result = await unitService.getUnitTypes()
    this.unitTypes = result
  }

  @action
  async getUnitUseStatus() {
    const result = await unitService.getUnitUseStatus()
    this.unitUseStatus = result
  }

  @action
  async get(id: number) {
    const result = await unitService.get(id)
    this.editUnit = result
  }

  @action
  async createUnit() {
    this.editUnit = {
      id: 0,
      projectId: undefined,
      buildingId: undefined,
      floorId: undefined,
      name: '',
      code: '',
      fullUnitCode: '',
      typeId: undefined,
      statusId: undefined,
      size: 0,
      // numOfRoom: 0,
      handOverDate: undefined,
      peCode: '',
      isActive: true,
      zones: [] as any
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await unitService.getAll(params).finally(() => (this.isLoading = false))
    this.units = result
  }

  @action
  async resetUnits() {
    this.units = { items: [], totalCount: 0 }
  }

  @action
  async getUnitResident(params: any) {
    const result = await unitService.getUnitResidents(params)
    this.unitResidents = result
  }

  @action
  async moveIn(body: any) {
    await unitService.moveIn(body)
    await this.getUnitResident({ unitId: this.editUnit.id, isActive: true })
  }

  @action
  async moveOut(body: any) {
    await unitService.moveOut(body)
    await this.getUnitResident({ unitId: this.editUnit.id, isActive: true })
  }

  @action
  async downloadTemplate() {
    return await unitService.downloadTemplateImport()
  }

  @action
  async getUnitsByProjectIds(projectIds: number[] | number, params = {}) {
    this.publishedUnits = await unitService.getUnitByProjectIds(projectIds, params)
  }

  @action
  async exportUnits(params: any) {
    this.isLoading = true
    return await unitService.exportUnits(params).finally(() => (this.isLoading = false))
  }
  async exportUnitUsers(params: any) {
    this.isLoading = true
    return await unitService.exportUnitUsers(params).finally(() => (this.isLoading = false))
  }

  @action
  async exportUnitForEdit(params: any) {
    this.isLoading = true
    return await unitService.exportUnitForEdit(params).finally(() => (this.isLoading = false))
  }
}

export default UnitStore
