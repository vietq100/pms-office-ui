export interface IBuildingDirectoryModel {
  displayName: string
  emailAddress: string
  phoneNumber: string
  description: string
  url: string
  projectId?: number
  position: number
}

export class RowBuildingDirectoryModel implements IBuildingDirectoryModel {
  displayName: string
  emailAddress: string
  phoneNumber: string
  description: string
  url: string
  projectId?: number
  position: number
  constructor() {
    this.position = 0
    this.displayName = ''
    this.emailAddress = ''
    this.phoneNumber = ''
    this.description = ''
    this.url = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowBuildingDirectoryModel(), obj)
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class BuildingDirectoryModel implements IBuildingDirectoryModel {
  id: number
  displayName: string
  emailAddress: string
  phoneNumber: string
  description: string
  url: string
  projectId?: number
  position: number
  isActive: boolean

  constructor() {
    this.id = 0
    this.position = 0
    this.displayName = ''
    this.emailAddress = ''
    this.phoneNumber = ''
    this.description = ''
    this.url = ''
    this.isActive = true
  }

  public static assign(obj) {
    if (!obj) return undefined

    return Object.assign(new BuildingDirectoryModel(), obj)
  }
}
