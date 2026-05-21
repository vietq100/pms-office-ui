export class ReminderModel {
  parentId?: number
  reminderInHour?: number | null
  reminderInDay?: number
  period?: number
  isActive: boolean
  moduleId: number
  userIds: Array<any>
  emails: Array<string>

  constructor() {
    this.parentId = 0
    this.reminderInHour = null
    this.reminderInDay = 0
    this.period = 0
    this.isActive = false
    this.moduleId = 0
    this.userIds = []
    this.emails = []
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ReminderModel(), obj)
    newObj.userIds = obj.users && obj.users.length > 0 ? obj.users.map((item) => item.id) : []
    newObj.reminderInHour = obj.reminderInHour
    newObj.reminderInDay = obj.reminderInDay
    return newObj
  }
}
