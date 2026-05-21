import { checkMultiLanguageMaxLength, checkMultiLanguageRequired } from '../../../../lib/validation'

export const ruleFolder = {
  name: [
    {
      required: true,
      validator: (rule, value) => checkMultiLanguageRequired(rule, value, 'LIBRARY_DOCUMENT_NAME')
    },
    {
      max: 250,
      validator: (rule, value) => checkMultiLanguageMaxLength(rule, value)
    }
  ],
  libraryId: [{ required: true }],
  fileName: [{ required: true }]
}

export const ruleDocument = {
  name: [{ required: true }],
  libraryId: [{ required: true }],
  fileName: [
    {
      required: true,
      validator: (rule, value) => checkMultiLanguageRequired(rule, value, 'LIBRARY_DOCUMENT_NAME')
    },
    {
      max: 250,
      validator: (rule, value) => checkMultiLanguageMaxLength(rule, value)
    }
  ],
  projectId: [],
  buildingId: [{ required: true }],
  roleIds: [{ required: true }],
  description: [
    {
      max: 2000,
      validator: (rule, value) => checkMultiLanguageMaxLength(rule, value)
    }
  ]
}
