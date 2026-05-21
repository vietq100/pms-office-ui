import React from 'react'
import { styles } from '@lib/formLayout'
import debounce from 'lodash/debounce'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { L } from '@lib/abpUtility'
import { Col, Form, Row, Input, Switch, Select } from 'antd'
import AppConsts from '@lib/appconst'
import AppComponentBase from '@components/AppComponentBase'
import StaffStore from '@stores/member/staff/staffStore'
import ReminderStore from '@stores/common/reminderStore'
import { isValidEmail } from '@lib/helper'

const { formVerticalLayout, timeUnits } = AppConsts
const Option = Select.Option as any

interface IFormProps {
  staffStore?: StaffStore
  moduleId: number
  parentId?: number
  timeUnit?: string
  reminderStore?: ReminderStore
}

interface IFormState {
  isActive: boolean
}

@inject(Stores.StaffStore, Stores.ProjectStore, Stores.SessionStore, Stores.ReminderStore)
@observer
class Reminder extends AppComponentBase<IFormProps, IFormState> {
  findEmployees = async (keyword) => {
    await this.props.staffStore?.getAll({ keyword })
  }

  changeReminder = async (key, value) => {
    if (key === 'emails') {
      let valid = true
      value.forEach((item) => {
        if (!isValidEmail(item.toString())) {
          valid = false
        }
      })
      if (!valid) {
        return
      }
    }
    await this.props.reminderStore?.setReminder(key, value)
  }

  renderEmailOptions = (items) => {
    const children = [] as any
    ;(items || []).forEach((item, index) => {
      children.push(<Option key={index}>{item}</Option>)
    })
    return children
  }

  render(): React.ReactNode {
    const { reminderStore, timeUnit } = this.props
    let suffix = 'REMINDER_IN_MINUTE'
    switch (timeUnit) {
      case timeUnits.days:
        suffix = 'REMINDER_IN_DAY'
        break
      case timeUnits.hours:
        suffix = 'REMINDER_IN_HOUR'
        break
    }
    return (
      <>
        <Row gutter={16}>
          <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item label={L('REMINDER')} {...formVerticalLayout} valuePropName="checked">
              <Switch
                onChange={(checked) => this.changeReminder('isActive', checked)}
                checked={reminderStore?.editReminder.isActive}
              />
            </Form.Item>{' '}
          </Col>
        </Row>

        {reminderStore?.editReminder.isActive ? (
          <Row gutter={[16, 8]} className="reminder-box">
            <Col sm={{ span: 12 }}>
              <Form.Item label={L('REMINDER_BEFORE')} {...formVerticalLayout} style={styles.width100}>
                <Input
                  onChange={({ target: { value } }) => this.changeReminder('reminderInDay', value)}
                  suffix={L(suffix)}
                  style={styles.width100}
                  value={reminderStore?.editReminder.reminderInDay}
                />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12 }}>
              <Form.Item label={L('ADD_USER_TO_NOTIFICATION')} {...formVerticalLayout} className="full-width">
                <Select
                  showArrow
                  showSearch
                  allowClear
                  className="full-width"
                  onSearch={debounce(this.findEmployees)}
                  filterOption={false}
                  style={styles.width100}
                  onChange={(employee) => this.changeReminder('userIds', employee)}
                  value={reminderStore?.editReminder.userIds}
                  mode="multiple">
                  {this.props.staffStore?.staffs.items?.map((item: any, index) => (
                    <Select.Option key={index} value={item.id}>
                      {item.displayName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12 }}>
              <Form.Item
                label={L('ADD_EMAIL_TO_THE_NOTIFICATION')}
                {...formVerticalLayout}
                style={styles.width100}
                className="full-width">
                <Select
                  mode="tags"
                  className="full-width"
                  value={reminderStore?.editReminder.emails}
                  style={styles.width100}
                  onChange={(value) => this.changeReminder('emails', value)}>
                  {this.renderEmailOptions(reminderStore?.editReminder?.emails)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        ) : (
          ''
        )}
      </>
    )
  }
}

export default Reminder
