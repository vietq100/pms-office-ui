import http from '@services/httpService'
import { BannerModel, IBanner } from '@models/communication/banner/bannerModel'
import { notifySuccess } from '@lib/helper'
import appConsts from '@lib/appconst'
import { LNotification } from '@lib/abpUtility'
import { OptionModel } from '@models/global'
import { FileImageOutlined } from '@ant-design/icons'
import { NotificationOutlined, VideoCameraOutlined } from '@ant-design/icons'

const { announcementTypeCodes } = appConsts

class BannerWelcomeService {
  public async create(body) {
    if (body.fromToDate) {
      const [startDate, endDate] = body.fromToDate
      body.startDate = startDate
      body.endDate = endDate
    }
    const result = await http.post('api/services/app/Announcement/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body) {
    if (body.fromToDate) {
      const [startDate, endDate] = body.fromToDate
      body.startDate = startDate
      body.endDate = endDate
    }

    const result = await http.put('api/services/app/Announcement/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async activateOrDeactivate(ids, isActive) {
    const result = await http.post('api/services/app/Announcement/MultiActives', [ids], { params: { isActive } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async delete(id) {
    const result = await http.delete('api/services/app/Announcement/Delete', {
      params: { id }
    })
    return result.data
  }

  public async get(id): Promise<any> {
    const result = await http.get('api/services/app/Announcement/Get', {
      params: { id }
    })
    return BannerModel.assign(result.data.result || {})
  }

  public async filter(params): Promise<any> {
    const res = await http.get('api/services/app/Announcement/GetAll', {
      params: params
    })
    const result = res.data.result
    result.items = BannerModel.assigns(result.items)
    return result
  }

  public async getAll(params): Promise<IBanner[]> {
    const res = await http.get('api/services/app/Announcement/GetLists', {
      params
    })
    return Promise.resolve(res.data.result)
  }

  public async getBannerWelcomeTypes() {
    const result = await http.get('api/services/app/Announcement/GetAnnouncementTypes')
    const data = OptionModel.assigns(result.data?.result || [])
    return data.map((item) => {
      item.icon =
        item.code === announcementTypeCodes.picture
          ? FileImageOutlined
          : item.code === announcementTypeCodes.video
          ? VideoCameraOutlined
          : NotificationOutlined
      return item
    })
  }
}

export default new BannerWelcomeService()
