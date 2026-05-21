import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '@services/httpService'
import { L } from '@lib/abpUtility'
import { notifyError } from '@lib/helper'
import { PlanSanitationModel } from '@models/planSanitation/PlanSanitationModel'
import { AssetTypeModel } from '@models/asset/AssetTypeModel'

class ServicePlanService {
  public async create(body: any) {
    const result = await http.post('api/services/app/ServicePlans/AddServicePlan', body)

    return result.data.result
  }

  public async update(body: any) {
    if (!body) {
      return
    }
    const result = await http.put('/api/services/app/ServicePlans/UpdateServicePlan', body)

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

    const res = await http.get('/api/services/app/ServicePlans/GetServicePlanDetail', {
      params: { id }
    })
    return PlanSanitationModel.assign(res.data.result)
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('/api/services/app/ServicePlans/GetServicePlan', { params })
    const { result } = res.data
    result.items = PlanSanitationModel.assigns(result.items)
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
}

export default new ServicePlanService()
