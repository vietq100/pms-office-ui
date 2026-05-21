import { action, computed, observable, toJS, makeObservable } from 'mobx'
import { EditedNews, EditedSingleLanguageNews, NewsModel } from '../../models'
import newsService from '../../services/communication/newsService'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import utils from '../../utils/utils'
import fileService from '../../services/common/fileService'
import { moduleFile } from '@lib/appconst'

class NewsStore {
  @observable isLoading!: boolean
  @observable totalCount?: number
  @observable pageResult!: PagedResultDto<NewsModel>
  @observable detailNews!: NewsModel
  @observable editedNews!: EditedNews
  @observable editSingleLanguageNews!: {
    [lang: string]: EditedSingleLanguageNews
  }
  @observable roles: any = []

  constructor() {
    makeObservable(this)
    this.pageResult = { items: [], totalCount: 0 }
    this.editSingleLanguageNews = {}
  }

  @computed
  get news() {
    return this.pageResult ? toJS(this.pageResult.items) : []
  }

  @action
  computeEditedNews() {
    const languages = utils.getLanguages()
    this.editSingleLanguageNews = languages.reduce<any>((obj, current) => {
      obj[current.name] = {
        content: (this.editedNews?.contents.find((content) => content.languageName === current.name) || {}).value || '',
        shortDescription:
          (this.editedNews?.shortDescriptions.find((desc) => desc.languageName === current.name) || {}).value || '',
        subject: (this.editedNews?.subjects.find((subject) => subject.languageName === current.name) || {}).value || ''
      }
      return obj
    }, {})
  }

  @action
  createEmptyNews() {
    const languages = utils.getLanguages()
    this.editSingleLanguageNews = languages.reduce<any>((obj, current) => {
      obj[current.name] = {
        content: '',
        shortDescription: '',
        subject: ''
      }
      return obj
    }, {})
  }

  @action
  updateEditedSingleLanguageNews(language, data) {
    this.editSingleLanguageNews = {
      ...this.editSingleLanguageNews,
      [language]: {
        ...this.editSingleLanguageNews[language],
        ...data
      }
    }
  }

  @action
  async create(body) {
    const result = await newsService.create(body)
    this.pageResult.items.push(result)
    return result
  }

  @action
  async update(updateNewsInput) {
    const result = await newsService.update(updateNewsInput)
    this.pageResult!.items = this.pageResult?.items.map((news) => {
      if (news.id === updateNewsInput.id) return result
      return news
    })
  }

  @action
  async delete(id: number, isActive: boolean) {
    await newsService.delete(id, isActive)
  }

  @action
  async get(id: number) {
    this.detailNews = await newsService.get(id)
  }

  @action
  async getForEdit(id: number) {
    this.editedNews = await newsService.getForEdit(id)
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    this.pageResult = await newsService.getAll(params).finally(() => (this.isLoading = false))
  }

  @action
  resetForm() {
    this.editSingleLanguageNews = {}
  }

  computeFormData(data, currentLang) {
    const currentLangData = {
      ...this.editSingleLanguageNews[currentLang],
      ...data
    }
    const allLangData = {
      ...toJS(this.editSingleLanguageNews),
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
    return fileService.upload(moduleFile.news, uniqueId, [file])
  }
  deleteImage(imageId: string) {
    return fileService.delete(imageId)
  }
  notify(newsId: number) {
    return newsService.notify(newsId)
  }
}

export default NewsStore
