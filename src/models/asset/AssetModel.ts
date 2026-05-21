import { L } from '@lib/abpUtility'
import dayjs from 'dayjs'

export interface IAssetModel {
  nameId: string
  name: string
  isActive: boolean
  sortOrder: number
  id: number
}

export class AssetModel {
  id?: number
  guid?: string
  code?: string
  documentId?: string
  assetName: string
  purchasedDate?: Date
  warrantDate?: Date
  quantity: number
  price?: number
  serialNumber: string
  description: string
  companyId?: number
  assetTypeId?: number
  isActive: boolean
  company: any
  reminder: any
  projectId?: number

  constructor() {
    this.id = undefined
    this.assetName = ''
    this.code = ''
    this.purchasedDate = undefined
    this.warrantDate = undefined
    this.quantity = 0
    this.price = 0
    this.serialNumber = ''
    this.description = ''
    this.companyId = undefined
    this.assetTypeId = undefined
    this.isActive = true
    this.projectId = undefined
    this.company = {}
    this.reminder = {
      isActive: false,
      parentId: 0,
      reminderInMinute: 0,
      period: 0,
      userIds: [],
      emails: []
    }
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = {
      ...new AssetModel(),
      ...obj,
      projectId: obj.projectId ? obj.projectId : null,
      purchasedDate: obj.purchasedDate ? dayjs(obj.purchasedDate) : undefined,
      warrantDate: obj.warrantDate ? dayjs(obj.warrantDate) : undefined,
      key: obj.id
    }
    if (newObj.reminder && newObj.reminder.users && newObj.reminder.users.length && newObj.reminder.isActive) {
      newObj.reminder.userIds = newObj.reminder.users.map((u) => u.id)
    }
    if (newObj.warrantDate) {
      const currentDate = dayjs(new Date())
      newObj.expiredInDays = dayjs(newObj.warrantDate).diff(currentDate, 'days')
      newObj.expiredInDays = newObj.expiredInDays > -1 ? newObj.expiredInDays : L('EXPIRED')
    }
    return newObj
  }

  public static assigns(items): AssetModel[] {
    return items.map((item) => AssetModel.assign(item))
  }
}
