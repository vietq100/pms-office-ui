import http from '../httpService'
import { NotificationModel } from '@models/common/notificationModel'

class NotificationService {
  public async getUserNotifications(params): Promise<any> {
    if (!abp.auth.getToken()) {
      return []
    }
    const res = await http.get('api/services/app/Notification/GetUserNotifications', { params })
    const result = res.data.result
    result.items = NotificationModel.assigns(result.items || [])

    return result
  }

  public async setNotificationAsRead(params): Promise<any> {
    const res = await http.post('api/services/app/Notification/SetNotificationAsRead', params)

    return res.data.result
  }

  public async setAllNotificationAsRead(): Promise<any> {
    const res = await http.post('/api/services/app/Notification/SetAllNotificationsAsRead')

    return res.data.result
  }

  public async downloadNotificationFile(): Promise<any> {
    const res = await http.post('/api/services/app/Notification/SetAllNotificationsAsRead')

    return res.data.result
  }
}

export default new NotificationService()
