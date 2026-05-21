import { AuthenticationModel, SwitchProjectModel, TenantLoginModel } from './dto/authenticationModel'
import { AuthenticationResultModel } from './dto/authenticationResultModel'
import http from '../httpService'

class TokenAuthService {
  public async authenticate(authenticationInput: AuthenticationModel): Promise<AuthenticationResultModel> {
    const result = await http.post('api/TokenAuth/Authenticate', authenticationInput)
    return result.data.result
  }

  public async authenticateAsTenant(authenticationInput: AuthenticationModel): Promise<TenantLoginModel> {
    const result = await http.post('api/TokenAuth/WebTenantAuthenticate', authenticationInput)
    return result.data.result
  }

  public async authenticateWithSecurityCode(authenticationInput): Promise<TenantLoginModel> {
    const result = await http.post('api/TokenAuth/ConfirmAuthenticate', authenticationInput)
    return result.data.result
  }

  public async switchProject(targetProjectId): Promise<any> {
    const result = await http.post('api/TokenAuth/SwitchProjectAuthenticate', null, { params: { targetProjectId } })
    return SwitchProjectModel.assign(result.data.result)
  }

  public async switchProjectSSO(): Promise<any> {
    const result = await http.post('api/TokenAuth/SwitchDefaultProjectAuthenticate')
    return SwitchProjectModel.assign(result.data.result)
  }

  public async getLoginMethod(): Promise<any> {
    const result = await http.get('api/TokenAuth/GetAuthenticationProviders')
    return result.data.result
  }

  public async socialAuth(body: any): Promise<any> {
    const result = await http.post('api/TokenAuth/ExternalAuthenticateV1', body)
    return result.data.result
  }

  public async checkSocial(body) {
    const result = await http.post('api/services/app/Account/IsSocialLoginAvailableV1', body)
    return result.data.result
  }
  public async registerBySMS(body) {
    const result = await http.post('api/TokenAuth/RegisterViaPhoneNumberAuthenticate', body)
    return result.data.result
  }
  public async SMSAuth(body: any): Promise<any> {
    const result = await http.post('api/TokenAuth/PhoneLoginAuthenticate', body)
    return result.data.result
  }
  public async registerAccount(body) {
    const result = await http.post('api/services/app/Account/Register', body)
    return result.data.result
  }
  public async checkPhoneNumber(phoneNumber) {
    const result = await http.post('api/services/app/Account/IsPhoneNumberAvailable', { phoneNumber })
    return result.data.result
  }
}

export default new TokenAuthService()
