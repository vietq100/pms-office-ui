import { Col, Form, Input, Row } from 'antd'
import { validateMessages } from '@lib/validation'
interface Props {
  onChange: (values) => void
}

const Input6VerifyCode = (props: Props) => {
  const [formVerify] = Form.useForm()
  const handleFocusNext = (elementId) => {
    const confirmCode = `${formVerify.getFieldValue('1')}${formVerify.getFieldValue('2')}${formVerify.getFieldValue(
      '3'
    )}${formVerify.getFieldValue('4')}${formVerify.getFieldValue('5')}${formVerify.getFieldValue('6')}`
    if (elementId <= 6) {
      if (formVerify.getFieldValue(`${elementId}`).length === 0) {
        document.getElementById(`${elementId - 1}`)?.focus()
      } else {
        document.getElementById(`${elementId + 1}`)?.focus()
      }
    }
    if (confirmCode.length === 6) props.onChange(confirmCode)
  }
  return (
    <div className="w-100">
      <Form form={formVerify} validateMessages={validateMessages} size="middle">
        <Row gutter={[8, 8]}>
          <Col xs={4}>
            <Form.Item name="1">
              <Input size="large" id="1" className="text-center" maxLength={1} onChange={() => handleFocusNext(1)} />
            </Form.Item>
          </Col>
          <Col xs={4}>
            <Form.Item name="2">
              <Input size="large" id="2" className="text-center" maxLength={1} onChange={() => handleFocusNext(2)} />
            </Form.Item>
          </Col>
          <Col xs={4}>
            <Form.Item name="3">
              <Input size="large" id="3" className="text-center" maxLength={1} onChange={() => handleFocusNext(3)} />
            </Form.Item>
          </Col>
          <Col xs={4}>
            <Form.Item name="4">
              <Input size="large" id="4" className="text-center" maxLength={1} onChange={() => handleFocusNext(4)} />
            </Form.Item>
          </Col>
          <Col xs={4}>
            <Form.Item name="5">
              <Input size="large" id="5" className="text-center" maxLength={1} onChange={() => handleFocusNext(5)} />
            </Form.Item>
          </Col>
          <Col xs={4}>
            <Form.Item name="6">
              <Input size="large" id="6" className="text-center" maxLength={1} onChange={() => handleFocusNext(6)} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default Input6VerifyCode
