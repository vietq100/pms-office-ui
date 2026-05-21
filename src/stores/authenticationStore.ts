import { action, observable, makeObservable } from 'mobx'

import AppConsts from './../lib/appconst'
import LoginModel from '../models/account/Login/loginModel'
import tokenAuthService from '../services/tokenAuth/tokenAuthService'
import { TenantLoginModel } from '@services/tokenAuth/dto/authenticationModel'

declare let abp: any

class AuthenticationStore {
  @observable isLoading!: boolean
  @observable phoneLoginModel!: any
  @observable loginModel: LoginModel = new LoginModel()
  @observable firebaseBody: any = {}
  get isAuthenticated(): boolean {
    if (!abp.session.userId) return false

    return true
  }
  constructor() {
    makeObservable(this)
  }
  @action
  public async login(model: LoginModel) {
    this.isLoading = true
    const result = await tokenAuthService
      .authenticate({
        userNameOrEmailAddress: model.userNameOrEmailAddress,
        password: model.password,
        rememberClient: model.rememberMe
      })
      .finally(() => (this.isLoading = false))

    const tokenExpireDate = model.rememberMe
      ? new Date(new Date().getTime() + 1000 * result.expireInSeconds)
      : undefined
    abp.auth.setToken(result.accessToken, tokenExpireDate)
    abp.utils.setCookieValue(
      AppConsts.authorization.encrptedAuthTokenName,
      result.encryptedAccessToken,
      tokenExpireDate,
      abp.appPath
    )
    abp.utils.setCookieValue(
      AppConsts.authorization.encrptedAuthTokenName,
      result.encryptedAccessToken,
      tokenExpireDate,
      abp.appPath
    )
  }

  @action public async loginAsTenant(model: LoginModel): Promise<TenantLoginModel> {
    this.isLoading = true
    const result: TenantLoginModel = await tokenAuthService
      .authenticateAsTenant({
        userNameOrEmailAddress: model.userNameOrEmailAddress,
        password: model.password,
        rememberClient: model.rememberMe
      })
      .finally(() => (this.isLoading = false))

    const tokenExpireDate = model.rememberMe
      ? new Date(new Date().getTime() + 1000 * result.expireInSeconds)
      : undefined
    abp.auth.setToken(result.accessToken, tokenExpireDate)
    abp.utils.setCookieValue(
      AppConsts.authorization.encrptedAuthTokenName,
      result.encryptedAccessToken,
      tokenExpireDate,
      abp.appPath
    )
    abp.utils.setCookieValue(
      AppConsts.authorization.encrptedAuthTokenName,
      result.encryptedAccessToken,
      tokenExpireDate,
      abp.appPath
    )
    return result
  }

  @action public async loginWithSecurityCode(model): Promise<TenantLoginModel> {
    this.isLoading = true
    const result: TenantLoginModel = await tokenAuthService
      .authenticateWithSecurityCode({
        userNameOrEmailAddress: model.userNameOrEmailAddress,
        password: model.password,
        SecurityCode: model.SecurityCode,
        rememberClient: model.rememberMe
      })
      .finally(() => (this.isLoading = false))

    const tokenExpireDate = model.rememberMe
      ? new Date(new Date().getTime() + 1000 * result.expireInSeconds)
      : undefined
    abp.auth.setToken(result.accessToken, tokenExpireDate)
    abp.utils.setCookieValue(
      AppConsts.authorization.encrptedAuthTokenName,
      result.encryptedAccessToken,
      tokenExpireDate,
      abp.appPath
    )
    abp.utils.setCookieValue(
      AppConsts.authorization.encrptedAuthTokenName,
      result.encryptedAccessToken,
      tokenExpireDate,
      abp.appPath
    )
    return result
  }

  @action
  logout() {
    abp.utils.deleteCookie(AppConsts.authorization.encrptedAuthTokenName, abp.appPath)
    abp.utils.deleteCookie(AppConsts.authorization.projectId, abp.appPath)

    localStorage.clear()
    sessionStorage.clear()
    abp.auth.clearToken()
  }

  @action public async getMethod() {
    this.isLoading = true
    const res = await tokenAuthService.getLoginMethod().finally(() => (this.isLoading = false))
    return res
  }

  @action public async loginSMS(body) {
    this.isLoading = true
    const result = await tokenAuthService.SMSAuth(body).finally(() => (this.isLoading = false))

    const tokenExpireDate = new Date(new Date().getTime() + 1000 * result.expireInSeconds)
    abp.auth.setToken(result.accessToken, tokenExpireDate)
    abp.utils.setCookieValue(
      AppConsts.authorization.encrptedAuthTokenName,
      result.encryptedAccessToken,
      tokenExpireDate,
      abp.appPath,
      undefined,
      { Secure: true }
    )
  }

  @action
  public async loginSocial(body) {
    this.isLoading = true
    const result = await tokenAuthService
      .socialAuth({
        ...this.firebaseBody,
        ...body
      })
      .finally(() => (this.isLoading = false))

    const tokenExpireDate = new Date(new Date().getTime() + 1000 * result.expireInSeconds)
    abp.auth.setToken(result.accessToken, tokenExpireDate)
    abp.utils.setCookieValue(
      AppConsts.authorization.encrptedAuthTokenName,
      result.encryptedAccessToken,
      tokenExpireDate,
      abp.appPath
    )
    abp.utils.setCookieValue(
      AppConsts.authorization.encrptedAuthTokenName,
      result.encryptedAccessToken,
      tokenExpireDate,
      abp.appPath
    )
  }
  @action public async checkSocial(body) {
    this.firebaseBody = body
    const result = await tokenAuthService.checkSocial(body)
    return result
  }

  @action public async registerBySMS(body) {
    this.isLoading = true
    const result = await tokenAuthService.registerBySMS(body).finally(() => (this.isLoading = false))
    const tokenExpireDate = new Date(new Date().getTime() + 1000 * result.expireInSeconds)
    abp.auth.setToken(result.accessToken, tokenExpireDate)
    abp.utils.setCookieValue(
      AppConsts.authorization.encrptedAuthTokenName,
      result.encryptedAccessToken,
      tokenExpireDate,
      abp.appPath,
      undefined,
      { Secure: true }
    )
  }
  @action public async registerAccount(body) {
    this.isLoading = true
    return await tokenAuthService.registerAccount(body).finally(() => (this.isLoading = false))
  }
  @action public async checkPhoneNumber(phoneNumber) {
    const result = await tokenAuthService.checkPhoneNumber(phoneNumber)
    return result
  }
}
export default AuthenticationStore
