import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import companyService from '../../services/project/companyService'
import fileService from '../../services/common/fileService'
import AppConsts, { moduleFile } from '../../lib/appconst'
import { CompanyOptionModel, SyncHistoryModel } from '@models/Project/Company/CompanyModel'
const { companyType } = AppConsts

class CompanyStore {
  @observable isLoading!: boolean
  @observable isSyncing!: boolean
  @observable companies!: PagedResultDto<any>
  @observable companiesService!: PagedResultDto<any>
  @observable companyTypes!: any[]
  @observable companyOptions!: CompanyOptionModel[]
  @observable editCompany!: any
  @observable listAllCompany!: CompanyOptionModel[]
  @observable syncHistory!: SyncHistoryModel[]

  constructor() {
    this.companies = { items: [], totalCount: 0 }
    this.companiesService = { items: [], totalCount: 0 }
    this.editCompany = { workflow: {} }
    this.syncHistory = []
    makeObservable(this)
  }

  @action
  async create(body: any, files) {
    this.isLoading = true
    this.editCompany = await companyService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { documentFileId } = this.editCompany
    if (files && files.length && documentFileId) {
      await fileService.upload(moduleFile.companies, documentFileId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(updateCompanyInput: any, files) {
    this.isLoading = true
    await companyService.update(updateCompanyInput).finally(async () => {
      const { documentFileId } = this.editCompany
      this.isLoading = !!(files && files.length && documentFileId)
      if (files && files.length && documentFileId) {
        await fileService.upload(moduleFile.companies, documentFileId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async delete(id: number) {
    await companyService.delete(id)
    this.companies.items = this.companies.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await companyService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await companyService.get(id)
    this.editCompany = result
  }

  @action
  async getCompanyTypes() {
    const result = await companyService.getCompanyTypes()
    this.companyTypes = result
  }

  @action
  async createCompany() {
    this.editCompany = {
      id: 0,
      isActive: true
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    params.companyTypeId = companyType.tenant // tenant
    this.companies = await companyService.getAll(params).finally(() => (this.isLoading = false))
  }
  @action
  async getAllCompanyService(params: any) {
    this.isLoading = true
    params.companyTypeId = 2 // service

    const result = await companyService.getAll(params).finally(() => (this.isLoading = false))
    this.companiesService = result
  }
  @action
  async filterOptions(params: any) {
    params.maxResultCount = 1000
    params.isActive = true
    const result = await companyService.getAll(params)
    this.companyOptions = CompanyOptionModel.assigns(result.items || [])
  }

  @action
  async getAllMyCompany(params: any) {
    this.isLoading = true
    const result = await companyService.getAllMyCompany(params).finally(() => (this.isLoading = false))
    this.companies = result
  }

  @action
  async exportCompanys(params: any) {
    this.isLoading = true
    return await companyService.exportCompany(params).finally(() => (this.isLoading = false))
  }

  @action
  async getListAllCompany() {
    const result = await companyService.getListCompany()
    this.listAllCompany = result
  }

  @action
  async syncToSap(id: number) {
    this.isSyncing = true
    const result = await companyService.syncToSap(id).finally(() => (this.isSyncing = false))
    return result
  }

  @action
  async getSyncHistory(id: number) {
    this.syncHistory = await companyService.getSyncHistory(id)
  }
}

export default CompanyStore
