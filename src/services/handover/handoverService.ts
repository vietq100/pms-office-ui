import { L } from '@lib/abpUtility'
import { notifyError, renderDateTime } from '@lib/helper'
import { downloadFile } from '@lib/helperFile'
import { EFormHandOverlModel } from '@models/handoverChecklist/EformHandOverModel'
import http from '@services/httpService'
import dayjs from 'dayjs'

class HandoverService {
  public async publishHandover(body): Promise<any> {
    const res = await http.post('api/services/app/HandoverPlans/Publish', body)
    return res.data.result
  }
  public async searchUnit(params): Promise<any> {
    const res = await http.get('api/services/app/HandoverPlans/GetAllUnits', {
      params: {
        ...params,
        maxResultCount: 20,
        skipCount: 0
      }
    })
    return res.data.result.items
  }

  public async getListBuilding(params): Promise<any> {
    const res = await http.get('api/services/app/Buildings/GetAll', { params })
    return res.data.result.items
  }
  public async getListFloor(params): Promise<any> {
    const res = await http.get('api/services/app/Floors/GetListFloors', {
      params
    })
    return res.data.result
  }
  public async getListUnit(params): Promise<any> {
    const res = await http.get('api/services/app/HandoverPlans/GetListUnits', {
      params
    })
    return res.data.result
  }
  public async getListStatus(): Promise<any> {
    const res = await http.get('api/services/app/HandoverPlans/GetListStatus')
    return res.data.result
  }

  public async getAllHandoverPlans(params): Promise<any> {
    const res = await http.get('api/services/app/HandoverPlans/GetAll', {
      params
    })
    return res.data.result
  }
  public async getNotificationProcess(params): Promise<any> {
    const res = await http.get('api/services/app/HandoverPlans/GetAllNotifications', {
      params
    })
    return res.data.result
  }

  public async getHandoverPlanDetail(id): Promise<any> {
    const res = await http.get('api/services/app/HandoverPlans/GetForEdit', {
      params: { id }
    })
    return res.data.result
  }
  public async createHandoverPlan(body): Promise<any> {
    const res = await http.post('api/services/app/HandoverPlans/Create', body)
    return res.data.result
  }

  public async updateHandoverPlan(body): Promise<any> {
    const res = await http.put('api/services/app/HandoverPlans/Update', body)
    return res.data.result
  }
  public async getAssignUser(params): Promise<any> {
    const res = await http.get('api/services/app/HandoverPlans/GetAssignUsers', { params })
    return res.data.result
  }
  public async checkUnitStatus(body): Promise<any> {
    const res = await http.post('api/services/app/HandoverPlans/CheckUnitState', body)
    return res.data.result
  }

  // Reservation Handover

  public async getAllReservationHandover(params): Promise<any> {
    const res = await http.get('api/services/app/HandoverReservation/GetAll', {
      params
    })
    return res.data.result
  }
  public async getReservationHandoverDetail(id): Promise<any> {
    const res = await http.get('api/services/app/HandoverReservation/Get', {
      params: { id }
    })
    return res.data.result
  }
  public async getReservationHandoverOverview(params): Promise<any> {
    const res = await http.get('api/services/app/HandoverReservation/GetOverviewHandoverReservation', { params })
    return res.data.result
  }
  public async checkHandoverPlanByUnit(unitId): Promise<any> {
    const res = await http.post('api/services/app/HandoverReservation/CheckHandoverPlanByUnit', undefined, {
      params: { unitId }
    })
    return res.data.result
  }
  public async getTimeSlot(params): Promise<any> {
    const res = await http.get('api/services/app/HandoverReservation/GetTimeSlot', { params })
    return res.data.result
  }
  public async getPublicTimeSlot(handoverId, handoverDate): Promise<any> {
    const res = await http.get('api/services/app/HandoverPublicUser/GetTimeSlot', {
      params: { handoverId, handoverDate }
    })
    return res.data.result
  }
  public async getReservationStatus(params) {
    const res = await http.get('api/services/app/HandoverReservation/GetListStatus', { params })
    return res.data.result
  }

