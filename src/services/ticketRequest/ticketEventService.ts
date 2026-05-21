import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../lib/helper'
import { RowTicketRequestEventModel, TicketRequestEventModel } from '@models/ticketRequest/TicketEventModel'

class TicketEventService {
  public async create(body: any) {
    const res = await http.post('api/services/app/EventPlanningForm/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return TicketRequestEventModel.assign(res.data.result)
  }

  public async sendApproval(body: any) {
    await http.put('api/services/app/Request/UpdateStatus', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  public async update(body: any) {
    const res = await http.put('api/services/app/EventPlanningForm/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return TicketRequestEventModel.assign(res.data.result)
  }

  public async delete(id: number) {
    const res = await http.delete('api/services/app/EventPlanningForm/Delete', {
      params: { id }
    })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/Contracts/baodeptrai', { id, isActive })
    return res.data
  }

  public async get4Staff(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/EventPlanningForm/Get', {
      params: { id }
    })
    const result = TicketRequestEventModel.assign(res.data.result)
    return result
  }

  public async get4Resident(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/EventPlanningForm/GetByResident', {
      params: { id }
    })
    const result = TicketRequestEventModel.assign(res.data.result)
    return result
  }

  public async getAll4Staff(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/EventPlanningForm/GetAll', {
      params
    })
    const { result } = res.data
    result.items = RowTicketRequestEventModel.assigns(result.items)
    return result
  }

  public async getAll4User(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/EventPlanningForm/GetAllByResident', {
      params
    })
    const { result } = res.data
    result.items = RowTicketRequestEventModel.assigns(result.items)
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
}

export default new TicketEventService()
