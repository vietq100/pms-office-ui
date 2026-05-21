import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '@services/httpService'
import { notifySuccess, renderDateTime } from '@lib/helper'
import { LNotification } from '@lib/abpUtility'
import { L } from '@lib/abpUtility'
import { notifyError } from '@lib/helper'
import { AssetTypeModel } from '@models/asset/AssetTypeModel'
import { PMCountStatusModel } from '@models/PlanMaintenance/PMCountStatusModel'
import {
  PlanMaintenanceModel,
  PlanMaintenanceTaskModel,
  PlanMaintenanceEventModel
} from '@models/PlanMaintenance/PlanMaintenanceModel'
import { downloadFile } from '@lib/helperFile'
import dayjs from 'dayjs'

class PlanMaintenanceService {
  public async create(body: AssetTypeModel) {
    const result = await http.post('api/services/app/PlanMaintenance/AddPlanMaintenance', body)

    return result.data.result
  }

  public async update(body: any) {
    if (!body) {
      return
    }
    const result = await http.put('api/services/app/PlanMaintenance/UpdatePlanMaintenance', body)

    return result.data.result
  }

  public async activateOrDeactivate(id: number, isActive: boolean) {
    if (isActive) {
      return http.post('api/services/app/PlanMaintenance/Active', { id }, { params: { isActive } })
    }
    return http.delete('api/services/app/PlanMaintenance/RemovePlanMaintenance', { params: { id } })
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/PlanMaintenance/GetPlanMaintenanceDetail', {
      params: { id }
    })
    return PlanMaintenanceModel.assign(res.data.result)
  }

  public async getPlanMaintenanceOverview(params): Promise<any> {
    const res = await http.get('api/services/app/PlanMaintenance/GetPlanMaintenanceOverview', { params })
    return res.data.result
  }

  public async getCountStatus(params): Promise<any> {
    const result = await http.get('api/services/app/PlanMaintenance/GetCountStatus', { params })
    return PMCountStatusModel.assigns(result.data.result)
  }

  public async getForEdit(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const {
      data: { result }
    } = await http.get('Events/GetEventForEdit', {
      params: { id }
    })
    return result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/PlanMaintenance/GetPlanMaintenance', { params })
    const { result } = res.data
    result.items = PlanMaintenanceModel.assigns(result.items)
    return result
  }

  public async getAllMyPlan(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/PlanMaintenance/GetMyPlanMaintenance', { params })
    const { result } = res.data
    result.items = PlanMaintenanceModel.assigns(result.items)
    return result
  }

  public async getPriorityOptions(params: any): Promise<any> {
    const result = await http.get('api/services/app/PlanMaintenance/GetPriorities', { params })
    return AssetTypeModel.assigns(result.data?.result || [])
  }

  public async getStatusOptions(params: any): Promise<PagedResultDto<any>> {
    const result = await http.get('api/services/app/PlanMaintenance/GetStatus', { params })
    return (result.data?.result || []).map((item) => ({
      id: item.id,
      name: item.name,
      value: item.id,
      label: item.name,
      code: item.code,
      isDefault: item.isDefault,
      colorCode: item.colorCode,
      borderColorCode: item.borderColorCode
    }))
  }

  public async getAllTasks(params: any) {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('/api/services/app/PlanMaintenance/GetPlanMaintenanceTasks', { params })
    const { result } = res.data
    result.items = PlanMaintenanceTaskModel.assigns(result.items)
    return result
  }

  // public notify(newsId: number) {
  //   return this.api
  //     .post('api/services/app/Events/SendEventNotification', null, { params: { eventId: newsId } })
  //     .then(() => {
  //       notifySuccess(LNotification('SUCCESS'), LNotification(L('NEWS_NOTIFICATION_SENT')))
  //     })
  // }

  public async getPlanMaintenanceByAsset(params) {
    if (params.year) {
      params.fromDate = params.year ? dayjs(params.year, 'YYYY').startOf('year').toJSON() : null
      params.toDate = params.year ? dayjs(params.year, 'YYYY').endOf('year').toJSON() : null
      delete params.year
    }
    const {
      data: { result }
    } = await http.get('/api/services/app/PlanMaintenance/GetPlanMaintenanceByAsset', { params })
    return PlanMaintenanceEventModel.assigns(result)
  }

  public async getAllCalendar(params: any) {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    let {
      data: { result }
    } = await http.get('/api/services/app/PlanMaintenance/GetPlanMaintenanceCalendar', { params })
    if (result.length > 0) {
      result = PlanMaintenanceEventModel.assigns(result)
    }
    return result
  }

  public async updatePlanStatus(data: any) {
    const {
      data: { result }
    } = await http.put('/api/services/app/PlanMaintenance/UpdatePlanStatus', data)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result
  }
  public async getOverview(params: any): Promise<any> {
    const result = await http.get('api/services/app/PlanMaintenance/GetOverviewPlanMaintenance', {
      params
    })
    return result.data.result
  }

  public async downloadTemplate() {
    const response = await http.get('api/Imports/PlanMaintenance/GetTemplateImport', { responseType: 'blob' })
    downloadFile(response.data, 'TemplateImportPlanMaintenance.xlsx')
  }

  e
  public async importPlanmaintenace(file) {
    const data = new FormData()
    data.append('file', file)
    return await http.post('api/Imports/PlanMaintenance/ImportFromExcel', data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
  }

  public async exportPlanmaintenace(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportPlanMaintenance', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `PlanMaintenance_${renderDateTime(dayjs())}.xlsx`)
  }

  public async sendNotiMaintenancePlan(id: number) {
    await http.post(
      '/api/services/app/PlanMaintenance/SendNotiMaintenancePlan',
      {},
      {
        params: {
          id
        }
      }
    )
  }
}

export default new PlanMaintenanceService()
