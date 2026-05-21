import { L, LError } from './abpUtility'
import { isNullOrEmpty } from './helper'

export const validateMessages = {
  get required() {
    return LError('REQUIRED_FIELD_{0}', '${label}')
  },
  types: {
    get email() {
      return LError('INVALID_FORMAT_{0}', '${label}')
    },
    get number() {
      return LError('{0}_INVALID_TYPE_{1}', '${label}', '${type}')
    },
    get float() {
      return LError('{0}_INVALID_TYPE_{1}', '${label}', '${type}')
    },
    get regex() {
      return LError('INVALID_FORMAT_{0}', '${label}')
    },
    get date() {
      return LError('INVALID_FORMAT_{0}', '${label}')
    },
    get url() {
      return LError('{0}_INVALID_TYPE_{1}', '${label}', '${type}')
    }
  },
  string: {
    get min() {
      return LError('MIN_FIELD_LENGTH_{0}', '${min}')
    },
    get max() {
      return LError('MAX_FIELD_LENGTH_{0}', '${max}')
    },
    get range() {
      return LError('{0}_FIELD_LENGTH_BETWEEN_{1}_AND_{2}', '${label}', '${min}', '${max}')
    } //'${label} must be between ${min} and ${max}',
  },
  number: {
    get min() {
      return LError('MIN_FIELD_LENGTH_{0}', '${min}')
    },
    get max() {
      return LError('MAX_FIELD_LENGTH_{0}', '${max}')
    },
    get range() {
      return LError('{0}_FIELD_LENGTH_BETWEEN_{1}_AND_{2}', '${label}', '${min}', '${max}')
    } //'${label} must be between ${min} and ${max}',
  },
  date: {
    get format() {
      return LError('INVALID_FORMAT_{0}', '${label}')
    },
    get parse() {
      return LError('INVALID_FORMAT_{0}', '${label}')
    },
    get invalid() {
      return LError('INVALID_FORMAT_{0}', '${label}')
    }
  },
  pattern: {
    get mismatch() {
      return LError('INVALID_FORMAT_{0}', '${label}')
    }
  }
}

export function checkMultiLanguageRequired(rule, value, label) {
  if (
    !value ||
    value.length < abp.localization.languages.length ||
    value.findIndex((language) => isNullOrEmpty(language.value)) !== -1
  ) {
    return Promise.reject(LError('REQUIRED_FIELD_{0}', L(label)))
  }
  return Promise.resolve()
}

export function checkMultiLanguageMaxLength(rule, value) {
  if (
    !value ||
    value.length < abp.localization.languages.length ||
    value.findIndex((language) => (language.value || '').length > rule.max) !== -1
  ) {
    return Promise.reject(LError('MAX_FIELD_LENGTH_{0}', rule.max))
  }
  return Promise.resolve()
}

export const checkPasswordRetype = ({ getFieldValue }) => ({
  validator(rule, value) {
    if (!value || getFieldValue('password') === value) {
      return Promise.resolve()
    }
    return Promise.reject(LError('PASSWORD_RETYPE_DO_NOT_MATCH')) // The two passwords that you entered do not match!'
  }
})

export function checkUserUnit(rule, value, label) {
  if (!value) {
    return Promise.reject(LError(L(label)))
  }
  const [unitId, userId] = value.split('-')

  if (!userId || !unitId || isNaN(parseInt(userId)) || isNaN(parseInt(unitId))) {
    return Promise.reject(LError(L(label)))
  }
  return Promise.resolve()
}
