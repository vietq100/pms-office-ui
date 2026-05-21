import React, { useEffect, useRef, useState } from 'react'
import { Input } from 'antd'
import Tag from 'antd/lib/tag'
import { PlusOutlined } from '@ant-design/icons/lib'
import { L, LError } from '@lib/abpUtility'
import { isValidEmail } from '@lib/helper'
import appConsts from '@lib/appconst'
import isEqual from 'lodash/isEqual'
import './tags-input.less'

const { dataType } = appConsts

interface TagProps {
  value?: any[]
  onChange?: (value: any[]) => void
  placeholder?
  type: string
  disabled?: boolean
  hidden?: boolean
}

const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const TagsInput: React.FC<TagProps> = ({ value = [], onChange, placeholder, type, disabled, hidden = false }) => {
  const previousValue = usePrevious(value)
  const [currentValue, setCurrentValue] = useState(value)
  const [errorMessage, setErrorMessage] = useState('')
  const [newTagState, setNewTagState] = useState({ visible: false, tag: '' })
  const [editTagState, setEditTagState] = useState({ index: -1, tag: '' })
  let refInputEdit = null as any
  let refInputNew = null as any

  useEffect(() => {
    if (previousValue && !isEqual(previousValue, value)) {
      setCurrentValue(value)
    }
  }, [value])

  const saveRefInput = (input, type) => {
    if (!input) {
      return
    }
    if (type === 'ADD') {
      refInputNew = input
      refInputNew.focus()
    } else {
      refInputEdit = input
      refInputEdit.focus()
    }
  }

  const handleTagChange = (e, type) => {
    if (type === 'ADD') {
      setNewTagState({ ...newTagState, tag: e.target.value })
    } else {
      setEditTagState({ ...editTagState, tag: e.target.value })
    }
  }

  const editTagClick = (tag, index, e) => {
    setEditTagState({ ...editTagState, tag, index })
    e.preventDefault()
  }

  const removeTagClick = (removeIndex) => {
    const updateValue = currentValue.filter((tag, index) => index !== removeIndex)
    setCurrentValue(updateValue)
    triggerChange(updateValue)
  }

  const hideShowNewTag = (visible) => {
    setNewTagState({ visible, tag: '' })
  }

  const updateTag = (index, tag) => {
    if (currentValue && index <= currentValue.length) {
      if (!validateBeforeSave(tag)) {
        return
      }

      currentValue[index] = tag
      setCurrentValue(currentValue)
      setEditTagState({ index: -1, tag: '' })
      setErrorMessage('')
      triggerChange(currentValue)
    }
  }

  const addTag = () => {
    if (!validateBeforeSave(newTagState.tag)) {
      return
    }
    if (currentValue.findIndex((item) => item === newTagState.tag) === -1) {
      const newValue = [...currentValue, newTagState.tag]
      setCurrentValue(newValue)
      setNewTagState({ visible: false, tag: '' })
      setErrorMessage('')
      triggerChange(newValue)
    }
  }

  const triggerChange = (updateValue) => {
    if (onChange) {
      onChange(updateValue)
    }
  }

  const validateBeforeSave = (text) => {
    if (type === dataType.email && !isValidEmail(text)) {
      setErrorMessage(LError('INVALID_FORMAT_{0}', type))
      return false
    }

    return true
  }

  return (
    <div className="tags-input" style={{ visibility: hidden ? 'hidden' : 'visible' }}>
      {currentValue.map((tag, index) => {
        if (editTagState.index === index) {
          return (
            <Input
              key={index}
              ref={(input) => saveRefInput(input, 'EDIT')}
              size={'small'}
              defaultValue={editTagState.tag}
              onChange={(e) => handleTagChange(e, 'EDIT')}
              onBlur={(e) => updateTag(index, e.target.value)}
              onPressEnter={(text) => updateTag(index, text)}
              style={{ width: 'auto' }}
              disabled={disabled}
            />
          )
        }

        return (
          <Tag className="edit-tag" key={tag} closable onClose={() => removeTagClick(index)}>
            <span onDoubleClick={(e) => editTagClick(tag, index, e)}>{tag}</span>
          </Tag>
        )
      })}
      {newTagState.visible && (
        <Input
          ref={(input) => saveRefInput(input, 'ADD')}
          type="text"
          size={'small'}
          onChange={(e) => handleTagChange(e, 'ADD')}
          onBlur={() => hideShowNewTag(false)}
          onPressEnter={addTag}
          style={{ width: '100%' }}
          disabled={disabled}
        />
      )}
      {!newTagState.visible && (
        <Tag className="site-tag-plus" onClick={() => hideShowNewTag(true)}>
          <PlusOutlined /> {L(placeholder)}
        </Tag>
      )}
      {errorMessage && errorMessage.length && <div className="text-danger">{errorMessage}</div>}
    </div>
  )
}

export default TagsInput
