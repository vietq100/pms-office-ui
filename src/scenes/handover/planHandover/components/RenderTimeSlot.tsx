import AppConsts, { timeFormat } from '@lib/appconst'
import Col from 'antd/lib/col'
import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Input from 'antd/lib/input'
import MinusOutlined from '@ant-design/icons/MinusOutlined'
import TimePicker from 'antd/lib/time-picker'
import Button from 'antd/lib/button'
import { L } from '@lib/abpUtility'
const { formVerticalLayout, bookingDates } = AppConsts

const RenderTimeSlot = () => {
  return (
    <Col sm={{ span: 24, offset: 0 }}>
      {bookingDates.map((item, index) => {
        if (item.numNextValidDate === 'ALL_DAY') {
          return
        }

        return (
          <div key={index}>
            <Row>
              <Col sm={{ span: 24, offset: 0 }}>{L(item.numNextValidDate)}</Col>
            </Row>
            <Form.List name={['timeSlots', item.numNextValidDate]}>
              {(fields, { remove }) => {
                return (
                  <Row gutter={[16, 0]}>
                    {fields.map((field, index) => (
                      <Col sm={{ span: 12, offset: 0 }} key={field.key}>
                        <Row gutter={[16, 0]}>
                          <Form.Item name={[field.name, 'numNextValidDate']} style={{ height: 0 }}>
                            <Input hidden={true} />
                          </Form.Item>
                          <Col sm={{ span: 6, offset: 0 }} className="text-right">
                            <Button
                              className="ml-1"
                              shape="circle"
                              icon={<MinusOutlined />}
                              onClick={() => remove(index)}></Button>
                          </Col>
                          <Col sm={{ span: 6, offset: 0 }}>
                            <Form.Item {...formVerticalLayout} name={[field.name, 'startTime']}>
                              <TimePicker format={timeFormat} className="full-width" minuteStep={30} />
                            </Form.Item>
                          </Col>
                          <Col sm={{ span: 6, offset: 0 }}>
                            <Form.Item {...formVerticalLayout} name={[field.name, 'endTime']}>
                              <TimePicker format={timeFormat} className="full-width" minuteStep={30} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                    ))}
                  </Row>
                )
              }}
            </Form.List>
          </div>
        )
      })}
    </Col>
  )
}

export default RenderTimeSlot
