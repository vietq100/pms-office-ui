export interface IInventoryCategoryName {
  languageName: string
  value: string
}

export class InventoryCategoryModel {
  id: number
  names: Array<any>
  parent: any
  sortOrder: number
  isActive: boolean
  description: string
  name: string
  nameId: string
  childs: Array<any>

  constructor() {
    this.id = 0
    this.name = ''
    this.description = ''
    this.names = []
    this.sortOrder = 0
    this.isActive = false
    this.nameId = ''
    this.childs = []
    this.parent = {}
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new InventoryCategoryModel(), obj)
    newObj.id = obj.id
    newObj.name = obj.name
    newObj.description = obj.description
    newObj.names = obj.names
    newObj.isActive = obj.isActive
    newObj.nameId = obj.nameId
    newObj.childs = obj.childs
    newObj.parent = obj.parent
    if (obj.parent && obj.parent.id !== undefined) {
      newObj.parentId = obj.parent.id
    }
    if (obj.childs && obj.childs.length > 0) {
      newObj.children = obj.childs
    }

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
