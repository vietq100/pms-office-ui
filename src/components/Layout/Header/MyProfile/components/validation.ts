import { L } from '../../../../../lib/abpUtility'

const rules = {
  name: [
    {
      required: true,
      max: 64
      // message: LError('REQUIRED_FIELD_{0}', L('MY_PROFILE_NAME'))
    }
  ],
  surname: [
    {
      required: true,
      max: 64
      // message: LError('REQUIRED_FIELD_{0}', L('MY_PROFILE_SURNAME'))
    }
  ],
  displayName: [
    {
      required: true,
      max: 64
      // message: LError('REQUIRED_FIELD_{0}', L('MY_PROFILE_FULL_NAME'))
    }
  ],
  userName: [
    {
      required: true,
      max: 64
      // message: LError('REQUIRED_FIELD_{0}', L('MY_PROFILE_USER_NAME'))
    }
  ],
  emailAddress: [
    {
      required: true,
      max: 250
      // message: LError('REQUIRED_FIELD_{0}', L('MY_PROFILE_EMAIL'))
    }
  ],
  password: [
    {
      required: true,
      max: 32
      // message: LError('REQUIRED_FIELD_{0}', L('MY_PROFILE_PASSWORD'))
    }
  ]
}

export const ruleChangePassword = {
  currentPassword: [{ required: true, max: 32, min: 6 }],
  newPassword: [{ required: true, max: 32, min: 6 }],
  newPasswordReType: [
    { required: true, max: 32 },
    ({ getFieldValue }) => ({
      validator(rule, value) {
        if (!value || getFieldValue('newPassword') === value) {
          return Promise.resolve()
        }
        return Promise.reject(L('ERROR.NEW_PASSWORD_DO_NOT_MATCH'))
      }
    })
  ]
}

export default rules
