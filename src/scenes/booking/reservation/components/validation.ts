import { checkUserUnit } from '@lib/validation'

const rules = {
  projectId: [{ required: true }],
  unitId: [{ required: true }],
  userId: [{ required: true }],
  statusId: [{ required: true }],
  paymentStatusId: [{ required: true }],
  unitUserId: [
    {
      required: true,
      validator: (rule, value) => checkUserUnit(rule, value, 'COMMON_REQUIRED_RESIDENT_IN_UNIT')
    }
  ],
  // Rule for reservation additional fee
  totalAdditionalServiceUsageFee: [{ required: true }]
}

export default rules
