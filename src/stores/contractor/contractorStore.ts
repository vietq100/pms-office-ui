import type { PagedResultDto } from '@services/dto/pagedResultDto'

import { observable, makeObservable, action } from 'mobx'
import contractorService from '@services/contractor/contractorService'
import { ContractorDetailModel } from '@models/contractor/contractorModel'

class ContractorStore {
  @observable pagedResult!: PagedResultDto<any>
  @observable contractors: any
  @observable isLoading!: boolean
  @observable editContractor!: ContractorDetailModel
  @observable listFirm!: any
  @observable editDocument!: any
  @observable listDocumentType!: any
  @observable listContractorWO: any
  @observable editContractorActivity: any
  @observable listContactByContractor: any
  @observable editContact: any
  @observable listStatus: any
  @observable approvalHistory: any
  constructor() {
    makeObservable(this)
    this.pagedResult = {
      items: [],
      totalCount: 0
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await contractorService.getAll(params).finally(() => (this.isLoading = false))
    this.pagedResult = result
  }

  @action
  async create(body: any) {
    this.isLoading = true
    this.editContractor = await contractorService.create(body).finally(() => (this.isLoading = false))
  }

  @action
  async createUserContractor(body: any) {
    this.isLoading = true
    this.editContractor = await contractorService.createUserContractor(body).finally(() => (this.isLoading = false))
  }

  @action
  async update(body: any) {
    this.isLoading = true
    this.editContractor = await contractorService.update(body).finally(() => (this.isLoading = false))
  }

  @action
  async get(id: number) {
    const result = await contractorService.get(id)
    this.editContractor = result
  }
  @action
  async getListFirm() {
    const result = await contractorService.getListFirm()
    this.listFirm = result
  }
  @action
  async createDocument(body: any) {
    const result = await contractorService.createDocument(body)
    this.editDocument = result
  }
  @action
  async updateDocument(body: any) {
    const result = await contractorService.updateDocument(body)
    this.editDocument = result
  }

  @action
  async uploadContractor(uniqueId, file) {
    this.isLoading = true
    await contractorService.uploadContractor(uniqueId, file).finally(() => (this.isLoading = false))
  }

  @action
  async uploadContractorActivity(uniqueId, file) {
    this.isLoading = true
    await contractorService.uploadContractorActivity(uniqueId, file).finally(() => (this.isLoading = false))
  }

  @action
  async activateOrDeactivate(id, isActive) {
    await contractorService.activateOrDeactivate(id, isActive)
  }

  @action
  async deleteContractorContact(id) {
    await contractorService.deleteContractorContact(id)
  }

  @action
  async activateOrDeactivateContractorActivity(id, isActive) {
    await contractorService.activateOrDeactivateContractorActivity(id, isActive)
  }

  @action
  async getListDocumentType() {
    const result = await contractorService.getListDocumentType()
    this.listDocumentType = result
  }
  @action
  async getListStatus() {
    const result = await contractorService.getListStatus()
    this.listStatus = result
  }

  @action
  async getAllContractorActivity(params: any) {
    const result = await contractorService.getAllContractorActivity(params)
    this.listContractorWO = result
  }
  async getContractorActivity(id) {
    const result = await contractorService.getContractorActivity(id)
    this.editContractorActivity = result
  }
  @action
  async createContact(contractorId?) {
    this.editContact = {
      contactEmail: undefined,
      contactName: undefined,
      contactPhone: undefined,
      contractorId,
      remark: undefined,
      subject: undefined,
      isActive: true
    }
  }
  @action
  async createContractorActivity(body: any) {
    this.isLoading = true
    this.editContractor = await contractorService.createContractorActivity(body).finally(() => (this.isLoading = false))
  }
  @action
  async updateContractorActivity(body: any) {
    this.isLoading = true
    this.editContractor = await contractorService.updateContractorActivity(body).finally(() => (this.isLoading = false))
  }

  @action
  async getContactByContractor(params: any) {
    const result = await contractorService.getContactByContractor(params)
    this.listContactByContractor = result
  }
  @action
  async getContact(params: any) {
    const result = await contractorService.getContact(params)
    this.editContact = result
  }
  @action
  async updateContact(body: any) {
    this.isLoading = true
    this.editContractor = await contractorService.updateContact(body).finally(() => (this.isLoading = false))
  }

  @action
  async GetStatusActivityByContractor(params: any) {
    const result = await contractorService.GetStatusActivityByContractor(params)
    this.approvalHistory = result
  }

  @action
  async exportWorkOrders(params: any) {
    this.isLoading = true
    return await contractorService.exportWorkOrder(params).finally(() => (this.isLoading = false))
  }

  @action
  async importFromExcel(file) {
    return await contractorService.importFromExcel(file)
  }
  @action
  async downloadTemplate() {
    return contractorService.downloadTemplate()
  }
}

export default ContractorStore
