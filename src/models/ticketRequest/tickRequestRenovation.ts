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

export class TicketRenovationModel {
  id: number
  startDate?: string
  endDate?: string
  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new TicketRenovationModel(), obj)
    newObj.startDate = obj.startDate ? dayjs(obj.startDate) : null
    newObj.endDate = obj.endDate ? dayjs(obj.endDate) : null

    if (Array.isArray(newObj.airConditioners)) {
      newObj.airConditioners = newObj.airConditioners.map(({ startTime, endTime, ...rest }) => {
        return {
          ...rest,
          startDate: dayjs.utc(startTime),
          endDate: dayjs.utc(endTime),
          startTime: dayjs.utc(startTime),
          endTime: dayjs.utc(endTime)
        }
      })
    }

    return newObj
  }

  public static assigns(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new TicketRenovationModel(), obj)

    // Format airConditioners' dates and times
    if (Array.isArray(newObj.airConditioners)) {
      newObj.airConditioners = newObj.airConditioners.map(({ startDate, endDate, ...rest }) => {
        const formattedStartDate = startDate ? dayjs(startDate).format('YYYY-MM-DD') : null
        const formattedEndDate = endDate ? dayjs(endDate).format('YYYY-MM-DD') : null
        const formattedStartTime = rest.startTime ? dayjs(rest.startTime).format('HH:mm:ss') : null
        const formattedEndTime = rest.endTime ? dayjs(rest.endTime).format('HH:mm:ss') : null

        return {
          ...rest,
          startTime: formattedStartDate && formattedStartTime ? `${formattedStartDate}T${formattedStartTime}` : null,
          endTime: formattedEndDate && formattedEndTime ? `${formattedEndDate}T${formattedEndTime}` : null
        }
      })
    }

    return newObj
  }
}

export class TicketParkingOvertimeModel {
  id: number
  fromDate?: string
  toDate?: string
  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new TicketRenovationModel(), obj)
    obj.fromDate && (newObj.fromDate = dayjs(obj.fromDate))
    obj.toDate && (newObj.toDate = dayjs(obj.toDate))
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
