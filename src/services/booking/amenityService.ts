import http from '@services/httpService'
import { notifySuccess } from '@lib/helper'
import { L, LNotification } from '@lib/abpUtility'
import {
  RowAmenityModel,
  AmenityDetailModel,
  MonthlyPackageDetailModel,
  BlacklistDetailModel
} from '@models/Booking/amenityModel'
import { BookingSlotModel } from '@models/Booking/reservationModel'
import dayjs from 'dayjs'

class AmenityService {
  public async create(body) {
    if (!body) {
      return
    }
    body.amenityTimeRules = []
    Object.keys(body.timeRules || {})?.forEach((key) => {
      body.timeRules[key]?.forEach((timeRule) => {
        const data = {
          ...timeRule,
          startTime: dayjs(timeRule.startTime).format('HH:mm:ss'),
          endTime: dayjs(timeRule.endTime).format('HH:mm:ss')
        }
        body.amenityTimeRules?.push(data)
      })
    })

    const result = await http.post('api/services/app/Amenities/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body: AmenityDetailModel) {
    if (!body) {
      return
    }
    body.amenityTimeRules = []
    ;(Object.keys(body.timeRules) || [])?.forEach((key) => {
      body.timeRules[key]?.forEach((timeRule) => {
        const data = {
          ...timeRule,
          startTime: dayjs(timeRule.startTime).format('HH:mm:ss'),
          endTime: dayjs(timeRule.endTime).format('HH:mm:ss')
        }
        body.amenityTimeRules?.push(data)
      })
    })

    const result = await http.put('api/services/app/Amenities/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async activateOrDeactivate(id, isActive) {
    const result = await http.post('api/services/app/Amenities/Active', { id }, { params: { isActive } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async activateOrDeactivateBlackList(body) {
    const result = await http.post('api/services/app/AmenitySettings/ActiveBlacklist', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async delete(id) {
    const result = await http.delete('api/services/app/Amenities/Delete', {
      params: { id }
    })
    return result.data
  }

  public async get(id): Promise<any> {
    const result = await http.get('api/services/app/Amenities/GetAmenityForEdit', { params: { id } })
    return AmenityDetailModel.assign(result.data.result || {})
  }

  public async getNotificationTypes(code): Promise<any> {
    const result = await http.post('api/services/app/Amenities/GetNotificationTypes', null, { params: { code } })
    return result.data.result
  }

  public async getParameters(code): Promise<any> {
    const result = await http.post('api/services/app/Amenities/GetParameters', null, { params: { code } })
    return result.data.result
  }

  public async getAll(params): Promise<any> {
    const res = await http.get('api/services/app/Amenities/GetAll', {
      params: params
    })
    const { result } = res.data
    result.items = RowAmenityModel.assigns(result.items)

    return result
  }
  public async getSearchAmenity(params): Promise<any> {
    const res = await http.get('api/services/app/Amenities/GetSuggests', {
      params: params
    })
    const { result } = res.data
    result.items = RowAmenityModel.assigns(result.items)

    return result
  }
  public async getAllBlackList(params): Promise<any> {
    const res = await http.get('api/services/app/AmenitySettings/GetAllBlackLists', {
      params: params
    })
    const { result } = res.data
    return result
  }

  public async getBlackListDetail(id) {
    const res = await http.get('api/services/app/AmenitySettings/GetBlacklistDetail', {
      params: { id }
    })
    return BlacklistDetailModel.assign(res.data.result)
  }

  public async createBlackListDetail(body) {
    if (!body) {
      return
    }
    const result = await http.post('api/services/app/AmenitySettings/AddBlacklist', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  public async updateBlackListDetail(body) {
    if (!body) {
      return
    }

    const result = await http.put('api/services/app/AmenitySettings/UpdateBlacklist', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  //===================================================

  public async getAllMonthlyPackage(params): Promise<any> {
    const res = await http.get('api/services/app/AmenityMonthlyPackage/GetAll', {
      params: params
    })
    const { result } = res.data
    return result
  }

  public async getMonthlyPackageDetail(id) {
    const res = await http.get('api/services/app/AmenityMonthlyPackage/GetDetail', {
      params: { id }
    })
    return MonthlyPackageDetailModel.assign(res.data.result)
  }

  public async createMonthlyPackageDetail(body) {
    if (!body) {
      return
    }
    const result = await http.post('api/services/app/AmenityMonthlyPackage/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  public async updateMonthlyPackageDetail(body) {
    if (!body) {
      return
    }

    const result = await http.put('api/services/app/AmenityMonthlyPackage/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  //===================================================
  public async getList(params): Promise<RowAmenityModel[]> {
    const res = await http.get('api/services/app/Amenities/GetAmenities', {
      params
    })
    return Promise.resolve(res.data.result)
  }

  public async getBookingTimeSlot(params: any): Promise<any> {
    const cloneParams = { ...params }
    if (!cloneParams.fromDate || !cloneParams.toDate) {
      return Promise.resolve([])
    }

    cloneParams.fromDate = dayjs(cloneParams.fromDate).format('YYYY/MM/DD').toLocaleString()
    cloneParams.toDate = dayjs(cloneParams.toDate).format('YYYY/MM/DD').toString()

    const res = await http.get('api/services/app/Amenities/GetTimeSlots', {
      params: cloneParams
    })
    const result = res.data?.result || []
    return BookingSlotModel.assigns(result)
  }

  public async getIcons(params): Promise<any[]> {
    const res = await http.get('api/services/app/Amenities/GetAmenityIcons', {
      params
    })
    return Promise.resolve(res.data.result)
  }

  public async getTimezones(params): Promise<any[]> {
    params.defaultTimezoneScope = 1
    const res = await http.get('api/services/app/Timing/GetTimezones', {
      params
    })
    const result = (res.data.result?.items || []).map((item) => {
      return { ...item, id: item.value }
    })
    return Promise.resolve(result)
  }

  public async updateAmenityMaintenance(body): Promise<any[]> {
    const res = await http.post('api/services/app/Amenities/SetAmenityMaintenance', body)
    return Promise.resolve(res.data.result)
  }
  public async changeActiveStatusMonthlyPackage(id, currentStatus): Promise<any[]> {
    const res = await http.post('api/services/app/AmenityMonthlyPackage/Active', { id, isActive: !currentStatus })
    notifySuccess(L('SUCCESSFULLY'), L('UPDATE_SUCCESSFULLY'))
    return Promise.resolve(res.data.result)
  }
}

export default new AmenityService()
