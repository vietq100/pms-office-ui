import http from '@services/httpService'

import { notifySuccess, renderDateTime } from '@lib/helper'
import { LNotification } from '@lib/abpUtility'
import { OptionModel } from '@models/global'
import { TransactionModel } from '@models/finance/transactionModel'
import { downloadFile } from '@lib/helperFile'
import moment from 'moment-timezone/moment-timezone'
import { CashAdvanceModel, ICashAdvance, WithDrawModel } from '@models/finance/cashAdvanceModel'
import dayjs from 'dayjs'

class CashAdvanceService {
  async createDeposit(body) {
    const result = await http.post('/api/services/app/CashAdvance/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  async withDraw(body) {
    const result = await http.post('/api/services/app/CashAdvance/WithDraw', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return new WithDrawModel(result.data.result)
  }
  async update(body) {
    const result = await http.put('api/services/app/CashAdvance/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  async getPaymentChannels() {
    const res = await http.get('api/services/app/CashAdvance/GetListPaymentChannels')
    return OptionModel.assigns(res.data.result)
  }

  async getTransactionTypes() {
    const res = await http.get('api/services/app/CashAdvance/GetListTransactionTypes')
    return OptionModel.assigns(res.data.result)
  }

  async activateOrDeactivate(id, isActive) {
    const result = await http.post('api/services/app/CashAdvance/Active', { id }, { params: { isActive } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  async delete(id) {
    const result = await http.delete('api/services/app/CashAdvance/Delete', {
      params: { id }
    })
    return result.data
  }

  async get(cashAdvanceId): Promise<any> {
    const result = await http.get('api/services/app/CashAdvance/GetCashAdvanceReceipts', {
      params: { cashAdvanceId }
    })
    return CashAdvanceModel.assign(result.data.result || {})
  }

  async checkExist(code): Promise<any> {
    const result = await http.post('api/services/app/CashAdvance/CheckExistCode', null, { params: { code } })
    return result.data.result
  }

  async filter(filters): Promise<any> {
    const params = this.proccessParams(filters)

    const res = await http.get('api/services/app/CashAdvance/GetAll', {
      params
    })
    const result = res.data.result
    result.items = CashAdvanceModel.assigns(result.items)
    return result
  }

  async getAll(params): Promise<ICashAdvance[]> {
    const res = await http.get('api/services/app/CashAdvance/GetLists', {
      params
    })
    return Promise.resolve(res.data.result)
  }

  // Cash advance detail
  async filterCashAdvanceTransactions(filters): Promise<any> {
    const res = await http.get('api/services/app/CashAdvance/GetCashAdvanceReceipts', { params: filters })
    const result = res.data.result
    result.items = TransactionModel.assigns(result.items)
    return result
  }

  public async exportCashAdvance(filters: any): Promise<any> {
    const params = this.proccessParams(filters)

    const res = await http.get('api/Export/ExportCashAdvance', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `CashAdvance_${renderDateTime(dayjs())}.xlsx`)
  }

  public async getTemplateImport(): Promise<any> {
    const res = await http.get('api/Imports/CashAdvance/GetTemplateImport', {
      responseType: 'blob'
    })
    downloadFile(res.data, 'CashAdvanceTemplate.xlsx')
  }

  public async exportCashAdvanceDetailTransactions(filters: any): Promise<any> {
    const params = this.proccessParams(filters)

    const res = await http.get('api/Export/ExportCashReceipt', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `CashAdvanceDetailTransactions_${renderDateTime(dayjs())}.xlsx`)
  }
  public async getCashAdvanceWallets(params: any) {
    const result = await http.get('api/services/app/CashAdvance/GetCashAdvancesByUnit', { params })
    return result.data.result
  }

  private proccessParams(params) {
    const filters = { ...(params || {}) }

    const [fromDate, toDate] = params.dateFromTo || []
    filters.fromDate = fromDate ? moment(fromDate).startOf('day').toJSON() : null
    filters.toDate = toDate ? moment(toDate).endOf('day').toJSON() : null
    delete filters.dateFromTo

    return filters
  }

  async autoDeductCashAdvance(params) {
    await http.post('api/services/app/CashAdvance/AutoDeductCashAdvance', params)
  }

  async getAutoDeductCashAdvance(params) {
    const res = await http.get('api/services/app/CashAdvance/GetAutoDeductCashAdvance', {
      params
    })
    return Promise.resolve(res.data.result)
  }

  public async importFromExcel(file, cashChanelId, cashChannelExternalId) {
    const data = new FormData()
    data.append('file', file)
    const json = { cashChanelId, cashChannelExternalId }
    data.append(`model`, JSON.stringify(json))
    return await http.post('/api/Imports/CashAdvance/ImportFromExcel', data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
  }

  async getCashReceipt(id) {
    const res = await http.get('api/services/app/CashAdvance/GetCashReceipt', {
      params: { id }
    })
    return res.data.result
  }
}

export default new CashAdvanceService()
