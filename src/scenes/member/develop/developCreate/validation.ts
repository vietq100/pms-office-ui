import { emailRegex, phoneRegex } from '../../../../lib/appconst'

const rules = {
  name: [{ required: true }, { min: 1 }, { max: 64 }],
  surname: [{ required: true }, { min: 1 }, { max: 64 }],
  displayName: [{ required: true }, { min: 6 }, { max: 256 }],
  company: [{ required: true }],
  userName: [{ required: true }, { min: 5 }, { max: 256 }],
  emailAddress: [
    { min: 6 },
    { max: 256 },
    {
      pattern: emailRegex
    }
  ],
  password: [{ required: true }, { min: 6 }, { max: 256 }],
  phoneNumber: [
    { max: 15 },
    {
      required: true,
      pattern: phoneRegex
    }
  ],
  identityNumber: [{ max: 64 }],
  passport: [{ max: 64 }]
}

export default rules
