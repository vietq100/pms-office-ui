import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { LNotification, L } from '@lib/abpUtility'
import { notifySuccess, notifyError, renderDateTime } from '@lib/helper'
import { downloadFile } from '@lib/helperFile'
import {
  InventoryStockInModel,
  InventoryStockOutModel,
  IInventoryStockTypes
} from '@models/Inventory/InventoryItemModel'
import dayjs from 'dayjs'

class InventoryStockInOutService {
  public async createStockIn(body: any) {
    const res = await http.post('api/services/app/InventoryManagement/AddInventoryStock', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return InventoryStockInModel.assign(res.data.result)
  }

  public async createStockOut(body: any) {
    const res = await http.post('api/services/app/InventoryManagement/AddInventoryAllocate', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return InventoryStockOutModel.assign(res.data.result)
  }

  public async updateStockIn(body: any) {
    const res = await http.put('api/services/app/InventoryManagement/UpdateInventoryStock', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return InventoryStockInModel.assign(res.data.result)
  }

  public async updateStockOut(body: any) {
    const res = await http.put('api/services/app/InventoryManagement/UpdateInventoryAllocate', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return InventoryStockOutModel.assign(res.data.result)
  }

  public async activateOrDeactivate(id: number, isActive: boolean) {
    const res = isActive
      ? await http.post('api/services/app/InventoryManagement/ReActive', {}, { params: { id } })
      : await http.delete('api/services/app/InventoryManagement/RemoveInventoryAllocate', { params: { id } })
    return res.data
  }

  public async getStockIn(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const {
      data: { result }
    } = await http.get('api/services/app/InventoryManagement/GetInventoryStock', {
      params: { id }
    })
    return InventoryStockInModel.assign(result)
  }

  public async getStockOut(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const {
      data: { result }
    } = await http.get('api/services/app/InventoryManagement/GetInventoryAllocate', {
      params: { id }
    })
    return InventoryStockOutModel.assign(result)
  }

  public async getAll(type: IInventoryStockTypes, params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const url =
      type === IInventoryStockTypes.stockIn
        ? 'api/services/app/InventoryManagement/GetInventoryStocks'
        : 'api/services/app/InventoryManagement/GetInventoryAllocateHistories'

    const res = await http.get(url, { params })
    const { result } = res.data
    result.items =
      type === IInventoryStockTypes.stockIn
        ? InventoryStockInModel.assigns(result.items)
        : InventoryStockOutModel.assigns(result.items)
    return result
  }

  public async exportExcelStockIn(params: any): Promise<any> {
    const res = await http.get('/api/Export/ExportInventoryStocks', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `Stock_in_management_${renderDateTime(dayjs())}.xlsx`)
  }

  public async exportExcelStockOut(params: any): Promise<any> {
    const res = await http.get('/api/Export/ExportInventoryAllocateHistories', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `Stock_in_management_${renderDateTime(dayjs())}.xlsx`)
  }
}

export default new InventoryStockInOutService()
