import http from '@services/httpService'
import { notifySuccess, renderDateTime } from '@lib/helper'
import { LNotification } from '@lib/abpUtility'
import { RowFeeNoticeModel } from '@models/fee'
import { downloadFile } from '@lib/helperFile'
import dayjs from 'dayjs'

class feeNoticeService {
  public async create(body) {
    const result = await http.post('api/services/app/FeeNotices/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async getAll(params): Promise<any> {
    const res = await http.get('api/services/app/FeeNotices/GetAll', {
      params: params
    })
    const { result } = res.data
    result.items = RowFeeNoticeModel.assigns(result.items)

    return result
  }

  public async getTemplatesll(params): Promise<any> {
    const result = await http.get('api/services/app/FeeNotices/GetTemplates', {
      params: params
    })
    return result.data.result
  }

  public async getHistory(params): Promise<any> {
    const result = await http.get('api/services/app/FeeNotices/GetAllHistories', {
      params: params
    })
    return result.data.result
  }

  public async deactive(body) {
    await http.post('api/services/app/FeeNotices/Deactive', {
      id: body
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }
  public async cofirm(body) {
    await http.post('api/services/app/FeeNotices/ConfirmToSend', {
      id: body
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  public async refreshFeeNotice(id) {
    await http.post('api/services/app/FeeNotices/Refresh', {
      feeNotificationPackageId: id
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  public async sendSpecificNotice(body) {
    await http.post('api/services/app/FeeNotices/sendSpecificNotice', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SEND_SUCCESSFULLY'))
  }

  public async exportFeeNotices(params: any): Promise<any> {
    const res = await http.get('api/FeeStatements/ExportFeeNotices', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `FeeNotices_${renderDateTime(dayjs())}.xlsx`)
  }

  public async feeNoticeAsZip(params: any): Promise<any> {
    const res = await http.get('api/FeeStatements/FeeNoticeAsZip', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `feeNoticeAsZip_${renderDateTime(dayjs())}.zip`)
  }
  public async getAllOverview(params): Promise<any> {
    const result = await http.get('api/services/app/FeeNotices/GetAllOverview', {
      params: params
    })
    return result.data.result
  }
}

export default new feeNoticeService()
