import { action, observable, makeObservable } from 'mobx'
import wfConfigurationService from '../../services/workflow/wfConfigurationService'
import { PropertyConfigurationModel } from '../../models/Workflow/ConfigurationModels'

class WfConfigurationStore {
  @observable isLoading!: boolean
  @observable wfPropertyConfig: PropertyConfigurationModel
  @observable wfCustomFieldConfig: any
  @observable wfStatusTransition: any

  constructor() {
    this.wfPropertyConfig = new PropertyConfigurationModel()
    this.wfCustomFieldConfig = []
    this.wfStatusTransition = []
    makeObservable(this)
  }

  @action
  async updatePropertyConfig(body) {
    const result = await wfConfigurationService.updatePropertyConfig(body)
    this.wfPropertyConfig = result
  }

  @action
  async updateCustomFieldConfig(body) {
    const result = await wfConfigurationService.updateCustomFieldConfig(body)
    this.wfCustomFieldConfig = result
  }

  @action
  async updateStatusTransition(body) {
    const result = await wfConfigurationService.updateStatusTransition(body)
    this.wfCustomFieldConfig = result
  }

  @action
  async getPropertyConfig(params) {
    this.isLoading = true
    this.wfPropertyConfig = await wfConfigurationService.getPropertyConfig(params)
    this.isLoading = false
  }

  @action
  async getCustomFieldConfig(params) {
    this.isLoading = true
    this.wfCustomFieldConfig = await wfConfigurationService.getCustomFieldConfig(params)
    this.isLoading = false
  }

  @action
  async getStatusTransition(params) {
    this.isLoading = true
    this.wfStatusTransition = await wfConfigurationService.getStatusTransition(params)
    this.isLoading = false
  }
}

export default WfConfigurationStore
