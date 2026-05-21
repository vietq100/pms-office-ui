export class InventoryModel {
  id: number
  name: string
  description: string

  constructor() {
    this.id = 0
    this.name = ''
    this.description = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new InventoryModel(), obj)
    newObj.id = obj.id
    newObj.name = obj.name
    newObj.description = obj.description

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
