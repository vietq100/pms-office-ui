import http from '../httpService'
import { notifyError, notifySuccess, renderDateTime } from '../../lib/helper'
import { L, LNotification } from '../../lib/abpUtility'
import { downloadFile } from '@lib/helperFile'
import dayjs from 'dayjs'
import { MeterReadingElectricModel } from '@models/meterReading/MeterReadElectricModel'
import { ConfirmMeterReaingModal } from '@models/meterReading/ConfirmMeterReaingModal'

class ElectricFormService {
  public async create(body) {
    const result = await http.post('/api/services/app/ElectricForm/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  public async update(body) {
    const result = await http.put('/api/services/app/ElectricForm/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async getFormDraft(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/ElectricForm/GetFormDraft', {
      params: { id }
    })

    const result = MeterReadingElectricModel.assign(res.data.result)

    return result
  }

  public async getAllFormDraft(params: any): Promise<any> {
    const res = await http.get('api/services/app/ElectricForm/GetAllFormDraft', {
      params
    })
    const result = res.data.result
    return result
  }

  public async exportElectricFormData(params: any): Promise<any> {
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

  public async delete(id: number) {
    const result = await http.delete('api/services/app/ElectricForm/Delete', {
      params: { id }
    })
    return result.data
  }

  public async getAllElectricFrom(params: any): Promise<any> {
    const res = await http.get('api/services/app/ElectricForm/GetAll', {
      params
    })
    const result = res.data.result
    return result
  }

  public async getAllElectricForm4Tennt(params: any): Promise<any> {
    const res = await http.get('/api/services/app/ElectricForm/GetAllByResident', {
      params
    })
    const result = res.data.result
    return result
  }

  public async createRequestElectric(body) {
    const result = await http.post('/api/services/app/ElectricForm/CreateRequestElectric', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  public async checkRequestIsValid(body) {
    const result = await http.post('api/services/app/ElectricForm/CheckRequestIsValid', body)

    return result.data.result
  }

  public async getConfirmElectricForm(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('/api/services/app/ElectricForm/Get', {
      params: { id }
    })

    const result = ConfirmMeterReaingModal.assign(res.data.result)

    return result
  }

  public async getConfirmElectricForm4Tenant(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/ElectricForm/GetByResident', {
      params: { id }
    })

    const result = ConfirmMeterReaingModal.assign(res.data.result)

    return result
  }

  public async getListRequestHistory(params: any): Promise<any> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/Request/GetListRequestHistory', {
      params
    })
    return res.data.result
  }

  public async sendApproval(body: any) {
    await http.put('api/services/app/Request/UpdateStatus', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  public async updateElectricForm(body: any) {
    await http.put('api/services/app/ElectricForm/UpdateAmount', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }
}

export default new ElectricFormService()
