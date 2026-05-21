import { L } from '@lib/abpUtility'
import AppConsts, { rangePickerPlaceholder } from '@lib/appconst'
import { Col, DatePicker, Form, Input, Row, Select, Switch } from 'antd'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { useState } from 'react'

const { formVerticalLayout } = AppConsts
interface Props {
  recrurringStatus: boolean
  resetFrequencyRepeat: () => void
}

const Recurring = inject()(
  observer((props: Props) => {
    const [onRecurring, setOnRecurring] = useState(false)
    const [repeatOption, setRepeatOption] = useState('YEARLY')
    const changeRecurring = (keyword, checked) => {
      setOnRecurring(checked)
    }
    React.useEffect(() => {
      if (props.recrurringStatus) {
        setOnRecurring(true)
      }
    }, [props.recrurringStatus])
    return (
      <>
        <Row gutter={16}>
          <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item label={L('RECURRING')} {...formVerticalLayout} valuePropName="checked" name="recurringChecked">
              <Switch onChange={(checked) => changeRecurring('isActive', checked)} />
            </Form.Item>
          </Col>
        </Row>
        {onRecurring && (
          <>
            <Row gutter={[16, 8]} className="reminder-box">
              <Col sm={{ span: 12 }}>
                <Form.Item
                  label={L('RECURRING_NAME')}
                  {...formVerticalLayout}
                  className="w-100"
                  name="recurringName"
                  rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col sm={{ span: 12 }}>
                <Form.Item
                  label={L('RECURRING_FREQUENCY')}
                  {...formVerticalLayout}
                  className="w-100"
                  name="recurringFrequency"
                  rules={[{ required: true }]}>
                  <Select
                    className="full-width"
                    filterOption={false}
                    onChange={(value) => {
                      props.resetFrequencyRepeat()
                      setRepeatOption((value || '').toString())
                    }}>
                    <Select.Option key={'WEEK'} value="WEEKLY">
                      {L('WEEKLY')}
                    </Select.Option>
                    <Select.Option key={'MONTH'} value="MONTHLY">
                      {L('MONTHLY')}
                    </Select.Option>
                    <Select.Option key={'QUARTER'} value="QUARTERLY">
                      {L('QUARTERLY')}
                    </Select.Option>
                    <Select.Option key={'YEAR'} value="YEARLY">
                      {L('YEARLY')}
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={{ span: 24 }}>
                <Form.Item
                  rules={[{ required: true }]}
                  label={L('RECURRING_FREQUENCY_REPEAT')}
                  {...formVerticalLayout}
                  className="w-100"
                  name="recurringFrequencyRepeat">
                  <Select showArrow showSearch allowClear className="full-width" filterOption={false} mode="multiple">
                    {repeatOption === 'YEARLY' &&
                      [...Array(12).keys()].map((item) => (
                        <Select.Option key={item} value={(item + 1).toString()}>
                          {item === 0 && L('CALENDAR_JAN')}
                          {item === 1 && L('CALENDAR_FEB')}
                          {item === 2 && L('CALENDAR_MAR')}
                          {item === 3 && L('CALENDAR_APR')}
                          {item === 4 && L('CALENDAR_MAY')}
                          {item === 5 && L('CALENDAR_JUN')}
                          {item === 6 && L('CALENDAR_JUL')}
                          {item === 7 && L('CALENDAR_AUG')}
                          {item === 8 && L('CALENDAR_SEP')}
                          {item === 9 && L('CALENDAR_OCT')}
                          {item === 10 && L('CALENDAR_NOV')}
                          {item === 11 && L('CALENDAR_DEC')}
                        </Select.Option>
                      ))}
                    {repeatOption === 'QUARTERLY' &&
                      [...Array(4).keys()].map((item) => (
                        <Select.Option key={item} value={(item + 1).toString()}>
                          {item + 1}
                        </Select.Option>
                      ))}
                    {repeatOption === 'WEEKLY' &&
                      [...Array(7).keys()].map((item) => (
                        <Select.Option key={item} value={item.toString()}>
                          {item === 0 && L('SUNDAY')}
                          {item === 1 && L('MONDAY')}
                          {item === 2 && L('TUESDAY')}
                          {item === 3 && L('WEDNESDAY')}
                          {item === 4 && L('THURSDAY')}
                          {item === 5 && L('FRIDAY')}
                          {item === 6 && L('SATURDAY')}
                        </Select.Option>
                      ))}
                    {repeatOption === 'MONTHLY' &&
                      [...Array(31).keys()].map((item) => (
                        <Select.Option key={item} value={(item + 1).toString()}>
                          {item + 1}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              {/* <Col sm={{ span: 12 }}>
                <Form.Item
                  rules={[{ required: true }]}
                  label={L('RECURRING_TIME_FROM')}
                  {...formVerticalLayout}
                  className="w-100"
                  name="recurringStartTime">
                  <TimePicker format="HH:mm" className="w-100" />
                </Form.Item>
              </Col>
              <Col sm={{ span: 12 }}>
                <Form.Item
                  rules={[{ required: true }]}
                  label={L('RECURRING_TIME_TO')}
                  {...formVerticalLayout}
                  className="w-100"
                  name="recurringEndTime">
                  <TimePicker format="HH:mm" className="w-100" />
                </Form.Item>
              </Col> */}
              <Col sm={{ span: 24 }}>
                <Form.Item
                  rules={[{ required: true }]}
                  label={L('RECURRING_FROM_DAY')}
                  {...formVerticalLayout}
                  className="w-100"
                  name="recurringDate">
                  <DatePicker.RangePicker
                    className="w-100"
                    format={'DD-MM-YYYY'}
                    placeholder={rangePickerPlaceholder}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
      </>
    )
  })
)

export default Recurring
