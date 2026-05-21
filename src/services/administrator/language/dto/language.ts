export interface Language {
  id: number
  tenantId?: number
  name: string
  displayName?: string
  icon: string
  isDisabled?: boolean
  isEnabled: boolean
  isDeleted?: boolean
  deleterUserId?: number
  deletionTime?: Date
  lastModificationTime?: Date
  lastModifierUserId?: number
  creationTime?: Date
  creatorUserId?: number
}
