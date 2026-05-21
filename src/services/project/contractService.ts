import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess, renderDateTime } from '../../lib/helper'
import { RowContractModel, ContractModel } from '../../models/Project/Contract/ContractModel'
import { downloadFile } from '@lib/helperFile'
import dayjs from 'dayjs'

class ContractService {
  public async create(body: any) {
    const res = await http.post('api/services/app/Contracts/CreateContract', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return ContractModel.assign(res.data.result)
  }

  public async update(body: any) {
    const res = await http.post('api/services/app/Contracts/EditContract', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return ContractModel.assign(res.data.result)
  }

  public async delete(id: number) {
    const res = await http.delete('api/services/app/Contracts/Delete', {
      params: { id }
    })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/Contracts/DeactiveContract', {}, { params: { id, isActive } })
    return res.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/Contracts/GetContract', {
      params: { id }
    })
    const result = ContractModel.assign(res.data.result)
    return result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/Contracts/FilterContracts', {
      params
    })
    const { result } = res.data
    result.items = RowContractModel.assigns(result.items)
    return result
  }

  public async getAllMyContract(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('api/services/app/Contracts/GetAllMyContract', {
      params
    })
    return res.data.result
  }

  public async exportContract(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportContract', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `Contract_${renderDateTime(dayjs())}.xlsx`)
  }
  public async getOverview(params) {
    const res = await http.get('api/services/app/Contracts/GetOverviewContract', {
      params
    })
    return res.data.result
  }
}

export default new ContractService()
