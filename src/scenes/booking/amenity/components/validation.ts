import AppConsts from '../../../../lib/appconst'
import { checkMultiLanguageMaxLength, checkMultiLanguageRequired } from '@lib/validation'
const { dataType } = AppConsts
const rules = {
  projectId: [{ required: true }],
  name: [
    {
      required: true,
      validator: (rule, value) => checkMultiLanguageRequired(rule, value, 'AMENITY_NAME')
    },
    {
      max: 250,
      validator: (rule, value) => checkMultiLanguageMaxLength(rule, value)
    }
  ],
  amenityGroupId: [{ required: false }],
  timeZoneId: [{ required: false }],
  buildingIds: [{ required: false }],
  emailReceiveNotify: [{ required: true }],
  icon: [{ required: true }],
  depositAmount: [{ required: true, type: dataType.number, max: 999999999999, min: 0 }],
  policies: [
    {
      required: true,
      validator: (rule, value) => checkMultiLanguageRequired(rule, value, 'AMENITY_POLICY')
    },
    {
      validator: (rule, value) => checkMultiLanguageMaxLength(rule, value)
    }
  ]
}

export default rules
