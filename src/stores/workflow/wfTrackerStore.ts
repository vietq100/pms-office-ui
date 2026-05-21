import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import type { Tracker } from '../../services/workflow/dto/tracker'
import wfTrackerService from '../../services/workflow/wfTrackerService'
import { initMultiLanguageField } from '../../lib/helper'

class WfTrackerStore {
  @observable isLoading!: boolean
  @observable wfTracker!: PagedResultDto<Tracker>
  @observable editWfTracker!: Tracker
  constructor() {
    makeObservable(this)
  }
  @action
  async create(createWfTrackerInput) {
    const result = await wfTrackerService.create(createWfTrackerInput)
    this.wfTracker.items.push(result)
  }

  @action
  async update(updateWfTrackerInput) {
    await wfTrackerService.update(updateWfTrackerInput)
    this.wfTracker.items = this.wfTracker.items.map((x) => {
      if (x.id === updateWfTrackerInput.id) x = updateWfTrackerInput
      return x
    })
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await wfTrackerService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id) {
    this.editWfTracker = await wfTrackerService.get({ id })
  }

  @action
  async createWfTracker() {
    this.editWfTracker = {
      id: 0,
      names: initMultiLanguageField(),
      isActive: true
    }
  }

  @action
  async getAll(pagedFilterAndSortedRequest: any) {
    this.isLoading = true
    this.wfTracker = await wfTrackerService.filter(pagedFilterAndSortedRequest).finally(() => (this.isLoading = false))
  }

  @action
  async updateSortList(ids: number[]) {
    await wfTrackerService.updateSortList(ids)
  }
}

export default WfTrackerStore
