import { createRef, useEffect, useState } from 'react'
import { Button, Card, Col, Form, Input, Row, Switch } from 'antd'
import { L, isGranted, isGrantedAny } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import { validateMessages } from '@lib/validation'
import { PaymentSetting } from '@models/fee/payment'
import paymentService from '@services/fee/paymentService'
import withRouter from '@components/Layout/Router/withRouter'
import { FormInstance } from 'antd/es/form'
import { appPermissions } from '@lib/appconst'
import './index.less'
import NumberInput from '@components/Inputs/NumberInput'

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
  projectId: undefined,
  orderGroupId: undefined,
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

function PaymentOnline() {
  const formRef = createRef<FormInstance>()
  const [loading, setLoading] = useState(false)
  const [visibleDBA, setVisibleDBA] = useState(false)
  const [visibleOBA, setVisibleOBA] = useState(false)
  useEffect(() => {
    paymentService.getPaymentSetting().then((data: any) => {
      formRef.current?.setFieldsValue(data ? data : { ...emptyData })
      data?.dba ? setVisibleDBA(true) : setVisibleDBA(false)
      data?.oba ? setVisibleOBA(true) : setVisibleOBA(false)
    })
  }, [])

  const handleSubmit = () => {
    formRef.current?.validateFields().then(() => {
      const payload = formRef.current?.getFieldsValue()
      setLoading(true)
      return paymentService.updatePaymentSetting(payload as PaymentSetting).finally(() => setLoading(false))
    })
  }
  const onRemoveSetting = (dataIndex: string) => {
    if (dataIndex === 'dba') {
      formRef.current?.setFieldValue('dba', {})
      setVisibleDBA(false)
    }
    if (dataIndex === 'oba') {
      formRef.current?.setFieldValue('oba', {})
      setVisibleOBA(false)
    }
  }

  const renderActions = (loading?) => {
    return (
      <Row gutter={4}>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button
            type="primary"
            disabled={
              !isGrantedAny(appPermissions.paymentSetting.create) || !isGranted(appPermissions.paymentSetting.update)
            }
            onClick={handleSubmit}
            loading={loading}
            shape="round">
            {L('BTN_SAVE')}
          </Button>
        </Col>
      </Row>
    )
  }
  return (
    <>
      <WrapPageScroll renderActions={() => renderActions(loading)}>
        <Card>
          <Form
            layout="vertical"
            ref={formRef}
            validateMessages={validateMessages}
            initialValues={emptyData}
            size="middle">
            <Row gutter={[16, 0]}>
              {visibleDBA ? (
                <Col span={12}>
                  <Row gutter={[6, 2]} className="mr-1">
                    <h3>{L('FEE_PAYMENT_SETTING_MOMO_1')}</h3>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['dba', 'iosSchemaId']} label={L('PAYMENT_IOS_SCHEME_ID')} rules={rules.input}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['dba', 'partnerCode']} label={L('PAYMENT_PARTNER_CODE')} rules={rules.input}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['dba', 'partnerName']} label={L('PAYMENT_PARTNER_NAME')} rules={rules.input}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['dba', 'accessKey']} label={L('PAYMENT_ACCESS_KEY')} rules={rules.input}>
                        <Input.Password />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['dba', 'secretKey']} label={L('PAYMENT_SECRET_KEY')} rules={rules.input}>
                        <Input.Password />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['dba', 'publicKey']} label={L('PAYMENT_PUBLIC_KEY')} rules={rules.publicKey}>
                        <Input.Password />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['dba', 'apiEndpoint']} label={L('PAYMENT_API_ENDPOINT')} rules={rules.input}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item
                        name={['dba', 'apiEndpointQuery']}
                        label={L('PAYMENT_API_ENDPOINT_QUERY')}
                        rules={rules.input}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item
                        name={['dba', 'apiEndpointRefund']}
                        label={L('PAYMENT_API_ENDPOINT_REFUND')}
                        rules={rules.input}>
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col md={{ span: 24 }}>
                      <Form.Item name={['dba', 'orderGroupId']} label={L('ORDER_GROUP_ID')}>
                        <NumberInput />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item
                        name={['dba', 'isActive']}
                        label={L('FILTER_ACTIVE_STATUS')}
                        rules={rules.required}
                        valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Button className="full-width" size="middle" onClick={() => onRemoveSetting('dba')}>
                        {L('REMOVE')}
                      </Button>
                    </Col>
                  </Row>
                </Col>
              ) : (
                <Col span={12}>
                  <Button className="full-width" size="middle" type="primary" onClick={() => setVisibleDBA(true)}>
                    {L('ADD_NEW')}
                  </Button>
                </Col>
              )}
              {visibleOBA ? (
                <Col span={12}>
                  <Row gutter={[6, 2]} className="border-left">
                    <h3>{L('FEE_PAYMENT_SETTING_MOMO_2')}</h3>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['oba', 'iosSchemaId']} label={L('PAYMENT_IOS_SCHEME_ID')} rules={rules.input}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['oba', 'partnerCode']} label={L('PAYMENT_PARTNER_CODE')} rules={rules.input}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['oba', 'partnerName']} label={L('PAYMENT_PARTNER_NAME')} rules={rules.input}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['oba', 'accessKey']} label={L('PAYMENT_ACCESS_KEY')} rules={rules.input}>
                        <Input.Password />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['oba', 'secretKey']} label={L('PAYMENT_SECRET_KEY')} rules={rules.input}>
                        <Input.Password />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['oba', 'publicKey']} label={L('PAYMENT_PUBLIC_KEY')} rules={rules.publicKey}>
                        <Input.Password />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['oba', 'apiEndpoint']} label={L('PAYMENT_API_ENDPOINT')} rules={rules.input}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item
                        name={['oba', 'apiEndpointQuery']}
                        label={L('PAYMENT_API_ENDPOINT_QUERY')}
                        rules={rules.input}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item
                        name={['oba', 'apiEndpointRefund']}
                        label={L('PAYMENT_API_ENDPOINT_REFUND')}
                        rules={rules.input}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item name={['oba', 'orderGroupId']} label={L('ORDER_GROUP_ID')}>
                        <NumberInput />
                      </Form.Item>
                    </Col>
                    <Col md={{ span: 24 }}>
                      <Form.Item
                        name={['oba', 'isActive']}
                        label={L('FILTER_ACTIVE_STATUS')}
                        rules={rules.required}
                        valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Button className="full-width" size="middle" onClick={() => onRemoveSetting('oba')}>
                        {L('REMOVE')}
                      </Button>
                    </Col>
                  </Row>
                </Col>
              ) : (
                <Col span={12}>
                  <Button className="full-width" size="middle" type="primary" onClick={() => setVisibleOBA(true)}>
                    {L('ADD_NEW')}
                  </Button>
                </Col>
              )}
            </Row>
          </Form>
        </Card>
      </WrapPageScroll>
    </>
  )
}

export default withRouter(PaymentOnline)
