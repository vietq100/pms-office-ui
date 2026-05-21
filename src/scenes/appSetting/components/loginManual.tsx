import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { L } from '@lib/abpUtility'
import { Col, Row, Form, Input } from 'antd'

const LoginManual = () => {
  return (
    <Row style={{ marginTop: '10px' }}>
      <Col span={24} offset={0}>
        <Form.Item>
          <Input placeholder={L('USERNAME_OR_EMAIL')} value="" />
        </Form.Item>
      </Col>
      <Col span={24} offset={0}>
        <Form.Item>
          <Input.Password
            placeholder={L('PASSWORD')}
            value=""
            iconRender={(showPassword) => (showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
      </Col>
    </Row>
  )
}

export default LoginManual
