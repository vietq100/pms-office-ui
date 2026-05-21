import { action, observable, makeObservable } from 'mobx'

import { Status } from '../../services/workflow/dto/status'
import wfStatusService from '../../services/workflow/wfStatusService'
import { Priority } from '../../services/workflow/dto/priority'
import { Role } from '../../services/workflow/dto/role'
import wfPriorityService from '../../services/workflow/wfPriorityService'
import wfRoleService from '../../services/workflow/wfRoleService'
import wfTrackerService from '../../services/workflow/wfTrackerService'
import workflowService from '../../services/workflow/workflowService'
import { Tracker } from '../../services/workflow/dto/tracker'

class WorkflowStore {
  @observable wfStatus!: Status[]
  @observable wfPriorities!: Priority[]
  @observable wfRoles!: Role[]
  @observable wfTrackers!: Tracker[]
  @observable wfProperties!: any
  @observable wfCustomFields!: any

  constructor() {
    this.wfProperties = {}
    this.wfCustomFields = {}
    makeObservable(this)
  }

  @action
  async getListWfStatus(workflowId?, moduleId?) {
    if (workflowId) {
      const result = await wfStatusService.getNextStatus({
        id: workflowId,
        moduleId
      })
      this.wfStatus = result || []
      return
    }
    const result = await wfStatusService.getList({ moduleId, isActive: true })
    this.wfStatus = result || []
  }

  @action
  async getListWfPriority(moduleId?) {
    const result = await wfPriorityService.getList({ moduleId, isActive: true })
    this.wfPriorities = result || []
  }

  @action
  async getListWfRole(moduleId?) {
    const result = await wfRoleService.getList({ moduleId, isActive: true })
    this.wfRoles = result || []
  }

  @action
  async getListWfTracker(moduleId?) {
    const result = await wfTrackerService.getList({ moduleId, isActive: true })
    this.wfTrackers = result || []
  }

  @action
  async getWorkflowFields(moduleId, trackerId?) {
    const result = await workflowService.getWorkflowFields({
      moduleId,
      trackerId,
      isActive: true
    })
    await this.setWfCustomFields(result.customFields)
    // result.properties.push({isReadOnly: false,
    //   isRequired: false,
    //   isVisible: true,
    //   propertyName: "AssignedIds"})
    // result.properties.push({isReadOnly: false,
    //   isRequired: false,
    //   isVisible: true,
    //   propertyName: "WatcherIds"})
    await this.setWfProperties(result.properties)
    return result
  }

  @action
  async setWfProperties(properties) {
    this.wfProperties = (properties || []).reduce((objProperties, item) => {
      objProperties[item.propertyName] = { ...item }
      return objProperties
    }, {})
  }

  @action
  async setWfCustomFields(customFields) {
    this.wfCustomFields = (customFields || []).reduce((objCustomFields, item) => {
      objCustomFields[item.id] = { ...item }
      return objCustomFields
    }, {})
  }
}

export default WorkflowStore
