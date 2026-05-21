import { action, computed, observable, toJS, makeObservable } from 'mobx'
import { EditedEvent, EditedSingleLanguageEvent, EventModel } from '../../models/communication/Event'
import eventService from '../../services/communication/eventService'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import utils from '../../utils/utils'
import fileService from '../../services/common/fileService'
import { moduleFile } from '@lib/appconst'

class EventStore {
  @observable isLoading!: boolean
  @observable totalCount?: number
  @observable pageResult!: PagedResultDto<EventModel>
  @observable detailEvent!: EventModel
  @observable editedEvent!: EditedEvent
  @observable editSingleLanguageEvent!: {
    [lang: string]: EditedSingleLanguageEvent
  }
  @observable roles: any = []

  constructor() {
    makeObservable(this)
    this.pageResult = { items: [], totalCount: 0 }
    this.editSingleLanguageEvent = {}
  }

  @computed
  get events() {
    return this.pageResult ? toJS(this.pageResult.items) : []
  }

  @action
  computeEditedEvent() {
    const languages = utils.getLanguages()
    this.editSingleLanguageEvent = languages.reduce<any>((obj, current) => {
      obj[current.name] = {
        content:
          (this.editedEvent?.contents.find((content) => content.languageName === current.name) || {}).value || '',
        shortDescription:
          (this.editedEvent?.shortDescriptions.find((desc) => desc.languageName === current.name) || {}).value || '',
        subject: (this.editedEvent?.subjects.find((subject) => subject.languageName === current.name) || {}).value || ''
      }
      return obj
    }, {})
  }

  @action
  createEmptyEvent() {
    const languages = utils.getLanguages()
    this.editSingleLanguageEvent = languages.reduce<any>((obj, current) => {
      obj[current.name] = {
        content: '',
        shortDescription: '',
        subject: '',
        sortOrder: 1
      }
      return obj
    }, {})
  }

  @action
  updateEditedSingleLanguageEvent(language, data) {
    this.editSingleLanguageEvent = {
      ...this.editSingleLanguageEvent,
      [language]: {
        ...this.editSingleLanguageEvent[language],
        ...data
      }
    }
  }

  @action
  async create(body) {
    const result = await eventService.create(body)
    this.pageResult.items.push(result)
    return result
  }

  @action
  async update(updateEventInput) {
    const result = await eventService.update(updateEventInput)
    this.pageResult!.items = this.pageResult?.items.map((event) => {
      if (event.id === updateEventInput.id) return result
      return event
    })
  }

  @action
  async sendNotification(eventId) {
    await eventService.sendNotification(eventId)
  }

  @action
  async delete(id: number, isActive: boolean) {
    await eventService.delete(id, isActive)
  }

  @action
  async get(id: number) {
    this.detailEvent = await eventService.get(id)
  }

  @action
  async getForEdit(id: number) {
    this.editedEvent = await eventService.getForEdit(id)
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    this.pageResult = await eventService.getAll(params).finally(() => (this.isLoading = false))
  }

  @action
  resetForm() {
    this.editSingleLanguageEvent = {}
  }

  computeFormData(data, currentLang) {
    const currentLangData = {
      ...this.editSingleLanguageEvent[currentLang],
      ...data
    }
    const allLangData = {
      ...toJS(this.editSingleLanguageEvent),
      [currentLang]: currentLangData
    }
    return {
      subjects: Object.keys(allLangData).map((langKey) => ({
        languageName: langKey,
        value: allLangData[langKey].subject
      })),
      contents: Object.keys(allLangData).map((langKey) => ({
        languageName: langKey,
        value: allLangData[langKey].content
      })),
      shortDescriptions: Object.keys(allLangData).map((langKey) => ({
        languageName: langKey,
        value: allLangData[langKey].shortDescription
      }))
    }
  }

  getImage(uniqueId: string) {
    return fileService.get(uniqueId)
  }

  uploadImage(uniqueId, file) {
    return fileService.upload(moduleFile.event, uniqueId, [file])
  }
  deleteImage(imageId: string) {
    return fileService.delete(imageId)
  }
  notify(eventId: number) {
    return eventService.notify(eventId)
  }
}

export default EventStore
