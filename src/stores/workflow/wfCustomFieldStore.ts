import { action, makeObservable, observable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import type { CustomField } from '../../services/workflow/dto/customField'
import wfCustomFieldService from '../../services/workflow/wfCustomFieldService'
import { initMultiLanguageField } from '../../lib/helper'

class WfCustomFieldStore {
  @observable isLoading!: boolean
  @observable wfCustomField!: PagedResultDto<CustomField>
  @observable editWfCustomField!: CustomField

  constructor() {
    makeObservable(this)
  }
  @action
  async create(createWfCustomFieldInput) {
    const result = await wfCustomFieldService.create(createWfCustomFieldInput)
    this.wfCustomField.items.push(result)
  }

  @action
  async update(updateWfCustomFieldInput: CustomField) {
    if (updateWfCustomFieldInput.possibleValues && updateWfCustomFieldInput.possibleValues.length) {
      updateWfCustomFieldInput.possibleValues = updateWfCustomFieldInput.possibleValues.split(';')
    }
    await wfCustomFieldService.update(updateWfCustomFieldInput)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await wfCustomFieldService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id) {
    this.editWfCustomField = await wfCustomFieldService.get({ id })
  }

  @action
  async createWfCustomField() {
    this.editWfCustomField = {
      id: 0,
      names: initMultiLanguageField(),
      descriptions: initMultiLanguageField(),
      isActive: true
    }
  }

  @action
  async getAll(pagedFilterAndSortedRequest: any) {
    this.isLoading = true
    this.wfCustomField = await wfCustomFieldService
      .getAll(pagedFilterAndSortedRequest)
      .finally(() => (this.isLoading = false))
  }
}

export default WfCustomFieldStore
