import { checkMultiLanguageMaxLength, checkMultiLanguageRequired } from '@lib/validation'

const rules = {
  names: [
    {
      required: true,
      validator: (rule, value) => checkMultiLanguageRequired(rule, value, 'AMENITY_NAME')
    },
    {
      max: 250,
      validator: (rule, value) => checkMultiLanguageMaxLength(rule, value)
    }
  ],
  moduleIds: [{ required: true }]
}

export default rules
