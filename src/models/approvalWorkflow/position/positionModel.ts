import { UserModel } from '@models/User/IUserModel'

export class RowPositionApprovalModel {
  user?: UserModel

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowPositionApprovalModel(), obj)

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class PositionApprovalModel {
  id: number
  companyId?: number
  userIds?: number[]

  constructor() {
    this.id = 0
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new PositionApprovalModel(), obj)
    newObj.companyId = obj.company ? obj.company?.id : null
    newObj.userIds = obj.users.map((item) => item.id)
    return newObj
  }
}
