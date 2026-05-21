import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { LNotification } from '@lib/abpUtility'
import { notifySuccess } from '@lib/helper'
import { InventoryModel } from '@models/Inventory'

class InventoryLocationService {
  public async create(body: any) {
    const res = await http.post('api/services/app/InventoryLocationManagement/Add', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return InventoryModel.assign(res.data.result)
  }

  public async update(body: any) {
    const res = await http.put('api/services/app/InventoryLocationManagement/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return InventoryModel.assign(res.data.result)
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/InventoryLocationManagement/Active', {}, { params: { id, isActive } })
    return res.data
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/InventoryLocationManagement/Filter', { params })
    const { result } = res.data
    result.items = InventoryModel.assigns(result.items)
    return result
  }

  public async filterOptions(params: any): Promise<Array<any>> {
    const result = await http.get('api/services/app/InventoryLocationManagement/Filter', { params })
    return (result.data?.result?.items || []).map(({ id, name }) => ({
      id,
      name,
      value: id,
      label: name
    }))
  }
}

export default new InventoryLocationService()
