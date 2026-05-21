import { IsTenantAvaibleInput } from './dto/isTenantAvailableInput'
import { RegisterInput } from './dto/registerInput'
import IsTenantAvaibleOutput from './dto/isTenantAvailableOutput'
import { RegisterOutput } from './dto/registerOutput'
import http from '../httpService'
import { ChangePasswordInput } from './dto/changePasswordInput'
import { ResetPasswordInput } from './dto/resetPasswordInput'
import ForgotPasswordModel, { ResetPasswordModel } from '../../models/account/ForgotPassword/forgotPasswordModel'

class AccountService {
  public async isTenantAvailable(isTenantAvaibleInput: IsTenantAvaibleInput): Promise<IsTenantAvaibleOutput> {
    const result = await http.post('api/services/app/Account/IsTenantAvailable', isTenantAvaibleInput)
    return result.data.result
  }

  public async register(registerInput: RegisterInput): Promise<RegisterOutput> {
    const result = await http.post('api/services/app/Account/Register', registerInput)
    return result.data.result
  }

  public async changePassword(body: ChangePasswordInput) {
    const result = await http.post('api/services/app/User/ChangePassword', body)
    return result.data.result
  }

  public async resetPassword(body: ResetPasswordInput) {
    const result = await http.post('api/services/app/User/ResetPassword', body)
    return result.data.result
  }

  public async adminResetPassword(body: ResetPasswordInput) {
    const result = await http.post('api/services/app/Account/AdminResetPassword', body)
    return result.data.result
  }

  public async forgotPassword(body: ForgotPasswordModel) {
    const result = await http.post('api/services/app/Account/SendPasswordResetCode', body)
    return result.data.result
  }

  public async resetPasswordUser(body: ResetPasswordModel) {
    const result = await http.post('api/services/app/Account/ResetPassword', body)
    return result.data.result
  }
}

export default new AccountService()
