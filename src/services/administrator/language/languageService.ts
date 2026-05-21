import { EntityDto } from '../../dto/entityDto'
import { PagedLanguageResultRequestDto, PagedLanguageTextResultRequestDto } from './dto/PagedLanguageResultRequestDto'
import { LanguageTextDto } from './dto/languageTextDto'
import http from '../../httpService'
import type { PagedResultDto } from '../../dto/pagedResultDto'

class LanguageService {
  public async create(createLanguageInput) {
    const result = await http.post('api/services/app/Language/CreateOrUpdateLanguage', createLanguageInput)
    return result.data.result
  }

  public async update(updateLanguageInput) {
    const result = await http.put('api/services/app/Language/CreateOrUpdateLanguage', updateLanguageInput)
    return result.data.result
  }

  public async delete(entityDto: EntityDto) {
    const result = await http.delete('api/services/app/Language/DeleteLanguage', { params: entityDto })
    return result.data
  }

  public async deleteLanguageText(entityDto: EntityDto) {
    const result = await http.delete('api/services/app/Language/DeleteLanguageText', { params: entityDto })
    return result.data
  }

  public async changeLanguage(changeLanguageInput) {
    const result = await http.post('api/services/app/Language/ChangeLanguage', changeLanguageInput)
    return result.data
  }

  public async get(entityDto: EntityDto): Promise<any> {
    const result = await http.get('api/services/app/Language/GetLanguageForEdit', { params: entityDto })
    return result.data.result
  }

  public async getAll(pagedFilterAndSortedRequest: PagedLanguageResultRequestDto): Promise<any> {
    const result = await http.get('api/services/app/Language/GetLanguages', {
      params: pagedFilterAndSortedRequest
    })
    return result.data.result
  }

  // Language text
  public async createOrUpdateLanguageText(createLanguageInput) {
    const result = await http.put('api/services/app/Language/UpdateLanguageText', createLanguageInput)
    return result.data.result
  }

  public async getAllLanguageText(
    pagedFilterAndSortedRequest: PagedLanguageTextResultRequestDto
  ): Promise<PagedResultDto<LanguageTextDto>> {
    const result = await http.get('api/services/app/Language/GetLanguageTexts', { params: pagedFilterAndSortedRequest })
    return result.data.result
  }
}

export default new LanguageService()
