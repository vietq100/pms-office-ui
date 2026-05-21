import { checkUserUnit } from '@lib/validation'

const rules = {
  userCreate: [
    {
      required: true,
      validator: (rule, value) => checkUserUnit(rule, value, 'COMMON_REQUIRED_RESIDENT_IN_UNIT')
    }
  ],
  userEdit: [
    {
      required: true
    }
  ],
  description: [{ required: true, max: 500 }]
}

export default rules
