import { EntityDto } from '../dto/entityDto'
import http from '../httpService'
import { mapMultiLanguageField, notifySuccess } from '../../lib/helper'
import { LCategory, LNotification } from '../../lib/abpUtility'

class WfTrackerService {
  public async create(createStatusInput) {
    const res = await http.post('api/services/app/WorkflowTracker/Create', createStatusInput)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async update(updateStatusInput) {
    const res = await http.put('api/services/app/WorkflowTracker/Update', updateStatusInput)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async delete(entityDto: EntityDto) {
    const res = await http.delete('api/services/app/WorkflowTracker/Delete', {
      params: entityDto
    })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/WorkflowTracker/Active', null, { params: { id, isActive } })
    return res.data
  }

  public async changeStatus(changeStatusInput) {
    const res = await http.post('api/services/app/WorkflowTracker/ChangeLanguage', changeStatusInput)
    return res.data
  }

  public async get(params): Promise<any> {
    const res = await http.get('api/services/app/WorkflowTracker/Get', {
      params
    })
    const result = res.data.result
    if (result.names) {
      result.names = mapMultiLanguageField(result.names)
    }

    result.moduleIds = (result.modules || []).map((item) => item.id)
    return result
  }

  public async filter(pagedFilterAndSortedRequest): Promise<any> {
    const res = await http.get('api/services/app/WorkflowTracker/GetAll', {
      params: pagedFilterAndSortedRequest
    })
    const result = res.data.result
    ;(result.items || []).forEach((item) =>
      item.modules.map((module) => {
        module.name = LCategory(module.key)
        return module
      })
    )
    return result
  }

  public async getList(params): Promise<any> {
    const result = await http.get('api/services/app/WorkflowTracker/GetList', {
      params
    })
    return result.data.result
  }

  public async updateSortList(ids) {
    await http.post('api/services/app/WorkflowTracker/Sort', ids)
  }
}

export default new WfTrackerService()
