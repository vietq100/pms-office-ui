import type { PagedResultDto } from '../dto/pagedResultDto'
import sortBy from 'lodash/sortBy'
import http from '../httpService'
import { LNotification, L } from '@lib/abpUtility'
import { notifySuccess, notifyError } from '@lib/helper'
import { InventoryCategoryModel } from '@models/Inventory/InventoryCategoryModel'

class InventoryCategoryService {
  public async create(body: any) {
    const res = await http.post('api/services/app/InventoryCategoryManagement/AddCategory', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return InventoryCategoryModel.assign(res.data.result)
  }

  public async update(body: any) {
    const res = await http.put('api/services/app/InventoryCategoryManagement/UpdateCategory', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return InventoryCategoryModel.assign(res.data.result)
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const {
      data: { result }
    } = await http.get('api/services/app/InventoryCategoryManagement/GetCategoryDetail', {
      params: { id }
    })
    return InventoryCategoryModel.assign(result)
  }

  public async getChildren(parentId: number): Promise<any> {
    if (!parentId) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/InventoryCategoryManagement/GetCategory', {
      params: { parentId }
    })
    const { result } = res.data
    return InventoryCategoryModel.assigns(sortBy(result, ['sortOrder']))
  }

  public async remove(id: number) {
    const res = await http.delete('api/services/app/InventoryCategoryManagement/RemoveInventoryCategory', {
      params: { id }
    })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive: boolean) {
    const res = isActive
      ? await http.post('api/services/app/InventoryCategoryManagement/Active', {}, { params: { id, isActive } })
      : await http.delete('api/services/app/InventoryCategoryManagement/Delete', { params: { id } })
    return res.data
  }

  activateOrDeactivateV2 = async (body: any) => {
    await http.post('api/services/app/InventoryCategoryManagement/Active', { ...body })
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/InventoryCategoryManagement/GetCategories', { params })
    const { result } = res.data
    result.items = InventoryCategoryModel.assigns(result.items)
    return result
  }

  public async filterOptions(params: any): Promise<Array<any>> {
    const result = await http.get('api/services/app/InventoryCategoryManagement/GetCategories', { params })
    return (result.data?.result?.items || []).map((item) => ({
      id: item.id,
      name: item.name,
      value: item.id,
      label: item.name,
      code: item.code,
      sortOrder: item.sortOrder,
      childs: item.childs.map((subItem) => ({
        id: subItem.id,
        name: subItem.name,
        value: subItem.id,
        label: subItem.name,
        code: subItem.code,
        sortOrder: subItem.sortOrder
      }))
    }))
  }

  public async sort(body: any) {
    const res = await http.post('api/services/app/InventoryCategoryManagement/Sort', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data
  }
}

export default new InventoryCategoryService()
