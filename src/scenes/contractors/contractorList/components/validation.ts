import { emailRegex, phoneRegex } from '@lib/appconst'

const rules = {
  documentName: [{ required: true }],
  typeId: [{ required: true }],
  remark: [{ required: true }],
  firmId: [{ required: true }],
  contactName: [{ required: true }],
  phoneNumber: [
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
