import { emailRegex, phoneRegex } from '@lib/appconst'

const rules = {
  projectId: [{ required: true }],
  displayName: [{ required: true }],
  emailAddress: [
    { required: true },
    { min: 6 },
    { max: 256 },
    {
      required: false,
      pattern: emailRegex
    }
  ],
  phoneNumber: [
    { max: 15 },
    {
      required: true,
      pattern: phoneRegex
    }
  ],
  url: [{ required: false, type: 'url' as const }]
}

export default rules
