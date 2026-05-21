export class PMCountStatusModel {
  id?: number
  name: string
  borderColorCode: string
  code: string
  colorCode: string
  count?: number
  guid: string
  parentId?: number

  constructor() {
    this.id = undefined
    this.name = ''
    this.guid = ''
    this.borderColorCode = ''
    this.code = ''
    this.colorCode = ''
    this.count = undefined
    this.guid = ''
    this.parentId = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new PMCountStatusModel(), obj)

    return newObj
  }

  public static assigns(objs) {
    return objs.map((item) => PMCountStatusModel.assign(item))
  }
}
