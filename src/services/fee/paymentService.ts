import http from '@services/httpService'
import { notifySuccess } from '@lib/helper'
import { LNotification } from '@lib/abpUtility'
import { PaymentSetting } from '@models/fee/payment'

class PaymentService {
  public async getPaymentSetting(): Promise<PaymentSetting> {
    const res = await http.get('/api/services/app/Projects/GetProjectsMomoSetting', {})
    return res.data.result
  }

  public async updatePaymentSetting(payload: PaymentSetting) {
    const res = await http.put('/api/services/app/Projects/UpdateProjectsMomoSetting', payload)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data
  }
}

export default new PaymentService()
