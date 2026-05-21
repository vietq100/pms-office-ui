import { EntityDto } from '../dto/entityDto'
import { PagedPriorityResultRequestDto } from './dto/PagedResultRequestDto'
import http from '../httpService'
import { mapMultiLanguageField, notifySuccess } from '../../lib/helper'
import { LCategory, LNotification } from '../../lib/abpUtility'

class WfPriorityService {
  public async create(createStatusInput) {
    const res = await http.post('api/services/app/WorkflowPriority/Create', createStatusInput)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async update(updateStatusInput) {
    const res = await http.put('api/services/app/WorkflowPriority/Update', updateStatusInput)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async delete(entityDto: EntityDto) {
    const res = await http.delete('api/services/app/WorkflowPriority/Delete', {
      params: entityDto
    })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/WorkflowPriority/Active', null, { params: { id, isActive } })
    return res.data
  }

  public async changeStatus(changeStatusInput) {
    const res = await http.post('api/services/app/WorkflowPriority/ChangeLanguage', changeStatusInput)
    return res.data
  }

  public async get(params): Promise<any> {
    const res = await http.get('api/services/app/WorkflowPriority/Get', {
      params
    })
    const result = res.data.result
    if (result.names) {
      result.names = mapMultiLanguageField(result.names)
    }
    result.moduleIds = (result.modules || []).map((item) => item.id)
    return result
  }

  public async filter(pagedFilterAndSortedRequest: PagedPriorityResultRequestDto): Promise<any> {
    const res = await http.get('api/services/app/WorkflowPriority/GetAll', {
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
  public async filterWithoutType(params: any): Promise<any> {
    const res = await http.get('api/services/app/WorkflowPriority/GetAll', {
      params
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
    const result = await http.get('api/services/app/WorkflowPriority/GetList', {
      params
    })
    return result.data.result
  }

  public async updateSortList(ids) {
    await http.post('api/services/app/WorkflowPriority/Sort', ids)
  }
}

export default new WfPriorityService()
