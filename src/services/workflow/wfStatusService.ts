import { EntityDto } from '../dto/entityDto'
import { PagedStatusResultRequestDto } from './dto/PagedResultRequestDto'
import http from '../httpService'
import { mapMultiLanguageField, notifySuccess, renderDateTime } from '../../lib/helper'
import { LCategory, LNotification } from '../../lib/abpUtility'
import { downloadFile } from '@lib/helperFile'
import dayjs from 'dayjs'

class WfStatusService {
  public async create(createStatusInput) {
    const res = await http.post('api/services/app/WorkflowStatus/Create', createStatusInput)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async update(updateStatusInput) {
    const res = await http.put('api/services/app/WorkflowStatus/Update', updateStatusInput)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async delete(entityDto: EntityDto) {
    const res = await http.delete('api/services/app/WorkflowStatus/Delete', {
      params: entityDto
    })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/WorkflowStatus/Active', null, { params: { id, isActive } })
    return res.data
  }

  public async changeStatus(changeStatusInput) {
    const res = await http.post('api/services/app/WorkflowStatus/ChangeLanguage', changeStatusInput)
    return res.data
  }

  public async get(params): Promise<any> {
    const res = await http.get('api/services/app/WorkflowStatus/Get', {
      params
    })
    const result = res.data.result
    if (result.names) {
      result.names = mapMultiLanguageField(result.names)
    }
    result.moduleIds = (result.modules || []).map((item) => item.id)
    return result
  }

  public async filter(pagedFilterAndSortedRequest: PagedStatusResultRequestDto): Promise<any> {
    const res = await http.get('api/services/app/WorkflowStatus/GetAll', {
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
    const result = await http.get('api/services/app/WorkflowStatus/GetList', {
      params
    })
    return result.data.result
  }

  public async getNextStatus(params): Promise<any> {
    const res = await http.get('api/services/app/Workflow/GetNextStatus', {
      params
    })
    return res.data.result || []
  }
  public async getSettingEscalation(moduleId) {
    const result = await http.get(
      `api/services/app/SettingEscalation/GetEscalationSetting?escalationModule=${moduleId}`
    )
    return result.data.result
  }

  public async saveSettingEscalation(body) {
    await http.post('/api/services/app/SettingEscalation/SetEscalationSetting', body)
  }

  // public async getEscalateDashboard(moduleId): Promise<any> {
  //   return await (await http.get(`api/services/app/Escalations/GetEscalateDashboard?module=${moduleId}`)).data.result
  // }

  public async getEscalateDashboard(params) {
    return (
      await http.get('api/services/app/Escalations/GetEscalateDashboard', {
        params
      })
    ).data.result
  }
  public async getEscalateViolates(params) {
    return (
      await http.get('api/services/app/Escalations/GetEscalateViolates', {
        params
      })
    ).data.result
  }

  public async exportEscalate(params) {
    const response = await http.get('/api/EscalateExport/ExportEscalateViolate', { responseType: 'blob', params })
    downloadFile(response.data, `EscalateViolate_${renderDateTime(dayjs())}.xlsx`)
  }

  public async updateSortList(ids) {
    await http.post('api/services/app/WorkflowStatus/Sort', ids)
  }
}

export default new WfStatusService()
