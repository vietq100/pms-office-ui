import { checkMultiLanguageRequired } from '@lib/validation'

const rules = {
  name: [
    {
      required: true,
      validator: (rule, value) => checkMultiLanguageRequired(rule, value, 'CONTRACT_CATEGORY_NAME')
    }
  ]
}

export default rules
