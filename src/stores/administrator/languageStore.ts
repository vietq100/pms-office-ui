import { action, makeObservable, observable } from 'mobx'

import { EntityDto } from '../../services/dto/entityDto'
import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import {
  PagedLanguageResultRequestDto,
  PagedLanguageTextResultRequestDto
} from '../../services/administrator/language/dto/PagedLanguageResultRequestDto'
import { Language } from '../../services/administrator/language/dto/language'
import { LanguageTextDto, LanguageTextInputDto } from '../../services/administrator/language/dto/languageTextDto'
import languageService from '../../services/administrator/language/languageService'

class LanguageStore {
  @observable isLoading!: boolean
  @observable languages!: PagedResultDto<Language>
  @observable languageTexts!: PagedResultDto<LanguageTextDto>
  @observable editLanguage!: Language
  @observable editLanguageText!: LanguageTextInputDto

  constructor() {
    makeObservable(this)
  }
  @action
  async create(createLanguageInput) {
    const result = await languageService.create(createLanguageInput)
    this.languages.items.push(result)
  }

  @action
  async update(updateLanguageInput) {
    const result = await languageService.update(updateLanguageInput)
    this.languages.items = this.languages.items.map((x) => {
      if (x.id === updateLanguageInput.id) x = result
      return x
    })
  }

  @action
  async delete(entityDto: EntityDto) {
    await languageService.delete(entityDto)
    this.languages.items = this.languages.items.filter((x) => x.id !== entityDto.id)
  }

  @action
  async deleteLanguageText(entityDto: EntityDto) {
    await languageService.deleteLanguageText(entityDto)
  }

  @action
  async get(entityDto: EntityDto) {
    const result = await languageService.get(entityDto)
    this.editLanguage = result
  }

  @action
  async createLanguage() {
    this.editLanguage = {
      id: 0,
      name: '',
      icon: '',
      isEnabled: true
    }
  }
  @action
  async createLanguageText(languageText?) {
    this.editLanguageText = languageText || {
      languageName: '',
      sourceName: '',
      key: '',
      value: ''
    }
  }

  @action
  async getAll(pagedFilterAndSortedRequest: PagedLanguageResultRequestDto) {
    this.isLoading = true
    const result = await languageService.getAll(pagedFilterAndSortedRequest).finally(() => (this.isLoading = false))
    this.languages = result
  }

  // Language text
  @action
  async createOrUpdateLanguageText(body) {
    this.isLoading = true
    const result = await languageService.createOrUpdateLanguageText(body).finally(() => (this.isLoading = false))
    this.languageTexts.items.push(result)
  }

  @action
  async getAllLanguageText(pagedFilterAndSortedRequest: PagedLanguageTextResultRequestDto) {
    this.isLoading = true
    const result = await languageService
      .getAllLanguageText(pagedFilterAndSortedRequest)
      .finally(() => (this.isLoading = false))
    this.languageTexts = result
  }

  async changeLanguage(languageName: string) {
    await languageService.changeLanguage({ languageName: languageName })
  }
}

export default LanguageStore
