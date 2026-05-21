import { emailRegex, phoneRegex } from '@lib/appconst'

const rules = {
  type: [{ required: true }],
  representative: [{ required: true }, { max: 250 }],
  companyCode: [{ required: true }, { max: 50 }],
  companyName: [{ required: true }, { max: 500 }],
  taxtCode: [{ required: true }, { max: 500 }],
  emailAddress: [
    { max: 200 },
    {
      pattern: emailRegex
    }
  ],

  address: [{ max: 250 }],
  description: [{ max: 2000 }],
  phoneNumber: [
    { max: 15 },
    {
      required: false,
      pattern: phoneRegex
    }
  ],
  date: [{ required: true }]
}

export default rules
