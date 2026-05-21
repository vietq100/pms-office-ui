import { PagedCustomFieldResultRequestDto } from './dto/PagedResultRequestDto'
import http from '../httpService'
import { notifySuccess } from '../../lib/helper'
import { LCategory, LNotification } from '../../lib/abpUtility'

class WfCustomFieldService {
  public async create(createStatusInput) {
    const res = await http.post('api/services/app/WorkflowCustomField/Create', createStatusInput)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async update(updateStatusInput) {
    const res = await http.put('api/services/app/WorkflowCustomField/Update', updateStatusInput)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async delete(params) {
    const res = await http.delete('api/services/app/WorkflowCustomField/Delete', { params })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/WorkflowCustomField/Active', null, { params: { id, isActive } })
    return res.data
  }

  public async changeStatus(changeStatusInput) {
    const res = await http.post('api/services/app/WorkflowCustomField/ChangeWorkflowCustomField', changeStatusInput)
    return res.data
  }

  public async get(params): Promise<any> {
    const res = await http.get('api/services/app/WorkflowCustomField/Get', {
      params
    })
    const result = res.data.result
    if (result.possibleValues && result.possibleValues.length) {
      result.possibleValues = result.possibleValues.join(';')
    }

    result.moduleIds = (result.modules || []).map((item) => item.id)
    return result
  }

  public async getAll(pagedFilterAndSortedRequest: PagedCustomFieldResultRequestDto): Promise<any> {
    const res = await http.get('api/services/app/WorkflowCustomField/GetAll', {
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
}

export default new WfCustomFieldService()
