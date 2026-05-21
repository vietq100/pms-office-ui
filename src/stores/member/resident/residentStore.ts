import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../../services/dto/pagedResultDto'
import residentService from '../../../services/member/resident/residentService'
import unitService from '@services/project/unitService'

class ResidentStore {
  @observable isLoading!: boolean
  @observable residents!: PagedResultDto<any>
  @observable residentUnits!: PagedResultDto<any>
  @observable editResident!: any
  @observable memberRoles!: any
  @observable memberTypes!: any
  @observable residentOverview: any[] = []
  @observable notesResident: any
  constructor() {
    this.residents = { items: [], totalCount: 0 }
    this.editResident = {}
    this.memberRoles = []
    this.memberTypes = []
    makeObservable(this)
    this.notesResident = {
      id: 0,
      note: null
    }
  }
  @action async getOverview(params) {
    this.isLoading = true
    this.residentOverview = await residentService.getOverview(params).finally(() => (this.isLoading = false))
  }
  @action
  async create(body: any) {
    this.isLoading = true
    await residentService.create(body).finally(() => (this.isLoading = false))
  }

  @action
  async update(body: any) {
    this.isLoading = true
    await residentService.update(body).finally(() => (this.isLoading = false))
  }

  @action
  async delete(id: number) {
    await residentService.delete(id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await residentService.activateOrDeactivate(id, isActive)
  }

  @action
  async activateOrDeactivateListResident(selectedResidentIds, isActive) {
    await residentService.activateOrDeactivateListResident(selectedResidentIds, isActive)
  }

  @action
  async deleteListResident(selectedResidentIds) {
    await residentService.deleteListResident(selectedResidentIds)
  }

  @action
  async get(id: number, isShowPhoneEmail: boolean) {
    const result = await residentService.get(id, isShowPhoneEmail)
    this.editResident = result
  }

  @action
  async createResident() {
    this.editResident = {
      userName: '',
      name: '',
      surname: '',
      displayName: '',
      emailAddress: '',
      phoneNumber: '',
      identityNumber: '',
      passport: '',
      birthDate: null,
      identityIssuedOn: null,
      isActive: true,
      gender: undefined,
      profilePictureId: '',
      roleNames: [],
      password: '',
      id: 0
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await residentService.getAll(params).finally(() => (this.isLoading = false))

    // Hide phone number
    // const cloneResidents = result.items.map(item => {
    //   if (isNaN(parseInt(item.userName))) return item;
    //   let endPhoneNumber = item.userName.substring(item.userName.length - 3)
    //   return {...item, userName : `xxx${endPhoneNumber}`}
    // });
    // result.items = cloneResidents;
    //====================================================

    this.residents = result
  }

  @action
  async getMemberTypes() {
    // Don't need to call again if there are already init
    if (this.memberTypes && this.memberTypes.length) {
      return
    }

    this.memberTypes = await residentService.getMemberTypes()
  }

  @action
  async getMemberRoles() {
    // Don't need to call again if there are already init
    if (this.memberRoles && this.memberRoles.length) {
      return
    }

    this.memberRoles = await residentService.getMemberRoles()
  }

  @action
  async exportResidents(params: any) {
    this.isLoading = true
    return await residentService.exportResidents(params).finally(() => (this.isLoading = false))
  }

  @action
  async getResidentUnits(params: any) {
    this.isLoading = true
    this.residentUnits = await residentService.getResidentUnits(params).finally(() => (this.isLoading = false))
  }

  @action
  async addResidentUnits(units) {
    if (!this.residentUnits) {
      this.residentUnits = { items: [], totalCount: 0 }
    }
    this.residentUnits.items = this.residentUnits.items.concat(units)
  }

  @action
  async removeResidentUnit(unitId) {
    if (!this.residentUnits) {
      this.residentUnits = { items: [], totalCount: 0 }
    }
    this.residentUnits.items = this.residentUnits.items.filter((item) => item.unitId !== unitId)
  }

  @action
  async moveIn(body: any) {
    await unitService.moveIn(body)
    await this.getResidentUnits({
      userId: this.editResident.id,
      isActive: true
    })
  }

  @action
  async moveOut(body: any) {
    await unitService.moveOut(body)
    await this.getResidentUnits({
      userId: this.editResident.id,
      isActive: true
    })
  }

  @action
  async sendEmailInstallApp(residentId) {
    this.isLoading = true
    return await residentService.sendEmailInstallApp(residentId).finally(() => (this.isLoading = false))
  }

  @action
  async importFromExcel(file, params?) {
    return residentService.importFromExcel(file, params)
  }

  @action
  async downloadTemplate() {
    return residentService.downloadTemplate()
  }

  @action
  async getNoteResident(id: number) {
    this.notesResident = await residentService.getNoteResident(id)
  }

  @action
  async updateNoteResident(body: any) {
    this.notesResident = await residentService.updateNoteResident(body)
  }
}

export default ResidentStore
