import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L } from '@lib/abpUtility'
import { notifyError } from '@lib/helper'
import { AssetTypeModel } from '../../models/asset/AssetTypeModel'

class AssetTypeService {
  public async create(body: AssetTypeModel) {
    return http.post('api/services/app/AssetManagement/AddAssetType', body)
  }

  public async update(body: any) {
    const response = await http.put('api/services/app/AssetManagement/UpdateAssetType', body)
    return response
  }

  public async activateOrDeactivate(id: number, isActive) {
    return http.post(
      'api/services/app/AssetManagement/ActiveAssetType',
      {},
      {
        params: { id, isActive }
      }
    )
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const result = await http.get('Events/Get', {
      params: { id }
    })
    return result.data.result
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
    const {
      data: { result }
    } = await http.get('api/services/app/AssetManagement/GetAssetType', {
      params
    })
    result.items = AssetTypeModel.assigns(result.items || [])
    return result
  }

  public async filterOptions(params: any): Promise<any> {
    const result = await http.get('api/services/app/AssetManagement/GetAssetType', { params })
    return (result.data?.result?.items || []).map((item) => ({
      id: item.id,
      name: item.name || item.assetTypeName,
      value: item.id,
      label: item.name || item.assetTypeName,
      code: item.code
    }))
  }
}

export default new AssetTypeService()
