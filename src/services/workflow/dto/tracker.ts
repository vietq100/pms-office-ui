export interface Tracker {
  id: number
  names: any[]
  name?: string
  isActive?: boolean
  deleterUserId?: number
  deletionTime?: Date
  lastModificationTime?: Date
  lastModifierUserId?: number
  creationTime?: Date
  creatorUserId?: number
}
