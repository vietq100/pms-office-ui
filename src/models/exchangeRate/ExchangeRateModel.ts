export class ExchangeRateModel {
  id: number
  startDate?: string
  endDate?: string

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ExchangeRateModel(), obj)

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
