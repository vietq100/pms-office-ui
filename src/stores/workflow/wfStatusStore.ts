import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import type { Status } from '../../services/workflow/dto/status'
import wfStatusService from '../../services/workflow/wfStatusService'
import { initMultiLanguageField } from '../../lib/helper'

class WfStatusStore {
  @observable isLoading!: boolean
  @observable wfStatus!: PagedResultDto<Status>
  @observable editWfStatus!: Status
  constructor() {
    makeObservable(this)
  }
  @action
  async create(createWfStatusInput) {
    this.isLoading = true
    await wfStatusService.create(createWfStatusInput).finally(() => (this.isLoading = false))
  }

  @action
  async update(updateWfStatusInput) {
    this.isLoading = true
    await wfStatusService.update(updateWfStatusInput).finally(() => (this.isLoading = false))
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await wfStatusService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id) {
    this.editWfStatus = await wfStatusService.get({ id })
  }

  @action
  async createWfStatus() {
    this.editWfStatus = {
      id: 0,
      names: initMultiLanguageField(),
      isActive: true
    }
  }

  @action
  async filter(pagedFilterAndSortedRequest: any) {
    this.wfStatus = await wfStatusService.filter(pagedFilterAndSortedRequest)
  }

  @action
  async updateSortList(ids: number[]) {
    await wfStatusService.updateSortList(ids)
  }
}

export default WfStatusStore
