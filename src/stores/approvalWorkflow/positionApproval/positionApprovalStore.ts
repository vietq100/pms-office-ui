import { action, observable, makeObservable } from 'mobx'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import approvalWorkflowService from '@services/approvalWorkflow/approvalWorkflowService'

class PositionApprovalStore {
  @observable isLoading!: boolean
  @observable positionApprovals!: PagedResultDto<any>
  @observable editPositionApproval!: any

  constructor() {
    this.positionApprovals = { items: [], totalCount: 0 }
    this.editPositionApproval = {}
    makeObservable(this)
  }

  @action
  async initPositionApproval() {
    this.editPositionApproval = {
      id: 0,
      isActive: true
    }
  }

  @action
  async create(body: any) {
    this.isLoading = true
    this.editPositionApproval = await approvalWorkflowService.create(body).finally(() => (this.isLoading = false))
  }

  @action
  async update(updateCompanyInput: any) {
    this.isLoading = true
    await approvalWorkflowService.update(updateCompanyInput).finally(() => (this.isLoading = false))
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await approvalWorkflowService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await approvalWorkflowService.get(id)
    this.editPositionApproval = result
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await approvalWorkflowService.getAll(params).finally(() => (this.isLoading = false))
    this.positionApprovals = result
  }
}

export default PositionApprovalStore
