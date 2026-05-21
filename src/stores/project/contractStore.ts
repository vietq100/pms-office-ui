import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import contractService from '../../services/project/contractService'
import fileService from '../../services/common/fileService'
import { moduleFile } from '../../lib/appconst'
import { ContractOptionModel } from '@models/Project/Contract/ContractModel'

class ContractStore {
  @observable isLoading!: boolean
  @observable companies!: PagedResultDto<any>
  @observable representativeList!: any[]
  @observable editContract!: any
  @observable contractOptions!: any
  @observable contractOverview: any[] = []

  constructor() {
    this.companies = { items: [], totalCount: 0 }
    this.editContract = { workflow: {} }
    makeObservable(this)
  }
  @action async getOverview(params) {
    this.isLoading = true
    this.contractOverview = await contractService.getOverview(params).finally(() => (this.isLoading = false))
  }
  @action
  async create(body: any, files) {
    this.isLoading = true
    this.editContract = await contractService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { documentFileId } = this.editContract
    if (files && files.length && documentFileId) {
      await fileService.upload(moduleFile.contracts, documentFileId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(updateContractInput: any, files) {
    this.isLoading = true
    await contractService.update(updateContractInput).finally(async () => {
      const { documentFileId } = this.editContract
      this.isLoading = !!(files && files.length && documentFileId)
      if (files && files.length && documentFileId) {
        await fileService.upload(moduleFile.contracts, documentFileId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async delete(id: number) {
    await contractService.delete(id)
    this.companies.items = this.companies.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await contractService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await contractService.get(id)
    this.editContract = result
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

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await contractService.getAll(params).finally(() => (this.isLoading = false))
    this.companies = result
  }

  @action
  async getAllMyContract(params: any) {
    this.isLoading = true
    const result = await contractService.getAllMyContract(params).finally(() => (this.isLoading = false))
    this.companies = result
  }

  @action
  async exportContracts(params: any) {
    this.isLoading = true
    return await contractService.exportContract(params).finally(() => (this.isLoading = false))
  }

  @action
  async filterContractOptions(params: any) {
    params.maxResultCount = 1000
    params.isActive = true
    params.sorting = 'Name ASC'
    const result = await contractService.getAll(params)
    this.contractOptions = ContractOptionModel.assigns(result.items || [])
  }
}

export default ContractStore
