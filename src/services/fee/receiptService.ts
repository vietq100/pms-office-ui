import type { PagedResultDto } from '@services/dto/pagedResultDto'
import http from '../httpService'
import { downloadFile } from '@lib/helperFile'
import { notifyError, notifySuccess, renderDateTime } from '@lib/helper'
import { L, LNotification } from '@lib/abpUtility'
import dayjs from 'dayjs'

class ReceiptService {
  public async create(body: any) {
    if (!body.feeDetails || !body.feeDetails.length) {
      notifyError(L('ERROR'), L('PLEASE_SELECT_FEE_ITEM_TO_MAKE_RECEIPT'))
      throw Error(L('PLEASE_SELECT_FEE_ITEM_TO_MAKE_RECEIPT'))
    }
    const result = await http.post('/api/services/app/FeeReceipt/CreateReceiptV1', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const result = await http.get('/api/services/app/FeeReceipt/GetAll', {
      params
    })
    return result.data.result
  }

  public async getDetail(id): Promise<any> {
    const result = await http.get('api/services/app/FeeReceipt/GetReceiptDetail', { params: { id } })
    return result.data.result
  }

  public async getCashAdvanceWallets(params: any) {
    const result = await http.get('api/services/app/CashAdvance/GetCashAdvancesByUnit', { params })
    return result.data.result
  }

  public async delete(params) {
    return http.delete('/api/services/app/FeeReceipt/RemoveReceipt', { params })
  }

  public async getOverview(params) {
    const res = await http.get('api/services/app/FeeReceipt/GetReceiptOverview', { params })
    return res.data.result
  }

  public async getOutStanding(params): Promise<any> {
    const result = await http.get('api/services/app/FeeReceipt/GetOutStanding', { params })
    return result.data.result
  }

  public async downloadReceipts(params) {
    const response = await http.get('api/FeeReceipts/ExportFeeReceipt', {
      responseType: 'blob',
      params
    })
    downloadFile(response.data, `FeeReceipts_${renderDateTime(dayjs())}.xlsx`)
  }
}

export default new ReceiptService()
