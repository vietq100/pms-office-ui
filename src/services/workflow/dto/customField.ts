export interface CustomField {
  id: number
  names: any[]
  name?: string
  descriptions: any[]
  fieldType?: number
  regexp?: string
  position?: number
  minLength?: number
  maxLength?: number
  defaultValue?: string
  possibleValues?: any
  isRequired?: boolean
  isActive?: boolean
  deleterUserId?: number
  deletionTime?: Date
  lastModificationTime?: Date
  lastModifierUserId?: number
  creationTime?: Date
  creatorUserId?: number
}
