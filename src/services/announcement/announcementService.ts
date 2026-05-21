import http from '@services/httpService'
import { notifySuccess, renderDateTime } from '@lib/helper'
import { LNotification } from '@lib/abpUtility'
import { RowAnnouncementModel, AnnouncementDetailModel, AnnouncementUserLogModel } from '@models/announcement'
import moment from 'moment-timezone/moment-timezone'
import { downloadFile } from '@lib/helperFile'
import dayjs from 'dayjs'

class AnnouncementService {
  public async create(body, files?) {
    const formData = new FormData()
    ;(files || []).forEach((file, index) => {
      const partName = `part${index}`
      formData.append(partName, file, file.name)
    })
    formData.append(`model`, JSON.stringify(body))

    const result = await http.post('api/Campaigns/Create', formData)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))

    return result.data.result
  }

  public async update(body) {
    const result = await http.put('api/services/app/Campaigns/Update', {
      id: body.id,
      content: body.content,
      subject: body.subject
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))

    return result.data.result
  }
  public async activateOrDeactivate(id, isActive) {
    const result = await http.post('api/services/app/Campaigns/Active', { id }, { params: { isActive } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async publishAnnouncement(id) {
    const result = await http.post('api/services/app/Campaigns/PublishCampaign', {
      id
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async delete(id) {
    const result = await http.delete('api/services/app/Campaigns/Delete', {
      params: { id }
    })
    return result.data
  }

  public async get(id): Promise<any> {
    const result = await http.get('api/services/app/Campaigns/Get', {
      params: { id }
    })

    return AnnouncementDetailModel.assign(result.data.result || {})
  }

  public async getLogs(params): Promise<any> {
    const res = await http.get('api/services/app/Campaigns/GetLogs', { params })
    const { result } = res.data

    result.items = AnnouncementUserLogModel.assigns(result.items || [])
    return result
  }

  public async getAll(params): Promise<any> {
    const [fromDate, toDate] = params.dateFromTo ? params.dateFromTo : [undefined, undefined]
    if (fromDate && toDate) {
      params.fromDate = moment(fromDate).startOf('date').toDate()
      params.toDate = moment(toDate).toDate()
      delete params.dateFromTo
    }

    const res = await http.get('api/services/app/Campaigns/GetAll', {
      params: params
    })
    const { result } = res.data
    result.items = RowAnnouncementModel.assigns(result.items)
    return result
  }

  public async getAnnouncementUsers(body): Promise<any> {
    const res = await http.post('api/services/app/Campaigns/GetCampaignUsers', body)
    const data = AnnouncementUserLogModel.assigns(res.data?.result || [])
    return { totalCount: data.length || 0, items: data }
  }

  public async getOverview(params) {
    const res = await http.get('api/services/app/Campaigns/GetOverviewCampaign', { params })

    return res.data?.result
  }

  public async getListCategories(params): Promise<any> {
    const res = await http.get('api/services/app/Campaigns/GetCampaignCategories', { params })

    return res.data.result
  }

  public async exportCampaigns(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportCampaigns', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `Campaigns${renderDateTime(dayjs())}.xlsx`)
  }
}

export default new AnnouncementService()
