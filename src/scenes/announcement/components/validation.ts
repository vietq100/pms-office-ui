import { L, LError } from '@lib/abpUtility'
import { emailRegex } from '@lib/appconst'
import { isNullOrEmpty } from '@lib/helper'

export function checkContent(rule, value, label) {
  if (!value || isNullOrEmpty(value)) {
    return Promise.reject(LError('REQUIRED_FIELD_{0}', L(label)))
  }

  return Promise.resolve()
}

const rules = {
  campaignCategory: [{ required: true }],
  projectId: [{ required: true }],
  buildingIds: [{ required: true }],
  sentDirectly: [{ required: false }],
  campaignType: [{ required: true }],
  subject: [{ required: true }],
  subjectSms: [{ required: true }, { max: 150 }],
  content: [
    {
      required: true,
      validator: (rule, value) => checkContent(rule, value, 'TEMPLATE_CONTENT')
    }
  ],
  contentSms: [{ required: false }],
  emailAddress: [
    { required: false },
    { min: 6 },
    { max: 256 },
    {
      required: false,
      pattern: emailRegex
    }
  ]
}

export default rules
