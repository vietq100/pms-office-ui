import http from '@services/httpService'
import { notifySuccess } from '@lib/helper'
import { LNotification } from '@lib/abpUtility'
import {
  RowNotificationTemplateModel,
  NotificationTemplateDetailModel,
  NotificationTypeModel
} from '@models/NotificationTemplate'

class NotificationTemplateService {
  public async create(body) {
    const result = await http.post('api/services/app/TemplateNotify/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body: NotificationTemplateDetailModel) {
    if (!body) {
      return
    }
    Object.keys(body.templateLanguages).forEach((key) => {
      const index = (body.notificationTemplates || []).findIndex((item) => item.languageName === key)
      if (index === -1) {
        return
      }

      body.notificationTemplates[index] = {
        ...body.notificationTemplates[index],
        ...body.templateLanguages[key]
      }
    })

    delete body.templateLanguages

    const result = await http.put('api/services/app/TemplateNotify/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async activateOrDeactivate(id, isActive) {
    const result = await http.post('api/services/app/TemplateNotify/Active', {
      id,
      isActive
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async delete(id) {
    const result = await http.delete('api/services/app/TemplateNotify/Delete', {
      params: { id }
    })
    return result.data
  }

  public async get(id): Promise<any> {
    const result = await http.get('api/services/app/TemplateNotify/GetTemplate', { params: { id } })
    return NotificationTemplateDetailModel.assign(result.data.result || {})
  }

  public async getProjectTemplate(params): Promise<any> {
    const result = await http.get('api/services/app/TemplateNotify/GetProjectTemplate', { params })
    return NotificationTemplateDetailModel.assign(result.data.result || {})
  }
  public async getNotificationTypes(code): Promise<any> {
    const result = await http.post('api/services/app/TemplateNotify/GetNotificationTypes', null, { params: { code } })
    return result.data.result
  }

  public async getNotificationType(params): Promise<any> {
    const result = await http.get('api/services/app/TemplateNotify/GetNotificationTypes', { params })

    return NotificationTypeModel.assigns(result.data.result || [])
  }

  public async getParameters(code): Promise<any> {
    const result = await http.post('api/services/app/TemplateNotify/GetParameters', null, { params: { code } })
    return result.data.result
  }

  public async getAllTemplateFee(params): Promise<any> {
    const res = await http.get('api/services/app/TemplateNotify/GetAllFeeNotification', {
      params: params
    })
    const { result } = res.data
    result.items = RowNotificationTemplateModel.assigns(result.items)

    return result
  }

  public async getAll(params): Promise<any> {
    const res = await http.get('api/services/app/TemplateNotify/GetAll', {
      params: params
    })
    const { result } = res.data
    result.items = RowNotificationTemplateModel.assigns(result.items)

    return result
  }

  public async getList(params): Promise<RowNotificationTemplateModel[]> {
    const res = await http.get('api/services/app/TemplateNotify/GetListTemplates', { params })
    return Promise.resolve(res.data.result)
  }

  public async getListModules(): Promise<any[]> {
    const res = await http.get('api/services/app/TemplateNotify/GetListModules')
    return Promise.resolve(res.data.result)
  }
}

export default new NotificationTemplateService()
