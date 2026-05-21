import dayjs from 'dayjs'

export class RowTicketRequestModel {
  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowTicketRequestModel(), obj)

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class TicketRequestModel {
  id: number
  startDate?: string
  endDate?: string

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new TicketRequestModel(), obj)
    newObj.startDate = obj.startDate ? dayjs(obj.startDate) : null
    newObj.endDate = obj.endDate ? dayjs(obj.endDate) : null

    return newObj
  }
}

export class RequestHistoryModel {
  id: number
  lastModificationTime?: string
  canSendRequest?: boolean
  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RequestHistoryModel(), obj)
    newObj.lastModificationTime = obj.lastModificationTime ? dayjs(obj.startDate) : null

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
