import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { LNotification, L } from '@lib/abpUtility'
import { notifySuccess, notifyError, renderDateTime } from '@lib/helper'
import { downloadFile } from '@lib/helperFile'
import { InventoryModel } from '@models/Inventory'
import { IInventoryItem, InventoryItemModel } from '@models/Inventory/InventoryItemModel'
import dayjs from 'dayjs'

class InventoryItemsService {
  public async create(body: IInventoryItem) {
    const res = await http.post('api/services/app/InventoryManagement/AddInventory', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return InventoryModel.assign(res.data.result)
  }

  public async update(body: any) {
    const res = await http.put('api/services/app/InventoryManagement/UpdateInventory', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return InventoryModel.assign(res.data.result)
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = isActive
      ? await http.post('api/services/app/InventoryManagement/ReActive', {}, { params: { id } })
      : await http.delete('api/services/app/InventoryManagement/RemoveInventory', { params: { id } })
    return res.data
  }

  public async get(inventoryId: number): Promise<any> {
    if (!inventoryId) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const result = await http.get('api/services/app/InventoryManagement/GetInventoryDetail', {
      params: { inventoryId }
    })
    return InventoryItemModel.assign(result.data.result)
  }

  public async getOverview(params: any): Promise<any> {
    const result = await http.get('api/services/app/InventoryManagement/GetInventoryOverview', {
      params
    })
    return result.data.result
  }

  public async getByCode(code: number): Promise<any> {
    if (!code) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const result = await http.get('api/services/app/InventoryManagement/GetInventoryByCode', {
      params: { code }
    })
    return result.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/InventoryManagement/GetInventories', { params })
    const { result } = res.data
    result.items = InventoryItemModel.assigns(result.items)
    return result
  }

  public async getInventoryHistories(params: number): Promise<any> {
    const result = await http.get('api/services/app/InventoryManagement/GetInventoryHistories', {
      params
    })
    return result.data.result
  }

  public async getAllocateHistories(params: number): Promise<any> {
    const result = await http.get('api/services/app/InventoryManagement/GetInventoryAllocateHistories', {
      params
    })
    return result.data.result
  }

  public async filterOptions(params: any): Promise<Array<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/InventoryManagement/GetInventories', { params })
    return (res.data?.result?.items || []).map((item) => ({
      id: item.id,
      name: item.name,
      value: item.id,
      label: item.name,
      data: item
    }))
  }

  public async exportExcel(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportInventories', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `Intory_management_${renderDateTime(dayjs())}.xlsx`)
  }
}

export default new InventoryItemsService()
