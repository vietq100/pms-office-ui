import { emailRegex, phoneRegex } from '../../../../lib/appconst'

const rules = {
  name: [{ required: true }, { min: 1 }, { max: 64 }],
  surname: [{ required: true }, { min: 1 }, { max: 64 }],
  displayName: [{ required: true }, { min: 6 }, { max: 256 }],
  userName: [{ required: true }, { min: 5 }, { max: 256 }],
  emailAddress: [
    { min: 6 },
    { max: 256 },
    {
      // required: true,
      pattern: emailRegex
    }
  ],
  emailAddressNotFull: [
    { min: 6 },
    { max: 256 },
    {
      // required: true
    }
  ],
  password: [{ required: true }, { min: 6 }, { max: 256 }],
  phoneNumberCreate: [
    { max: 15 },
    {
      required: false,
      pattern: phoneRegex
    }
  ],
  phoneNumberUpdate: [
    { max: 15 },
    {
      required: false
    }
  ],
  company: [{ required: true }],

  phoneNumber: [
    { max: 15 },
    {
      required: false,
      pattern: phoneRegex
    }
  ],
  identityNumber: [{ max: 64 }],
  passport: [{ max: 64 }],
  description: [{ max: 2000 }],
  note: [{ max: 2000 }]
}

export default rules
