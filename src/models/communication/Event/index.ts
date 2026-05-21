import { CreatorUser } from '../../../services/administrator/user/dto/creatorUser'
import { Category } from '../../category'
import { ImageFile } from '../../File'
import { buildFileUrlWithEncToken } from '@lib/helper'
import { defaultAvatar } from '@lib/appconst'
import dayjs from 'dayjs'

export enum EventType {
  PROJECT = 'SentToProject',
  UNIT = 'SentToUnit'
}

export class EventModel {
  uniqueId!: string
  subjectNameId!: string
  contentNameId!: string
  shortDescriptionNameId!: string
  subject!: string
  content?: string
  shortDescription!: string
  sortOrder?: 0
  isAllProject?: true
  projectIds!: Array<number>
  location?: string
  startTime?: Date
  endTime?: Date
  lastModificationTime?: string
  lastModifierUserId!: number
  creationTime?: string
  creatorUserId!: number
  id!: number
  creatorUser?: CreatorUser
  category?: Category
  isActive?: boolean
  file?: ImageFile
  eventType?: EventType

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new EventModel(), obj)
    newObj.startTime = obj.startTime ? dayjs(obj.startTime) : null
    newObj.endTime = obj.endTime ? dayjs(obj.endTime) : null
    if (!newObj.file) {
      newObj.file = {}
    }
    newObj.file.fileUrl = obj.file?.fileUrl ? buildFileUrlWithEncToken(obj.file?.fileUrl) : defaultAvatar
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

type EventItem = {
  languageName: string
  value: string
}

export class EditedSingleLanguageEvent {
  subject!: string
  content!: string
  shortDescription!: string
}

export class EditedEvent {
  uniqueId!: string
  subjects!: Array<EventItem>
  contents!: Array<EventItem>
  shortDescriptions!: Array<EventItem>
  sortOrder?: number
  isAllProject!: boolean
  projectIds!: Array<number>
  isActive!: boolean
  isSendNotification!: boolean
  categoryId!: number
  id?: number
  eventType?: number | string
  unitIds!: Array<number>
  projects!: Array<any>
  units!: Array<any>
}
