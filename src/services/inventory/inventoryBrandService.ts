import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { LNotification } from '@lib/abpUtility'
import { notifySuccess } from '@lib/helper'
import { InventoryModel } from '@models/Inventory'

class InventoryBrandService {
  public async create(body: any) {
    const res = await http.post('api/services/app/InventoryBrandManagement/AddBrand', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return InventoryModel.assign(res.data.result)
  }

  public async update(body: any) {
    const res = await http.put('api/services/app/InventoryBrandManagement/UpdateInventoryBrand', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return InventoryModel.assign(res.data.result)
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post(
      'api/services/app/InventoryBrandManagement/ActiveInventoryBrand',
      {},
      { params: { id, isActive } }
    )
    return res.data
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/InventoryBrandManagement/GetBrands', { params })
    const { result } = res.data
    result.items = InventoryModel.assigns(result.items)
    return result
  }

  public async filterOptions(params: any): Promise<Array<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/InventoryBrandManagement/GetBrands', { params })
    return (res.data?.result?.items || []).map((item) => ({
      id: item.id,
      name: item.name,
      value: item.id,
      label: item.name
    }))
  }
}

export default new InventoryBrandService()
