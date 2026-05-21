class ForgotPasswordModel {
  emailAddress!: string
}

export class ResetPasswordModel {
  emailAddress!: string
  resetCode!: string
  password!: string
}

export default ForgotPasswordModel
