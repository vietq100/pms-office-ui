import http from '../httpService'
import { notifySuccess, renderDateTime } from '../../lib/helper'
import { IMeterReading, MeterReadingModel } from '@models/meterReading/MeterReadingModel'
import { LNotification } from '../../lib/abpUtility'
import { downloadFile } from '@lib/helperFile'
import { IPackageFee, PackageFeeModel } from '@models/fee'
import dayjs from 'dayjs'

class MeterReadingService {
  public async createOrUpdateWaterProfile(body: IMeterReading) {
    const result = await http.post('/api/services/app/MeterReadingProfile/CreateOrUpdateWaterProfile', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  public async createOrUpdateElectricityProfile(body: IMeterReading) {
    const result = await http.post('/api/services/app/MeterReadingProfile/CreateOrUpdateElectricityProfile', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async getMeterElectricityProfileForUnit(params: any): Promise<any> {
    const res = await http.get('/api/services/app/MeterReadingProfile/GetMeterElectricityProfileForUnit', {
      params
    })
    const result = res.data.result
    if (result.items) {
      result.items = MeterReadingModel.assign(result.items)
    }

    return result
  }

  public async getMeterWaterProfileForUnit(params: any): Promise<any> {
    const res = await http.get('/api/services/app/MeterReadingProfile/GetMeterWaterProfileForUnit', {
      params
    })
    const result = res.data.result
    if (result.items) {
      result.items = MeterReadingModel.assign(result.items)
    }
    return result
  }

  public async getOverviewMeterWater(params: any): Promise<any> {
    const res = await http.get('/api/services/app/MeterWater/GetAllOverview', {
      params
    })
    const result = res.data.result
    return result
  }

  public async getAllMeterWaterLogs(params: any): Promise<any> {
    const res = await http.get('/api/services/app/MeterWater/GetAllMeterLogs', {
      params
    })
    const result = res.data.result
    return result
  }

  public async exportMeterOverview(params: any): Promise<any> {
    const response = await http.get('/api/MeterReading/ExportMeterOverview', {
      params,
      responseType: 'blob'
    })
    downloadFile(response.data, `MeterWater_${renderDateTime(dayjs())}.xlsx`)
  }

  public async downloadTemplate() {
    const response = await http.get('/api/MeterReading/ExportMeterTemplate', {
      responseType: 'blob'
    })
    downloadFile(response.data, 'MeterTemplate.xlsx')
  }

  public async importFee(file) {
    const data = new FormData()
    data.append('file', file)
    return await http.post('/api/Imports/MeterWater/ImportFromExcel', data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
  }
  public async getCurrentPackage(): Promise<IPackageFee> {
    const result = await http.get('api/services/app/MeterWater/GetCurrentPackage')
    return PackageFeeModel.assign(result.data.result)
  }

  public async updateCurrentPackage(body) {
    const result = await http.put('/api/services/app/MeterWater/UpdateCurrentPackage', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  public async completeWaterMeterPeriod(body) {
    const result = await http.post('/api/services/app/MeterWater/CompleteWaterMeterPeriod', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
}

export default new MeterReadingService()
