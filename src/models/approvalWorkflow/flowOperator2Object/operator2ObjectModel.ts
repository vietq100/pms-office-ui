export class RowOperator2ObjectModel {
  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowOperator2ObjectModel(), obj)

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class Operator2ObjectModel {
  id: number
  requestTypeId?: number

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new Operator2ObjectModel(), obj)
    newObj.requestTypeId = obj.request ? obj.request?.id : null
    return newObj
  }
}

export class Company2ObjectModel {
  id: number
  requestTypeId?: number

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new Company2ObjectModel(), obj)
    newObj.requestTypeId = obj.request ? obj.request?.id : null
    return newObj
  }
}
