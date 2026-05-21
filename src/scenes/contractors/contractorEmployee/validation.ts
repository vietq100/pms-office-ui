import { emailRegex, phoneRegex } from '@lib/appconst'

const rules = {
  contactName: [{ required: true }],
  password: [{ required: true }],
  contactPhoneNumber: [
    { max: 15 },
    {
      required: true,
      pattern: phoneRegex
    }
  ],
  emailAddress: [
    { required: true },
    { min: 6 },
    { max: 256 },
    {
      required: false,
      pattern: emailRegex
    }
  ]
}

export default rules
