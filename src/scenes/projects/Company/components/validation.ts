import { emailRegex, phoneRegex } from '@lib/appconst'

const rules = {
  projectId: [{ required: true }],
  unitId: [{ required: true }],
  userId: [{ required: true }],
  companyTypeId: [{ required: true }],
  bpType: [{ required: true }],
  representative: [{ required: true }, { max: 200 }],

  required: [{ required: true }],

  permanentAddress: [{ required: true }, { max: 255 }],

  contactCommuneId: [{ required: true }],
  contactDistrictId: [{ required: true }],
  contactProvinceId: [{ required: true }],

  textRequired: [{ required: true }, { max: 255 }],

  maxText200: [{ max: 200 }],
  maxText30: [{ max: 30 }],
  maxText35: [{ max: 35 }],
  maxText60: [{ max: 60 }],

  emailAddress: [
    { max: 60 },
    {
      pattern: emailRegex
    }
  ],

  address: [{ max: 250 }],
  description: [{ max: 2000 }],
  phoneNumber: [
    { max: 15 },
    {
      required: true,
      pattern: phoneRegex
    }
  ],
  phoneNumber2: [
    { max: 15 },
    {
      required: false,
      pattern: phoneRegex
    }
  ]
}

export default rules
