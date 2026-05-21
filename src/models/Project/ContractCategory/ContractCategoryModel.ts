import { LanguageValue } from '@models/global'

export interface IRowContractCategory {
  id: number
  name: string
  code: string
  sortOrder?: number
  isActive?: boolean
  children?: ContractCategoryModel[]
}

export class RowContractCategoryModel implements IRowContractCategory {
  id: number
  name: string
  code: string
  sortOrder?: number
  isActive?: boolean
  children?: ContractCategoryModel[]
  constructor() {
    this.id = 0
    this.children = []
    this.name = ''
    this.code = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowContractCategoryModel(), obj)
    newObj.children =
      obj.childs && obj.childs.length > 0 ? RowContractCategoryModel.assigns(obj.childs || []) : undefined
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class ContractCategoryModel {
  id: number
  names?: LanguageValue[]
  name: string
  code: string
  sortOrder?: number
  isActive?: boolean
  parentId?: number
  children?: ContractCategoryModel[]

  constructor(parentId?) {
    this.id = 0
    this.name = ''
    this.code = ''
    this.parentId = parentId
    this.names = LanguageValue.init([])
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ContractCategoryModel(), obj)
    newObj.parentId = obj.parent?.id
    return newObj
  }
}
