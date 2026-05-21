import { checkUserUnit } from '@lib/validation'

const rules = {
  projectId: [{ required: true }],
  unitId: [{ required: true }],
  userId: [{ required: true }],
  relatedTo: [{ required: true }],
  companyId: [],
  contractName: [{ required: true }],
  contractNo: [{ required: true }],
  contractCategoryId: [{ required: true }],
  contractTypeCode: [{ required: true }],
  unitPrice: [{ required: true }],
  usageTimes: [],
  unitUserId: [
    {
      required: true,
      validator: (rule, value) => checkUserUnit(rule, value, 'COMMON_REQUIRED_RESIDENT_IN_UNIT')
    }
  ]
}

export default rules
