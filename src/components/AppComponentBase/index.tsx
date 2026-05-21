import * as React from 'react'
import { L, isGranted } from '../../lib/abpUtility'
import { Avatar, Select, Tag } from 'antd'
import { getFirstLetterAndUpperCase, renderDate, renderAvatar, renderGender, renderIsActive } from '../../lib/helper'
import { moduleAvatar } from '@lib/appconst'

const Option = Select.Option
const { colorByLetter } = moduleAvatar

class AppComponentBase<P = any, S = any, SS = any> extends React.Component<P, S, SS> {
  L(key: string): string {
    return L(key)
  }

  isGranted(permissionName: string): boolean {
    return isGranted(permissionName)
  }

  renderOptions(options, log?) {
    if (log) {
      console.log(options)
    }

    return (options || []).map((option, index) => (
      <Option key={index} value={option.value || option.id}>
        {L(option.displayName || option.label || option.name)}
      </Option>
    ))
  }
  renderOptionsWithDisabled(options, log?) {
    if (log) {
      console.log(options)
    }
    return (options || []).map((option, index) => {
      return (
        <Option disabled={option.disabled || option.isCancel} key={index} value={option.value || option.id}>
          {L(option.label || option.name)}
        </Option>
      )
    })
  }
  renderDisplayName(options, log?) {
    if (log) {
      console.log(options)
    }

    return (options || []).map((option, index) => (
      <Option key={index} value={option.value || option.id}>
        {option.displayName}
      </Option>
    ))
  }
  renderAvatar = renderAvatar

  renderLogo(logoUrl, projectName, size = 64) {
    const firstLetter = getFirstLetterAndUpperCase(projectName || 'G')
    const color = colorByLetter(firstLetter)
    return (
      <>
        <div className="table-cell-profile">
          <div>
            <Avatar shape="square" size={size} src={logoUrl} style={{ background: color }}>
              {firstLetter}
            </Avatar>
          </div>
        </div>
      </>
    )
  }

  renderGender = renderGender
}

export class AppComponentListBase<P = any, S = any, SS = any> extends AppComponentBase<P, S, SS> {
  renderDate = renderDate

  renderIsActive = renderIsActive

  renderTag(value, color) {
    return (
      <Tag className="cell-round mr-0" color={color}>
        {value}
      </Tag>
    )
  }
}

export default AppComponentBase
