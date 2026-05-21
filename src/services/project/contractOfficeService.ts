import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../lib/helper'
import { ContractOfficeModel, RowContractOfficeModel } from '@models/Project/ContractOffice/ContractOficeModel'

class ContractOfficeService {
  public async createOrUpdate(body: any, notify = true) {
    const res = await http.post('/api/services/app/LeaseAgreement/CreateOrUpdate', body)
    notify && notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return ContractOfficeModel.assign(res.data.result)
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/LeaseAgreement/Active', { id, isActive })
    return res.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/LeaseAgreement/Get', {
      params: { id }
    })
    const result = ContractOfficeModel.assign(res.data.result)
    return result
  }
  public async getListLAStatus(params: any): Promise<any> {
    const res = await http.get('/api/services/app/LeaseAgreement/GetListLeaseAgreementStatus', {
      params
    })
    const { result } = res.data

    return result
  }
  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('/api/services/app/LeaseAgreement/GetAll', {
      params
    })
    const { result } = res.data
    result.items = RowContractOfficeModel.assigns(result.items)
    return result
  }

  public async createPaymentSchedule(params: any) {
    const res = await http.post('/api/services/app/LeaseAgreement/CreatePaymentSchedule', params)

    return res.data.result
  }
  public async getPaymentSchedule(params: any): Promise<any> {
    const res = await http.get('/api/services/app/LeaseAgreement/GetPaymentSchedule', {
      params
    })
    const { result } = res.data
    return result
  }
  public async updateStatusPaymentSchedule(body: any) {
    const res = await http.put('/api/services/app/LeaseAgreement/UpdateStatusPaymentSchedule', body)

    return res.data.result
  }
  public async syncToSap(id: number): Promise<any> {
    const res = await http.post('api/services/app/LeaseAgreement/SyncToSap', null, { params: { id } })
    return res.data.result
  }
  public async reSyncToSap(id: number): Promise<any> {
    const res = await http.put('api/services/app/LeaseAgreement/SyncUpdateContractToSap', null, { params: { id } })
    return res.data.result
  }
}

export default new ContractOfficeService()
