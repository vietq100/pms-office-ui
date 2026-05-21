import http from '../httpService'
import { notifyError, notifySuccess } from '../../lib/helper'
import { L, LNotification } from '../../lib/abpUtility'
import {
  ElectricAndWaterFeeModal,
  ElectricMeterModal,
  ListElectricAndWaterFeeModal,
  WaterMeterModal
} from '@models/paymentRequest/PaymentRequestModal'

class ManagementFeeService {
  public async create(body: any, files?: any) {
    const result = await http.post('api/services/app/PaymentRequest/CreatePaymentRequestElectricityAndWaterFee', body)
    if (result.data.result?.uniqueId && files) {
      await this.uploadPhoto(files, result.data.result?.uniqueId)
    }
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body: any, files?: any) {
    const result = await http.put('api/services/app/PaymentRequest/UpdatePaymentRequestElectricityAndWaterFee', body)
    if (result.data.result?.uniqueId && files) {
      await this.uploadPhoto(files, result.data.result?.uniqueId)
    }
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  public async uploadPhoto(fileList: any[], uniqueId) {
    const data = new FormData()
    ;(fileList || []).forEach((file, index) => {
      data.append('HandoverReservation' + index, file)
    })

    await http.post(`api/Documents/UploadElectricityIndexRecordingDocument`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
  }
  public async delete(id: number) {
    const result = await http.delete('api/services/app/PaymentRequest/DeleteElectricityAndWaterFee', {
      params: { id }
    })
    return result.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/PaymentRequest/GetPaymentRequestElectricityAndWaterFeeById', {
      params: { id }
    })
    const result = ElectricAndWaterFeeModal.assign(res.data.result)
    return result
  }

  public async getList(params: any): Promise<any> {
    const res = await http.get('api/services/app/PaymentRequest/GetListPaymentRequestElectricityAndWaterFee', {
      params
    })

    const result = ListElectricAndWaterFeeModal.assigns(res.data.result)
    return result
  }

  public async getDetailWaterByFeePackageId(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/PaymentRequest/GetDetailWaterIndexRecordingByFeePackageId', {
      params: { id }
    })
    const result = WaterMeterModal.assign(res.data.result)
    return result
  }

  public async calculateElectricityFee(electricFeePackageId: number): Promise<any> {
    if (!electricFeePackageId) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/PaymentRequest/CalculateElectricityFee', {
      params: { electricFeePackageId }
    })
    const result = ElectricMeterModal.assign(res.data.result)
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
}

export default new ManagementFeeService()
