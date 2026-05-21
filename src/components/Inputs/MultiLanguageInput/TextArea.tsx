import React, { useState, useEffect, useRef } from 'react'
import { Input, Tabs } from 'antd'
import { arrayToObject } from '../../../lib/helper'
import { ILanguageValue } from '../../../models/global'
import { isEqual } from 'lodash'
const { TextArea } = Input
const { TabPane } = Tabs

interface MultiLanguageTextAreaProps {
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

const MultiLanguageTextArea: React.FC<MultiLanguageTextAreaProps> = ({ value = [], onChange, maxLength }) => {
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

  return (
    <Tabs activeKey={selectedLanguage} onChange={(e) => setSelectedLanguage(e)}>
      {(value || []).map((language) => (
        <TabPane
          tab={
            <>
              <i className={language.icon} /> <span className="ml-1">{language.languageName}</span>
            </>
          }
          key={language.languageName}>
          <TextArea
            value={languageValue[selectedLanguage]}
            onChange={onTextChange}
            onBlur={triggerChange}
            maxLength={maxLength || 2000}
            autoSize={{ minRows: 2, maxRows: 2 }}
          />
        </TabPane>
      ))}
    </Tabs>
  )
}

export default MultiLanguageTextArea
