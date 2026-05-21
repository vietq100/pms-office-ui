import { action, observable, makeObservable } from 'mobx'

import { ReminderModel } from '@models/common/reminderModel'
import reminderService from '@services/common/reminderService'

class ReminderStore {
  @observable isLoading!: boolean
  @observable module: number
  @observable parentId?: number
  @observable editReminder: ReminderModel

  constructor() {
    makeObservable(this)
    this.editReminder = new ReminderModel()
    this.module = 0
    this.parentId = 0
  }

  @action
  public setReminderInfo(module, parentId) {
    this.module = module
    if (parentId) {
      this.parentId = parentId
    }
  }

  @action
  public setReminder(key, value) {
    this.editReminder = {
      ...this.editReminder,
      [key]: value
    }
  }

  @action
  public resetReminder() {
    this.editReminder = new ReminderModel()
    this.parentId = 0
    this.module = 0
  }

  @action
  async getReminder(module, parentId) {
    this.isLoading = true
    this.editReminder = await reminderService
      .getReminder({
        module: this.module || module,
        parentId: this.parentId || parentId
      })
      .finally(() => (this.isLoading = false))
  }

  @action
  async updateReminder(module, parentId, timeUnit: string, isSilent?: boolean) {
    if (!isSilent) {
      this.isLoading = true
    }
    const params = {
      ...this.editReminder,
      moduleId: this.module || module,
      parentId: this.parentId || parentId
    }

    this.editReminder = await reminderService.updateReminder(params).finally(() => {
      if (!isSilent) {
        this.isLoading = false
      }
    })
  }
}

export default ReminderStore
