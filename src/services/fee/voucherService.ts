import type { PagedResultDto } from '@services/dto/pagedResultDto'
import http from '../httpService'
import { downloadFile } from '@lib/helperFile'
import { notifyError, notifySuccess, renderDateTime } from '@lib/helper'
import { L, LNotification } from '@lib/abpUtility'
import dayjs from 'dayjs'

class VoucherService {
  public async create(body: any) {
    if (!body.feeDetails || !body.feeDetails.length) {
      notifyError(L('ERROR'), L('PLEASE_SELECT_FEE_ITEM_TO_MAKE_RECEIPT'))
      throw Error(L('PLEASE_SELECT_FEE_ITEM_TO_MAKE_RECEIPT'))
    }
    const result = await http.post('/api/services/app/ExpenseMandate/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('ITEM_CREATE_SUCCEED'))
    return result.data.result
  }

  public async update(body: any) {
    const result = await http.put('/api/services/app/ExpenseMandate/update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('ITEM_UPDATE_SUCCEED'))
    return result.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const result = await http.get('/api/services/app/ExpenseMandate/GetAll', {
      params
    })
    return result.data.result
  }

  public async delete(params) {
    return http.delete('/api/services/app/ExpenseMandate/Remove', { params })
  }

  public async getOverview(params) {
    const res = await http.get('api/services/app/ExpenseMandate/GetExpenseMandatesOverview', { params })
    return res.data.result
  }

  public async downloadVouchers(params) {
    const response = await http.get('api/ExpenseMandates/ExportFeeVoucher', {
      responseType: 'blob',
      params
    })
    downloadFile(response.data, `FeeVoucher_${renderDateTime(dayjs())}.xlsx`)
  }
  public async getChannels() {
    const result = await http.get('/api/services/app/ExpenseMandate/GetChannels')
    return result.data.result
  }
  public async exportExpenseMandates(params) {
    const response = await http.get('api/FeeStatements/ExportExpenseMandate', {
      responseType: 'blob',
      params
    })
    downloadFile(response.data, `FeeExpenseMandate_${renderDateTime(dayjs())}.xlsx`)
  }
}

export default new VoucherService()
