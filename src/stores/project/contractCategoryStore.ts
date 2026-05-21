import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import contractCategoryService from '../../services/project/contractCategoryService'
import { ContractCategoryModel } from '@models/Project/ContractCategory/ContractCategoryModel'

class ContractCategoryStore {
  @observable isLoading!: boolean
  @observable companies!: PagedResultDto<any>
  @observable parents!: any[]
  @observable contractCategoryOptions!: any[]
  @observable editContractCategory!: any
  @observable editContractCategorySub!: any

  constructor() {
    this.companies = { items: [], totalCount: 0 }
    this.editContractCategory = { workflow: {} }
    makeObservable(this)
  }

  @action
  async create(body: any) {
    this.isLoading = true
    this.editContractCategory = await contractCategoryService.create(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async createContractCategorySub(body: any) {
    this.isLoading = true
    await contractCategoryService.create(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async update(updateContractTypeInput: any) {
    this.isLoading = true
    await contractCategoryService.update(updateContractTypeInput).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async delete(id: number) {
    await contractCategoryService.delete(id)
    this.companies.items = this.companies.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await contractCategoryService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await contractCategoryService.get(id)
    this.editContractCategory = result
  }

  @action
  async getContractCategorySub(id: number) {
    const result = await contractCategoryService.get(id)
    this.editContractCategorySub = result
  }

  @action
  async createContractCategory() {
    this.editContractCategory = new ContractCategoryModel()
  }

  @action
  async initContractCategorySub(parentId) {
    this.editContractCategorySub = new ContractCategoryModel(parentId)
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await contractCategoryService.getAll(params).finally(() => (this.isLoading = false))
    this.companies = result
  }

  @action
  async filterOptions(params: any) {
    params.maxResultCount = 1000
    params.isActive = true
    params.sorting = 'Name ASC'
    const result = await contractCategoryService.getAll(params)
    this.parents = result.items || []
  }

  @action
  async filterContractCategoryOptions(params: any) {
    params.maxResultCount = 1000
    params.isActive = true
    params.sorting = 'Name ASC'
    const result = await contractCategoryService.getAll(params)
    this.contractCategoryOptions = result.items || []
  }
}

export default ContractCategoryStore
