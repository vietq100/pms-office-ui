import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess, renderDateTime } from '../../lib/helper'
import {
  RowCompanyModel,
  CompanyModel,
  CompanyTypeModel,
  CompanyOptionModel,
  SyncHistoryModel
} from '../../models/Project/Company/CompanyModel'
import { downloadFile } from '@lib/helperFile'
import dayjs from 'dayjs'

class companyService {
  public async create(body: any) {
    body.reasonForVisitId = 1
    const res = await http.post('api/services/app/Contracts/CreateCompany', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return CompanyModel.assign(res.data.result)
  }

  public async update(body: any) {
    const res = await http.post('api/services/app/Contracts/EditCompany', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return CompanyModel.assign(res.data.result)
  }

  public async delete(id: number) {
    const res = await http.delete('api/services/app/Contracts/Delete', {
      params: { id }
    })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/Contracts/ActiveCompany', {}, { params: { id, isActive } })
    return res.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/Contracts/GetCompany', {
      params: { id }
    })
    const result = CompanyModel.assign(res.data.result)
    return result
  }

  public async getCompanyTypes(): Promise<any> {
    const res = await http.get('api/services/app/Contracts/GetCompanyTypes')
    const result = CompanyTypeModel.assigns(res.data.result)
    return result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/Contracts/FilterCompanies', {
      params
    })
    const { result } = res.data
    result.items = RowCompanyModel.assigns(result.items)
    return result
  }

  public async getAllMyCompany(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('api/services/app/Contracts/GetAllMyCompany', {
      params
    })
    return res.data.result
  }

  public async exportCompany(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportCompany', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `Company_${renderDateTime(dayjs())}.xlsx`)
  }

  public async getUsers(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('api/services/app/Company/GetUsers', {
      params
    })
    const { result } = res.data

    return result
  }

  public async getListCompany(params?): Promise<any> {
    const res = await http.get('/api/services/app/Company/GetList', { params })

    return CompanyOptionModel.assigns(res.data.result)
  }

  public async syncToSap(
    id: number
  ): Promise<{ success: boolean; sapPartnerNumber: string | null; errorMessage: string | null }> {
    const res = await http.post('api/services/app/Company/SyncToSap', null, { params: { id } })
    return res.data.result
  }

  public async getSyncHistory(id: number): Promise<SyncHistoryModel[]> {
    const res = await http.get('api/services/app/Company/GetSyncHistory', { params: { id } })
    return SyncHistoryModel.assigns(res.data.result || [])
  }
}

export default new companyService()
