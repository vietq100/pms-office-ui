import React from 'react'
import { Select as AntSelect } from 'antd'
import { SelectProps } from 'antd/es/select'

export default class Select extends React.Component<SelectProps<any>> {
  static Option = AntSelect.Option
  static OptionGroup = AntSelect.OptGroup

  render(): React.ReactNode {
    return <AntSelect {...this.props} getPopupContainer={(trigger) => trigger.parentNode} />
  }
}
