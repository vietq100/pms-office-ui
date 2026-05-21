import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess, renderDateTime } from '../../lib/helper'
import { RowReservationModel, ReservationModel } from '@models/Booking/reservationModel'
import { downloadFile } from '@lib/helperFile'
import dayjs from 'dayjs'

class ReservationService {
  public async create(body: any) {
    if (!body.bookingSlot || !body.bookingSlot.start || !body.bookingSlot.end) {
      notifyError(L('ERROR'), L('INVALID_RESERVATION_MODEL'))
      return
    }

    body.startDate = body.bookingSlot.startTime // `${body.bookingSlot.start}${body.bookingSlot.startTimeZone}`
    body.endDate = body.bookingSlot.endTime // `${body.bookingSlot.end}${body.bookingSlot.endTimeZone}`
    delete body.fromToDate

    const res = await http.post('api/services/app/Reservation/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return ReservationModel.assign(res.data.result)
  }

  public async update(body: any) {
    const res = await http.put('api/services/app/Reservation/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return ReservationModel.assign(res.data.result)
  }

  public async createAdditionalFee(body: any) {
    const res = await http.post('/api/services/app/Reservation/SetAdditionalService', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async delete(id: number) {
    const res = await http.delete('api/services/app/Reservation/Delete', {
      params: { id }
    })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/Reservation/Active', {}, { params: { id, isActive } })
    return res.data
  }

  public async get(id: number, isShowEmailPhone?: boolean): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/Reservation/Get', {
      params: { id, isShowEmailPhone }
    })
    const result = ReservationModel.assign(res.data.result)
    return result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/Reservation/GetAll', {
      params
    })
    const { result } = res.data
    result.items = RowReservationModel.assigns(result.items)
    return result
  }

  public async getAllMyReservation(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('api/services/app/Reservation/GetAllMyReservation', { params })
    return res.data.result
  }

  public async exportReservation(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportReservation', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `Reservation_${renderDateTime(dayjs())}.xlsx`)
  }

  public async getReservationStatus(params: any): Promise<any> {
    const res = await http.get('api/services/app/Reservation/GetStatus', {
      params
    })
    return res.data.result
  }

  public async getReservationPaymentStatus(params: any): Promise<any> {
    const res = await http.get('api/services/app/Reservation/GetPaymentStatus', { params })
    return res.data.result
  }
  public async getOverview(params) {
    const res = await http.get('api/services/app/Reservation/GetOverviewReservation', { params })
    return res.data.result
  }
}

export default new ReservationService()
