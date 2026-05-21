import React, { useEffect, useRef, useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import isEqual from 'lodash/isEqual'
import { ckeditorToolbar } from '@lib/appconst'
import debounce from 'lodash/debounce'

interface CKEditorInputProps {
  value?: string
  onChange?: (value) => void
}

const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const CKEditorInput: React.FC<CKEditorInputProps> = ({ value, onChange }) => {
  const previousValue = usePrevious(value)
  const [currentValue, setCurrentValue] = useState(value || '')

  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      setCurrentValue(value || '')
    }
  }, [value])

  const triggerChange = () => {
    if (onChange) {
      onChange(currentValue)
    }
  }

  const onTextChange = debounce((event, editor) => {
    if (onChange) {
      onChange(editor.getData())
    }
    setCurrentValue(editor.getData())
  }, 200)

  return (
    <CKEditor
      editor={ClassicEditor}
      config={{
        language: abp.localization?.currentLanguage?.name || 'en',
        ...ckeditorToolbar
      }}
      data={currentValue || ''}
      onChange={onTextChange}
      onBlur={triggerChange}
    />
  )
}

export default CKEditorInput
