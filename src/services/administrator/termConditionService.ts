import http from '@services/httpService'
import { notifySuccess } from '@lib/helper'
import { LNotification } from '@lib/abpUtility'
import { TermConditionDetailModel } from '@models/termCondition'

class TermConditionService {
  public async createOrUpdate(body: TermConditionDetailModel) {
    if (!body) {
      return
    }
    const data = { ...body }
    data.subject = Object.keys(body.subject).map((key) => ({
      languageName: key,
      value: body.subject[key]
    }))
    data.content = Object.keys(body.content).map((key) => ({
      languageName: key,
      value: body.content[key]
    }))

    const result = await http.put('api/services/app/Configuration/UpdateTermAndCondition', data)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async get(): Promise<any> {
    const result = await http.get('api/services/app/Configuration/GetTermAndConditionForEdit')
    return TermConditionDetailModel.assign(result.data.result || {})
  }
}

export default new TermConditionService()
