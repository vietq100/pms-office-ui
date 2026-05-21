import type { PagedResultDto } from '@services/dto/pagedResultDto'
import http from '../httpService'
import { FeeDetailModel, IFeeRefundModel, IFeeUpdate } from '@models/fee'
import { downloadFile } from '@lib/helperFile'
import { notifySuccess, renderDateTime } from '@lib/helper'
import { LNotification } from '@lib/abpUtility'
import dayjs from 'dayjs'

class FeeService {
  public async update(body: IFeeUpdate) {
    const result = await http.put('/api/services/app/FeeStatement/Update', body)
    return result.data.result
  }

  public activate(id: number, isActive) {
    return http.post(
      '/api/services/app/FeeStatement/Active',
      { id },
      {
        params: { isActive }
      }
    )
  }

  public deActivate(body) {
    return http.post('/api/services/app/FeeStatement/MarkInActive', body, {
      params: { isActive: false }
    })
  }

  public async refundReservationDeposit(body: IFeeRefundModel) {
    const result = await http.post('/api/services/app/FeeReceipt/RefundFeeStatement', body)
    return result.data.result
  }

  public async refundReceipt(body: IFeeRefundModel) {
    const result = await http.post('/api/services/app/FeeReceipt/RefundReceipt', body)
    return result.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('/api/services/app/FeeStatement/GetFeeDetails', {
      params
    })
    const result = res.data.result
    if (result.items) {
      result.items = FeeDetailModel.assigns(result.items)
    }
    return result
  }

  public async exportFees(params: any): Promise<any> {
    const res = await http.get('/api/FeeStatements/ExportFeeStatementDetail', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `FeeStatementDetail_${renderDateTime(dayjs())}.xlsx`)
  }

  public async downloadTemplate() {
    const response = await http.get('/api/Imports/FeeStatement/GetTemplateImport', { responseType: 'blob' })
    downloadFile(response.data, `FeeTemplateImport.xlsx`)
  }

  public async importFee(file, FeePackageId, description) {
    const data = new FormData()
    data.append('file', file)
    const json = { FeePackageId, description }
    data.append(`model`, JSON.stringify(json))
    return await http.post('/api/Imports/FeeStatement/ImportFromExcel', data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
  }

  public showHideToResident(data) {
    return http.put(
      '/api/services/app/FeeStatement/UpdateShowToResident',
      { id: data.id },
      { params: { isShowToResident: data.isShowToResident } }
    )
  }

  public async summary(params) {
    const res = await http.get('/api/services/app/FeeStatement/GetFeeDetailSummary', { params })
    return res.data?.result || []
  }

  public async getReport(params) {
    const res = await http.get('/api/services/app/FeeStatement/GetDashboardStatus', { params })
    return res.data.result
  }

  public async getPaymentChannels(params) {
    const res = await http.get('api/services/app/FeeStatement/GetListPaymentChannels', { params })
    return res.data.result
  }
  public async getListPaymentChannels(params) {
    const res = await http.get('api/services/app/FeeReceipt/GetListPaymentChannels', { params })
    return res.data.result
  }

  public async getAuditLog(params) {
    const res = await http.get('/api/services/app/FeeStatement/GetAuditLog', {
      params
    })
    return res.data.result
  }

  public async markActiveFees(body) {
    const res = await http.post('api/services/app/FeeStatement/MarkActive', body)
    return res.data.result
  }

  public async markInactiveFees(body) {
    const res = await http.post('api/services/app/FeeStatement/MarkInActive', body)
    return res.data.result
  }

  public async reportPackageSummary(params) {
    const res = await http.get('/api/services/app/FeeStatement/GetGroupPackageSummary', { params })
    return res.data.result
  }
  public async createFee(body) {
    const res = await http.post('api/services/app/FeeStatement/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async getDetailVoucher(id): Promise<any> {
    const res = await http.get('api/services/app/ExpenseMandate/GetDetail', {
      params: { id }
    })

    return res.data.result
  }
  public async getPaymentMethodList(params): Promise<any> {
    const res = await http.get('api/services/app/FeeChannel/GetAllPaymentChannelExternals', {
      params
    })

    return res.data.result
  }
  public async submitPaymentMethodDetail(body): Promise<any> {
    delete body.feePaymentChannel
    const res = body?.id
      ? await http.put('api/services/app/FeeChannel/UpdatePaymentChannelExternals', body)
      : await http.post('api/services/app/FeeChannel/AddPaymentChannelExternals', body)

    return res.data.result
  }

  public async changeStatusFee(body: IFeeUpdate) {
    const result = await http.put('/api/services/app/FeeStatement/UpdateFeeStatus', body)
    return result.data.result
  }
}

export default new FeeService()
