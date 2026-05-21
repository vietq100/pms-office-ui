import { L } from '@lib/abpUtility'
import { emailRegex, phoneRegex } from '@lib/appconst'

const rules = {
  displayName: [{ required: true }, { max: 512 }],
  email: [
    { min: 6 },
    { max: 256 },
    {
      required: true,
      pattern: emailRegex,
      message: L('INVALID_EMAIL')
    }
  ],
  phoneNumber: [
    { max: 15 },
    {
      required: true,
      pattern: phoneRegex,
      message: L('INVALID_PHONE')
    }
  ]
}

export default rules
