import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../lib/helper'
import {
  RowContractCategoryModel,
  ContractCategoryModel
} from '../../models/Project/ContractCategory/ContractCategoryModel'

class ContractCategoryService {
  public async create(body: any) {
    const res = await http.post('api/services/app/ContractCategory/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return ContractCategoryModel.assign(res.data.result)
  }

  public async update(body: any) {
    const res = await http.post('api/services/app/ContractCategory/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return ContractCategoryModel.assign(res.data.result)
  }

  public async delete(id: number) {
    const res = await http.post('api/services/app/ContractCategory/Delete', null, { params: { id } })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.put('api/services/app/ContractCategory/Active', {}, { params: { id, isActive } })
    return res.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/ContractCategory/Detail', {
      params: { id }
    })
    const result = ContractCategoryModel.assign(res.data.result)
    return result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/ContractCategory/Filter', {
      params
    })
    const { result } = res.data
    result.items = RowContractCategoryModel.assigns(result.items)
    return result
  }

  public async filterOptions(params: any): Promise<any[]> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/ContractCategory/Filter', {
      params
    })
    const { result } = res.data
    return RowContractCategoryModel.assigns(result.items)
  }
}

export default new ContractCategoryService()
