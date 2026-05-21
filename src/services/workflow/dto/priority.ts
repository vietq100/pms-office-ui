export interface Priority {
  id: number
  names: any[]
  name?: string
  isActive?: boolean
  isDefault?: boolean
  deleterUserId?: number
  deletionTime?: Date
  lastModificationTime?: Date
  lastModifierUserId?: number
  creationTime?: Date
  creatorUserId?: number
}
