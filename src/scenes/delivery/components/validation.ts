import { checkUserUnit } from '@lib/validation'

const rules = {
  projectId: [{ required: true }],
  unitId: [{ required: true }],
  userId: [{ required: true }],
  type: [{ required: true }],
  unitUserId: [
    {
      required: true,
      validator: (rule, value) => checkUserUnit(rule, value, 'COMMON_REQUIRED_RESIDENT_IN_UNIT')
    }
  ],
  identityCardNumber: [{ required: true }],
  reasonForVisitId: [{ required: true }],
  visitorName: [{ required: true }]
}

export default rules
