import { ChangeLanguagaInput } from './dto/changeLanguageInput'
import { CreateOrUpdateUserInput } from './dto/createOrUpdateUserInput'
import { EntityDto } from '../../dto/entityDto'
import { GetAllUserOutput } from './dto/getAllUserOutput'
import type { PagedResultDto } from '../../dto/pagedResultDto'
import { PagedUserResultRequestDto } from './dto/PagedUserResultRequestDto'
import { UpdateUserInput } from './dto/updateUserInput'
import orderBy from 'lodash/orderBy'
import http from '../../httpService'

class UserService {
  public async create(createUserInput: CreateOrUpdateUserInput) {
    const result = await http.post('api/services/app/User/Create', createUserInput)
    return result.data.result
  }

  public async update(updateUserInput: UpdateUserInput) {
    const result = await http.put('api/services/app/User/Update', updateUserInput)
    return result.data.result
  }

  public async delete(entityDto: EntityDto) {
    const result = await http.delete('api/services/app/User/Delete', {
      params: entityDto
    })
    return result.data
  }

  public async getRoles() {
    const result = await http.get('api/services/app/User/GetRoles')
    return orderBy(result.data.result.items || [], 'displayName')
  }

  public async changeLanguage(changeLanguageInput: ChangeLanguagaInput) {
    const result = await http.post('api/services/app/User/ChangeLanguage', changeLanguageInput)
    return result.data
  }

  public async get(entityDto: EntityDto): Promise<CreateOrUpdateUserInput> {
    const result = await http.get('api/services/app/User/Get', {
      params: entityDto
    })
    return result.data.result
  }

  public async getAll(
    pagedFilterAndSortedRequest: PagedUserResultRequestDto
  ): Promise<PagedResultDto<GetAllUserOutput>> {
    const result = await http.get('api/services/app/User/GetAll', {
      params: pagedFilterAndSortedRequest
    })
    return result.data.result
  }

  public async getMyProfilePicture() {
    const result = await http.get('api/services/app/Profile/GetProfilePicture')
    const profilePictureUrl = result.data.result?.profilePicture
      ? `data:image/jpeg;base64,${result.data.result.profilePicture}`
      : undefined
    return profilePictureUrl
  }

  public async getProfilePictureById(profilePictureId) {
    const result = await http.get('api/services/app/Profile/GetProfilePictureById', { params: { profilePictureId } })
    const profilePictureUrl = result.data.result?.profilePicture
      ? `data:image/jpeg;base64,${result.data.result.profilePicture}`
      : undefined
    return profilePictureUrl
  }

  public async uploadProfilePicture(file) {
    const data = new FormData()
    data.append('file', file)
    const result = await http.post('api/Profile/UploadProfilePicture', data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
    return result.data.result
  }

  public async updateMyProfilePicture(body: any) {
    const result = await http.put('api/services/app/Profile/UpdateMyProfilePicture', body)
    return result.data.result
  }

  public async updateProfilePicture(body: any) {
    const result = await http.put('api/services/app/Profile/UpdateProfilePicture', body)
    return result.data.result
  }

  public async updateMyProfile(body: any) {
    const result = await http.put('api/services/app/Profile/UpdateCurrentUserProfile', body)
    return result.data.result
  }
}

export default new UserService()
