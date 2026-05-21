import { CreatorUser } from '../../../services/administrator/user/dto/creatorUser'
import { Category } from '../../category'
import { ImageFile } from '../../File'
import { buildFileUrlWithEncToken } from '@lib/helper'
import { defaultAvatar } from '@lib/appconst'

export enum EventType {
  PROJECT = 'SentToProject',
  UNIT = 'SentToUnit'
}

export class NewsModel {
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

    const newObj = Object.assign(new NewsModel(), obj)
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

type NewsItem = {
  languageName: string
  value: string
}

export class EditedSingleLanguageNews {
  subject!: string
  content!: string
  shortDescription!: string
}

export class EditedNews {
  uniqueId!: string
  subjects!: Array<NewsItem>
  contents!: Array<NewsItem>
  shortDescriptions!: Array<NewsItem>
  sortOrder?: number
  isAllProject!: boolean
  projectIds!: Array<number>
  isActive!: boolean
  categoryId!: number
  id?: number
  eventType?: number | string
  unitIds!: Array<number>
  projects!: Array<any>
  units!: Array<any>
}
