import { WorkflowModel } from '../../Workflow/WorkflowModel'
import { UserModel } from '@models/User/IUserModel'

export interface IRowWorkOrder {
  user?: UserModel
}

export class RowWorkOrderModel implements IRowWorkOrder {
  user?: UserModel

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowWorkOrderModel(), obj)
    newObj.user = UserModel.assign(obj.user || {})
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class WorkOrderModel {
  id: number
  userId?: number
  unitId?: number
  user?: any
  unit?: any
  workflow?: any
  fullUnitCode?: string
  unitUserId?: string
  wfUniqueId?: string

  constructor() {
    this.id = 0
    this.userId = 0
    this.unitId = 0
    this.user = {}
    this.unit = {}
    this.workflow = new WorkflowModel()
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new WorkOrderModel(), obj)
    newObj.workflow = obj.workflow ? WorkflowModel.assign(obj.workflow) : {}
    newObj.projectId = obj.project?.id
    newObj.unitId = obj.unit?.id
    newObj.userId = obj.user?.id
    newObj.fullUnitCode = obj.unit?.fullUnitCode
    newObj.unitUserId = `${newObj.unitId}-${newObj.userId}`
    newObj.wfUniqueId = obj.workflow?.uniqueId
    return newObj
  }
}
