import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../lib/helper'
import { RowTicketRequestModel } from '@models/ticketRequest/TicketRequestModel'
import { TicketParkingOvertimeModel } from '@models/ticketRequest/tickRequestRenovation'

class parkingOvertimeTicketService {
  public async create(body: any) {
    const res = await http.post('api/services/app/OvertimeParkingForm/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return TicketParkingOvertimeModel.assign(res.data.result)
  }

  public async sendApproval(body: any) {
    await http.put('api/services/app/Request/UpdateStatus', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  public async update(body: any) {
    const res = await http.put('api/services/app/OvertimeParkingForm/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return TicketParkingOvertimeModel.assign(res.data.result)
  }

  public async delete(id: number) {
    const res = await http.delete('api/services/app/OvertimeParkingForm/Delete', {
      params: { id }
    })
    return res.data
  }

  public async get4Staff(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/OvertimeParkingForm/Get', {
      params: { id }
    })
    const result = TicketParkingOvertimeModel.assign(res.data.result)
    return result
  }

  public async get4Resident(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/OvertimeParkingForm/GetByResident', {
      params: { id }
    })
    const result = TicketParkingOvertimeModel.assign(res.data.result)
    return result
  }

  public async getAll4Staff(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/OvertimeParkingForm/GetAll', {
      params
    })
    const { result } = res.data
    result.items = RowTicketRequestModel.assigns(result.items)
    return result
  }

  public async getAll4User(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/OvertimeParkingForm/GetAllByResident', {
      params
    })
    const { result } = res.data
    result.items = RowTicketRequestModel.assigns(result.items)
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

  public async getListStaff4Filter(params: any): Promise<any> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/Employees/GetListActive', {
      params
    })
    const { result } = res.data
    return result.items
  }
}

export default new parkingOvertimeTicketService()
