// import { checkUserUnit } from '@lib/validation'

const rules = {
  required: [{ required: true }],
  reasonNote: [{ required: true, max: 5000 }]
}

export default rules
