export class PropertyConfigurationModel {
  rows: PropertyConfigurationRow[]
  status: any[]
  moduleId: number
  trackerId?: number
  roleId?: number

  constructor() {
    this.rows = []
    this.status = []
    this.moduleId = 0
    this.trackerId = undefined
    this.roleId = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new PropertyConfigurationModel(), obj)

    newObj.rows = PropertyConfigurationRow.assigns(obj.rows)
    return newObj
  }
}

export class PropertyConfigurationRow {
  propertyName: string
  items: ConfigurationItem[]

  constructor() {
    this.propertyName = ''
    this.items = []
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new PropertyConfigurationRow(), obj)

    newObj.items = ConfigurationItem.assigns(obj.items)
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class ConfigurationItem {
  statusId: number
  isReadOnly: boolean
  isVisible: boolean
  isRequired: boolean
  isChecked: boolean

  constructor() {
    this.statusId = 0
    this.isReadOnly = false
    this.isVisible = false
    this.isRequired = false
    this.isChecked = false
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new ConfigurationItem(), obj)

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

// Custom Field
export class CustomFieldConfigurationModel {
  rows: CustomFieldConfigurationRow[]
  status: any[]
  moduleId: number
  trackerId?: number
  roleId?: number

  constructor() {
    this.rows = []
    this.status = []
    this.moduleId = 0
    this.trackerId = undefined
    this.roleId = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new CustomFieldConfigurationModel(), obj)

    newObj.rows = CustomFieldConfigurationRow.assigns(obj.rows, obj.customFields)
    return newObj
  }
}

export class CustomFieldConfigurationRow {
  customFieldId: string
  customFieldName: string
  items: ConfigurationItem[]

  constructor() {
    this.customFieldId = ''
    this.customFieldName = ''
    this.items = []
  }

  public static assign(obj, customFields) {
    if (!obj) return undefined

    const newObj = Object.assign(new CustomFieldConfigurationRow(), obj)
    newObj.customFieldName = ((customFields || []).find((item) => item.id === obj.customFieldId) || {}).name
    newObj.items = ConfigurationItem.assigns(obj.items)
    return newObj
  }

  public static assigns(objs, customFields) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item, customFields)))
    return results
  }
}

// Status Transition
export class StatusTransitionModel {
  rows: StatusTransitionRow[]
  status: any[]
  moduleId: number
  trackerId?: number
  roleId?: number

  constructor() {
    this.rows = []
    this.status = []
    this.moduleId = 0
    this.trackerId = undefined
    this.roleId = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new StatusTransitionModel(), obj)

    newObj.rows = StatusTransitionRow.assigns(obj.rows, obj.status)
    return newObj
  }
}

export class StatusTransitionRow {
  statusId: string
  statusName: string
  items: ConfigurationItem[]

  constructor() {
    this.statusId = ''
    this.statusName = ''
    this.items = []
  }

  public static assign(obj, status) {
    if (!obj) return undefined

    const newObj = Object.assign(new StatusTransitionRow(), obj)

    newObj.statusName = ((status || []).find((item) => item.id === obj.statusId) || {}).name
    newObj.items = ConfigurationItem.assigns(obj.items)
    return newObj
  }

  public static assigns(objs, status) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item, status)))
    return results
  }
}
