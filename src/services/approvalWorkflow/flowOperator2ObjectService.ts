import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../lib/helper'
import {
  Company2ObjectModel,
  Operator2ObjectModel,
  RowOperator2ObjectModel
} from '@models/approvalWorkflow/flowOperator2Object/operator2ObjectModel'

class flowOperator2ObjectService {
  public async create(body: any) {
    await http.post('api/services/app/RequestConfig/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  public async update(body: any) {
    await http.put('api/services/app/RequestConfig/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  public async updateSimpleRequestConfig(body: any) {
    const res = await http.put('api/services/app/RequestConfig/UpdateSimpleRequestConfig', body)

    return res.data.result
  }

  public async updateOperatorConfig(body: any) {
    await http.post('api/services/app/RequestConfig/updateOperatorConfig', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/RequestConfig/Active', { id, isActive })
    return res.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/RequestConfig/Get', {
      params: { id }
    })
    const result = Operator2ObjectModel.assign(res.data.result)
    return result
  }

  public async getDetailRequestConfigTenant(params): Promise<any> {
    if (!params?.companyId || !params?.requestConfigId) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/RequestConfig/GetDetailRequestConfigTenant', {
      params
    })
    const result = Company2ObjectModel.assign(res.data.result)
    return result
  }

  public async getDetailRequestConfigDeveloper(params): Promise<any> {
    if (!params?.companyId || !params?.requestConfigId) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/RequestConfig/GetDetailRequestConfigDeveloper', {
      params
    })
    const result = Company2ObjectModel.assign(res.data.result)
    return result
  }

  public async getOperatorConfig(id: number): Promise<any> {
    const res = await http.get('api/services/app/RequestConfig/GetSimpleRequestConfig', {
      params: { id }
    })
    const result = res.data.result
    return result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/RequestConfig/GetAll', {
      params
    })
    const { result } = res.data
    result.items = RowOperator2ObjectModel.assigns(result.items)
    return result
  }

  public async getAllRequestConfigCompany(params: any): Promise<any> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/RequestConfig/GetAllRequestConfigTenant', {
      params
    })

    return res.data.result
  }

  public async getAllRequestConfigDeveloper(params: any): Promise<any> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/RequestConfig/GetAllRequestConfigDeveloper', {
      params
    })

    return res.data.result
  }

  public async generateRequestConfig(body: any) {
    await http.post('api/services/app/RequestConfig/GenerateRequestConfig', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }
}

export default new flowOperator2ObjectService()
