import { action, observable, makeObservable } from 'mobx'

import { GetCurrentLoginInformations } from '../services/session/dto/getCurrentLoginInformations'
import sessionService from '../services/session/sessionService'
import userService from '../services/administrator/user/userService'
import { compressImage } from '../lib/helper'
import AppConsts from '@lib/appconst'
import projectService from '@services/project/projectService'
import tokenAuthService from '../services/tokenAuth/tokenAuthService'
import * as global from '@models/global'

import { refreshAbpConfiguration } from '@components/Layout/SplashScreen'

const { authorization } = AppConsts

const defaultAvatar = '/assets/images/logo.png'
class SessionStore {
  @observable currentLogin: GetCurrentLoginInformations = new GetCurrentLoginInformations()
  @observable profilePicture!: string
  @observable appSettingConfiguration!: global.AppSettingConfiguration
  @observable ownProjects: any = []
  @observable project: any = {}
  @observable hostSetting!: global.HostSettingConfiguration
  @observable userAccountType!: string

  constructor() {
    this.project = {}
    this.appSettingConfiguration = new global.AppSettingConfiguration()
    this.userAccountType = ''
    makeObservable(this)
  }

  get projectId() {
    return parseInt((localStorage.getItem(authorization.projectId) || 0).toString())
  }
  @action async getHostSetting() {
    const res = await sessionService.getHostSetting()
    this.hostSetting = res
    return res
  }
  @action async changeHostSetting(body) {
    const res = await sessionService.changeHostSetting({
      ...this.hostSetting,
      ...body
    })
    this.hostSetting = res
    return res
  }
  @action
  async getCurrentLoginInformations() {
    const result = await sessionService.getCurrentLoginInformations()
    this.currentLogin = result
    this.userAccountType = result.user?.roleNames[0]

    // Set abp.session từ kết quả API
    if (typeof abp !== 'undefined' && result.user) {
      abp.session.userId = result.user.id
      abp.session.tenantId = result.tenant?.id || null
      abp.session.userName = result.user.userName

      // Refresh ABP configuration để cập nhật permissions sau khi login
      await refreshAbpConfiguration()
    }
  }

  @action
  async refreshUserConfiguration() {
    // Method để refresh ABP configuration manually khi cần
    await refreshAbpConfiguration()
  }

  @action
  async getWebConfiguration() {
    const result = await sessionService.getWebConfiguration()
    this.appSettingConfiguration = result
  }

  @action
  async getMyProfilePicture() {
    const result = await userService.getMyProfilePicture()
    this.profilePicture = result || defaultAvatar
  }

  @action
  async uploadMyProfilePicture(file) {
    const compressedImage = await compressImage(file, 1024)
    const result = await userService.uploadProfilePicture(compressedImage)
    return result
  }

  @action
  async updateMyProfilePicture(data) {
    await userService.updateMyProfilePicture(data)
    await this.getMyProfilePicture()
  }

  @action
  async updateMyProfile(data) {
    await userService.updateMyProfile(data)
    this.currentLogin.user = data
  }

  @action
  async logout() {
    abp.utils.deleteCookie(AppConsts.authorization.encrptedAuthTokenName, abp.appPath)
    abp.utils.deleteCookie(AppConsts.authorization.projectId, abp.appPath)

    localStorage.clear()
    sessionStorage.clear()
    abp.auth.clearToken()

    window.location.href = '/account/login'
  }

  @action
  async getOwnProjects(params: any) {
    params.maxResultCount = 1000
    params.isActive = true
    params.sorting = 'Name ASC'
    this.ownProjects = await projectService.filterOptions(params)
    this.project = (this.ownProjects || []).find((item) => item.id === this.projectId)
  }

  @action
  async changeProject(project?, unitName?) {
    let result
    if (!project) {
      result = await tokenAuthService.switchProjectSSO().then((projeInfo) => (this.project = projeInfo))
    } else {
      result = await tokenAuthService.switchProject(project.id).finally(() => (this.project = project))
    }
    const tokenExpireDate = new Date(new Date().getTime() + 1000 * result.expireInSeconds)
    abp.auth.setToken(result.accessToken, tokenExpireDate)
    abp.utils.setCookieValue(
      AppConsts.authorization.encrptedAuthTokenName,
      result.encryptedAccessToken,
      tokenExpireDate,
      abp.appPath
    )
    localStorage.setItem(authorization.unitDisplayName, unitName)
    localStorage.setItem(authorization.projectPictureUrl, project ? project.file?.fileUrl : result?.fileUrl)
    localStorage.setItem(authorization.projectId, project ? project.id : result?.projectId)

    localStorage.setItem(authorization.project, JSON.stringify(project ? project : result?.project))
  }
}

export default SessionStore
