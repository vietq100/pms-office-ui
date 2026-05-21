import { action, observable, makeObservable } from 'mobx'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import flowOperator2ObjectService from '@services/approvalWorkflow/flowOperator2ObjectService'

class FlowApprovalOfficeStore {
  @observable isLoading!: boolean
  @observable oprator2Object!: PagedResultDto<any>
  @observable editoprator2Object!: any
  @observable operatorConfig!: any
  @observable companyConfig!: any
  @observable developerConfig!: any

  constructor() {
    this.oprator2Object = { items: [], totalCount: 0 }
    this.editoprator2Object = {}
    this.companyConfig = {}
    makeObservable(this)
  }

  @action
  async create(body: any) {
    this.isLoading = true
    await flowOperator2ObjectService.create(body).finally(() => (this.isLoading = false))
  }

  @action
  async update(updateCompanyInput: any) {
    this.isLoading = true
    await flowOperator2ObjectService.update(updateCompanyInput).finally(() => (this.isLoading = false))
  }

  @action
  async updateSimpleRequestConfig(updateCompanyInput: any) {
    this.isLoading = true
    const result = await flowOperator2ObjectService
      .updateSimpleRequestConfig(updateCompanyInput)
      .finally(() => (this.isLoading = false))

    this.operatorConfig = result?.operators
  }

  @action
  async updateOperatorConfig(body: any) {
    this.isLoading = true

    await flowOperator2ObjectService.updateOperatorConfig(body).finally(() => (this.isLoading = false))
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await flowOperator2ObjectService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await flowOperator2ObjectService.get(id)

    this.editoprator2Object = result
    this.operatorConfig = result?.operators
  }

  ge

  @action
  async getOperatorConfig(id: number) {
    const result = await flowOperator2ObjectService.getOperatorConfig(id)
    this.operatorConfig = result.operators
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await flowOperator2ObjectService.getAll(params).finally(() => (this.isLoading = false))
    this.oprator2Object = result
  }

  @action
  async generateRequestConfig(body: any) {
    this.isLoading = true
    await flowOperator2ObjectService.generateRequestConfig(body).finally(() => (this.isLoading = false))
  }

  @action
  async getDetailRequestConfigTenant(params: any) {
    const result = await flowOperator2ObjectService.getDetailRequestConfigTenant(params)

    this.companyConfig = result
  }

  @action
  async getDetailRequestConfigDeveloper(params: any) {
    const result = await flowOperator2ObjectService.getDetailRequestConfigDeveloper(params)

    this.developerConfig = result
  }
}

export default FlowApprovalOfficeStore
