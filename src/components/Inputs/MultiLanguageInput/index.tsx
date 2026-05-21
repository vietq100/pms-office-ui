import React, { useState, useEffect, useRef } from 'react'
import { Input, Select } from 'antd'
import { arrayToObject } from '../../../lib/helper'
import { ILanguageValue } from '../../../models/global'
import { isEqual } from 'lodash'
const { Option } = Select

interface MultiLanguageInputProps {
  value?: ILanguageValue[]
  onChange?: (value: ILanguageValue[]) => void
  maxLength?: number
}

const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const currentLanguage = abp.localization.currentLanguage.name

const MultiLanguageInput: React.FC<MultiLanguageInputProps> = ({ value = [], onChange, maxLength }) => {
  const previousValue = usePrevious(value)
  const [languageValue, setLanguageValue] = useState(arrayToObject(value, 'languageName', 'value'))
  const [selectedLanguage, setSelectedLanguage] = useState(
    currentLanguage && currentLanguage.length ? currentLanguage : value && value.length ? value[0].languageName : ''
  )

  useEffect(() => {
    if (previousValue && !isEqual(previousValue, value)) {
      setLanguageValue(arrayToObject(value, 'languageName', 'value'))
      // setSelectedLanguage(value && value.length ? value[0].languageName : '')
    }
  }, [value])

  const triggerChange = () => {
    const changedValue = (value || []).map((lang) => {
      return { ...lang, value: languageValue[lang.languageName] as string }
    })
    if (onChange) {
      onChange(changedValue)
    }
  }

  const onTextChange = (e) => {
    setLanguageValue({ ...languageValue, [selectedLanguage]: e.target.value })
  }

  const selectLanguage = (
    <Select
      value={selectedLanguage}
      onChange={(language) => setSelectedLanguage(language)}
      style={{ width: '80px', borderRadius: 10 }}>
      {(abp.localization.languages || []).map((language, index) => (
        <Option key={index} value={language.name}>
          <i className={language.icon} /> {language.name}
        </Option>
      ))}
    </Select>
  )

  return (
    <>
      <Input
        style={{ borderRadius: 0 }}
        value={languageValue[selectedLanguage]}
        addonBefore={selectLanguage}
        onChange={onTextChange}
        onBlur={triggerChange}
        maxLength={maxLength}
        aria-rowspan={2}
        size="middle"
      />
      <style>{`
    span.ant-input-affix-wrapper {
      border-radius: 0 24px 24px 0 !important
    }
    `}</style>
    </>
  )
}

export default MultiLanguageInput
