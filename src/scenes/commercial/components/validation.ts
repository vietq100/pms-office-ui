import { L, LError } from '@lib/abpUtility'
import { isNullOrEmpty } from '@lib/helper'

export function checkContent(rule, value, label) {
  if (!value || isNullOrEmpty(value)) {
    return Promise.reject(LError('REQUIRED_FIELD_{0}', L(label)))
  }

  return Promise.resolve()
}

const rules = {
  projectId: [{ required: true }],
  buildingIds: [{ required: true }],
  campaignType: [{ required: true }],
  subject: [{ required: true }, { max: 250 }],
  content: [
    {
      required: true,
      validator: (rule, value) => checkContent(rule, value, 'TEMPLATE_CONTENT')
    }
  ]
}

export default rules
