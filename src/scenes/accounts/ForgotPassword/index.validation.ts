import { emailRegex } from '@lib/appconst'
import { checkPasswordRetype } from '@lib/validation'

const rules = {
  userNameOrEmailAddress: [
    { required: true },
    { min: 6 },
    { max: 256 },
    {
      required: false,
      pattern: emailRegex
    }
  ],
  resetCode: [{ required: true }],
  password: [{ required: true }, { min: 6 }, { max: 255 }],
  passwordRetype: [{ required: true }, { min: 6 }, { max: 255 }, checkPasswordRetype]
}

export default rules
