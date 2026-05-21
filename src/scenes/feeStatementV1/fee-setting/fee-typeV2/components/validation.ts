import { checkMultiLanguageRequired } from '@lib/validation'

const rules = {
  name: [
    {
      required: true,
      validator: (rule, value) => checkMultiLanguageRequired(rule, value, 'FEE_TYPE_DETAIL_TYPE')
    }
  ],
  code: [{ required: true }, { max: 10 }],
  description: [{ required: true }],
  feType: [{ required: true }],
  fromDate: [{ required: true }],
  endDate: [{ required: false }],
  genType: [{ required: true }]
}

export default rules
