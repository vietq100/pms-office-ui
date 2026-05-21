import { phoneRegex } from '../../../../lib/appconst'

const rules = {
  name: [{ required: true }, { min: 1 }, { max: 50 }],
  code: [{ required: true }, { max: 50 }],
  investorName: [{ min: 1 }, { max: 50 }],
  address: [{ min: 1 }, { max: 250 }],
  hotline: [
    { max: 15 },
    {
      required: false,
      pattern: phoneRegex
    }
  ],
  timeZone: [{ required: true }]
}

export default rules
