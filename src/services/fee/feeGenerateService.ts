import http from '@services/httpService'
import { notifySuccess, renderDateTime } from '@lib/helper'
import { LNotification } from '@lib/abpUtility'
import { downloadFile } from '@lib/helperFile'
import dayjs from 'dayjs'

class FeeGenerateService {
  public async create(body) {
    const result = await http.post('api/services/app/FeeGenerate/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async getAll(params): Promise<any> {
    const result = await http.get('api/services/app/FeeGenerate/GetAll', {
      params: params
    })
    return result.data.result
  }
  public async deactive(body) {
    await http.post('api/services/app/FeeGenerate/Deactive', {
      id: body
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }
  public async cofirm(body) {
    await http.post('api/services/app/FeeGenerate/Confirm', {
      id: body
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  public async GetAllDetail(params): Promise<any> {
    const result = await http.get('api/services/app/FeeGenerate/GetAllDetailV2', {
      params: params
    })
    return result.data.result
  }

  public async GetListDetail(params): Promise<any> {
    const result = await http.get('api/services/app/FeeGenerate/GetListDetailV2', {
      params: params
    })
    return result.data.result
  }

  public async exportFeeGenerate(params: any): Promise<any> {
    const res = await http.get('api/FeeStatements/ExportFeeGenerate', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `FeeGenerate__${renderDateTime(dayjs())}.xlsx`)
  }
  public async getOverviewDetail(params) {
    const res = await http.get('api/services/app/FeeGenerate/GetFeeGenerateSummary', {
      params
    })
    return res.data.result
  }
}

export default new FeeGenerateService()
