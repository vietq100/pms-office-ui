import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import http from '../httpService'
import { notifyError, notifySuccess } from '../../lib/helper'
import { L, LNotification } from '../../lib/abpUtility'
import { WaterMeterModal } from '../../models/paymentRequest/PaymentRequestModal'

class TotalWaterMeterService {
  public async createOrUpdate(body: any, files?: any) {
    const result = await http.post('api/services/app/PaymentRequest/CreateOrUpdateWaterIndexRecording', body)
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

    await http.post(`api/Documents/UploadWaterIndexRecordingDocument`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    // }
  }
  public async delete(id: number) {
    const result = await http.delete('api/services/app/PaymentRequest/DeleteWaterIndexRecording', {
      params: { id }
    })
    return result.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/PaymentRequest/GetDetailWaterIndexRecording', {
      params: { id }
    })

    const result = WaterMeterModal.assign(res.data.result)
    return result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const result = await http.get('api/services/app/PaymentRequest/GetAllWaterIndexRecording', { params })
    return result.data.result
  }
}

export default new TotalWaterMeterService()
