import { action, makeObservable, observable } from 'mobx'

import { CreateOrUpdateUserInput } from '../../services/administrator/user/dto/createOrUpdateUserInput'
import { EntityDto } from '../../services/dto/entityDto'
import { GetRoles } from '../../services/administrator/user/dto/getRolesOuput'
import { GetUserOutput } from '../../services/administrator/user/dto/getUserOutput'
import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import { PagedUserResultRequestDto } from '../../services/administrator/user/dto/PagedUserResultRequestDto'
import { UpdateUserInput } from '../../services/administrator/user/dto/updateUserInput'
import userService from '../../services/administrator/user/userService'
import { compressImage } from '../../lib/helper'
import { defaultAvatar } from '../../lib/appconst'

class UserStore {
  @observable isLoading!: boolean
  @observable users!: PagedResultDto<GetUserOutput>
  @observable editUser!: CreateOrUpdateUserInput
  @observable roles: GetRoles[] = []
  @observable editUserProfilePicture!: string

  constructor() {
    this.editUserProfilePicture = defaultAvatar
    makeObservable(this)
  }

  @action
  async create(createUserInput: CreateOrUpdateUserInput) {
    const result = await userService.create(createUserInput)
    this.users.items.push(result)
  }

  @action
  async update(updateUserInput: UpdateUserInput) {
    const result = await userService.update(updateUserInput)
    this.users.items = this.users.items.map((x: GetUserOutput) => {
      if (x.id === updateUserInput.id) x = result
      return x
    })
  }

  @action
  async delete(entityDto: EntityDto) {
    await userService.delete(entityDto)
    this.users.items = this.users.items.filter((x: GetUserOutput) => x.id !== entityDto.id)
  }

  @action
  async getRoles() {
    const result = await userService.getRoles()
    this.roles = result
  }

  @action
  async get(entityDto: EntityDto) {
    const result = await userService.get(entityDto)
    this.editUser = result
  }

  @action
  async createUser() {
    this.editUser = {
      userName: '',
      name: '',
      surname: '',
      emailAddress: '',
      isActive: true,
      roleNames: [],
      password: '',
      id: 0
    }

    this.roles = []
  }

  @action
  async getAll(pagedFilterAndSortedRequest: PagedUserResultRequestDto) {
    this.isLoading = true
    const result = await userService.getAll(pagedFilterAndSortedRequest).finally(() => (this.isLoading = false))
    this.users = result
  }

  async changeLanguage(languageName: string) {
    await userService.changeLanguage({ languageName: languageName })
  }

  @action
  async getProfilePicture(profilePictureId) {
    const result = await userService.getProfilePictureById(profilePictureId)
    this.editUserProfilePicture = result || defaultAvatar
  }

  @action
  async uploadProfilePicture(file) {
    const compressedImage = await compressImage(file, 1024)
    const result = await userService.uploadProfilePicture(compressedImage)
    return result
  }

  @action
  async updateProfilePicture(data) {
    const profilePictureId = await userService.updateProfilePicture(data)
    await this.getProfilePicture(profilePictureId)
  }
}

export default UserStore
