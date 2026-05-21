import { createRef, useEffect, useState } from 'react'
import { Button, Card, Col, Form, Input, Row, Switch } from 'antd'
import { L } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import { validateMessages } from '@lib/validation'
import { PaymentSetting } from '@models/fee/payment'
import paymentService from '@services/fee/paymentService'
import withRouter from '@components/Layout/Router/withRouter'
import { FormInstance } from 'antd/es/form'

const rules = {
  input: [
    {
      required: true,
      max: 250
    }
  ],
  publicKey: [
    {
      required: true,
      max: 2000
    }
  ],
  required: [{ required: true }]
}

const emptyData: PaymentSetting = {
  orderGroupId: undefined,
  projectId: undefined,
  iosSchemaId: '',
  partnerCode: '',
  partnerName: '',
  accessKey: '',
  secretKey: '',
  publicKey: '',
  apiEndpoint: '',
  apiEndpointQuery: '',
  apiEndpointRefund: '',
  isActive: true
}

function PaymentOnline(props) {
  const formRef = createRef<FormInstance>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    paymentService.getPaymentSetting().then((data) => {
      formRef.current?.setFieldsValue(data ? data : { ...emptyData })
    })
  }, [])

  const handleCancel = () => props.navigate(-1)

  const handleSubmit = () => {
    formRef.current?.validateFields().then(() => {
      const payload = formRef.current?.getFieldsValue()
      setLoading(true)
      return paymentService.updatePaymentSetting(payload as PaymentSetting).finally(() => setLoading(false))
    })
  }

  const renderActions = () => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className={'mr-1'} onClick={handleCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={loading} shape="round">
            {L('BTN_SAVE')}
          </Button>
        </Col>
      </Row>
    )
  }
  return (
    <WrapPageScroll renderActions={renderActions}>
      <h3>{L('FEE_PAYMENT_SETTING')}</h3>
      <Card>
        <Form
          layout="vertical"
          ref={formRef}
          validateMessages={validateMessages}
          initialValues={emptyData}
          size="middle">
          <Row gutter={16}>
            <Col md={{ span: 12 }}>
              <Form.Item name={'iosSchemaId'} label={L('PAYMENT_IOS_SCHEME_ID')} rules={rules.input}>
                <Input />
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }}>
              <Form.Item name={'partnerCode'} label={L('PAYMENT_PARTNER_CODE')} rules={rules.input}>
                <Input />
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }}>
              <Form.Item name={'partnerName'} label={L('PAYMENT_PARTNER_NAME')} rules={rules.input}>
                <Input />
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }}>
              <Form.Item name={'accessKey'} label={L('PAYMENT_ACCESS_KEY')} rules={rules.input}>
                <Input />
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }}>
              <Form.Item name={'secretKey'} label={L('PAYMENT_SECRET_KEY')} rules={rules.input}>
                <Input />
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }}>
              <Form.Item name={'publicKey'} label={L('PAYMENT_PUBLIC_KEY')} rules={rules.publicKey}>
                <Input />
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }}>
              <Form.Item name={'apiEndpoint'} label={L('PAYMENT_API_ENDPOINT')} rules={rules.input}>
                <Input />
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }}>
              <Form.Item name={'apiEndpointQuery'} label={L('PAYMENT_API_ENDPOINT_QUERY')} rules={rules.input}>
                <Input />
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }}>
              <Form.Item name={'apiEndpointRefund'} label={L('PAYMENT_API_ENDPOINT_REFUND')} rules={rules.input}>
                <Input />
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }}>
              <Form.Item
                name={'isActive'}
                label={L('FILTER_ACTIVE_STATUS')}
                rules={rules.required}
                valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </WrapPageScroll>
  )
}

export default withRouter(PaymentOnline)