  public async createHandoverReservation(body, files?): Promise<any> {
    const res = await http.post('api/services/app/HandoverReservation/CreateReservation', body)
    if (res.data.result?.uniqueId && files) {
      await this.uploadPhoto(files, res.data.result?.uniqueId)
    }
    return res.data.result
  }
  public async uploadPhoto(fileList: any[], uniqueId) {
    const data = new FormData()
    ;(fileList || []).forEach((file, index) => {
      data.append('HandoverReservation' + index, file)
    })

    await http.post(`api/Documents/UploadHandoverReservations`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    // }
  }
  public async updateHandoverReservation(body, files?): Promise<any> {
    const res = await http.put(
      'api/services/app/HandoverReservation/UpdateReservation',

      body
    )

    if (res.data.result?.uniqueId && files) {
      await this.uploadPhoto(files, res.data.result?.uniqueId)
    }
    return res.data.result
  }
  public async handleComplete(body): Promise<any> {
    const res = await http.post('api/services/app/HandoverReservation/CompleteReservation', body)
    return res.data.result
  }
  public async getHandoverPublicBookingList(idToken): Promise<any> {
    const res = await http.get('api/services/app/HandoverPublicUser/GetHandovers', { params: { idToken } })
    return res.data.result
  }
  public async getHandoverPublicUser(id): Promise<any> {
    const res = await http.get('api/services/app/HandoverPublicUser/Get', {
      params: { id }
    })
    return res.data.result
  }
  public async sentOTP(body) {
    const res = await http.post('api/services/app/HandoverPublicUser/SendVerificationCode', body)
    return res.data.result
  }
  public async createReservation(body): Promise<any> {
    const res = await http.post('api/services/app/HandoverPublicUser/CreateReservation', body)
    return res.data.result
  }
  public async getHandoverSuggest(params: any): Promise<any> {
    const res = await http.get('api/services/app/HandoverPlans/GetSuggests', {
      params
    })
    return res.data.result.items
  }
  public async cancelHandover(body: any): Promise<any> {
    const res = await http.post('api/services/app/HandoverPublicUser/CancelReservation', body)
    return res
  }
  public async export(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportHandoverReservation', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `HandoverReservation_${renderDateTime(dayjs())}.xlsx`)
  }
  public async getHandoverPlanOverview(params: any): Promise<any> {
    const res = await http.get('api/services/app/HandoverPlans/GetHandoverPlanOverview', {
      params
    })
    return res.data.result
  }
  public async getHandoverPlanSetting(): Promise<any> {
    const res = await http.get('api/services/app/HandoverPlans/GetHandoverHotlineUserSettings')
    return res.data.result
  }

  public async updateHandoverPlanSetting(body): Promise<any> {
    const res = await http.put('api/services/app/HandoverPlans/UpdateHandoverHotlineUserSettings', body)
    return res.data.result
  }

  public async getHandOverReservationBindingData(params): Promise<any> {
    const res = await http.get('api/services/app/HandoverReservation/GetHandOverReservationBindingData', {
      params
    })
    return res.data.result
  }
  // DEFECT
  public async getAllDefect(params): Promise<any> {
    const res = await http.get('api/services/app/WorkOrder/GetAll', {
      params
    })
    return res.data.result
  }
  public async getDetailDefect(params): Promise<any> {
    const res = await http.get('api/services/app/WorkOrder/Get', {
      params
    })
    return res.data.result
  }
  public async updateUserAnswer(body): Promise<any> {
    const res = await http.put('api/services/app/FormUserAnswer/UpdateUserAnswer', body)
    return res.data.result
  }

  public async createUserAnswerForm(body): Promise<any> {
    const res = await http.post('api/services/app/FormUserAnswer/AddUserAnswer', body)
    return res.data.result
  }

  public async getResponseDetail(id): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }
    const result = await http.get('/api/services/app/FormUserAnswer/GetUserAnswer', {
      params: { id }
    })
    return EFormHandOverlModel.assign(result.data.result)
  }
}

export default new HandoverService()
