import React from 'react'
import { LeftOutlined, LockOutlined } from '@ant-design/icons'
import { userLayout } from '@components/Layout/Router/router.config'
import { L } from '@lib/abpUtility'
import { Button, Card, Col, Row, Form, Input } from 'antd'
import { useNavigate } from 'react-router'
import './index.less'
import { inject } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { observer } from 'mobx-react-lite'
import AuthenticationStore from '@stores/authenticationStore'
import rules from './validation'
interface Props {
  authenticationStore: AuthenticationStore
}

const SMSRegisterAccount = inject(Stores.AuthenticationStore)(
  observer((props: Props) => {
    const currentYear = new Date().getFullYear()
    const navigate = useNavigate()
    const [formRegister] = Form.useForm()

    const createAccount = async () => {
      const values = await formRegister.validateFields()
      const authUserFromFirebase = props.authenticationStore.phoneLoginModel
      await props.authenticationStore.registerBySMS({
        ...values,
        idToken: authUserFromFirebase?.Aa
      })
      window.location.href = '/'
    }

    const [allowPassword, setAllowPassword] = React.useState(false)

    React.useEffect(() => {
      formRegister.setFieldsValue({
        phoneNumber: props.authenticationStore.phoneLoginModel?.phoneNumber
      })
      props.authenticationStore.getMethod().then((value) => {
        setAllowPassword(value.twoFactorLogin.isEmailProviderEnabled)
      })
    }, [])
    return (
      <Row className="page-register">
        <Col xs={0} md={16} className="h-100 col-right">
          <span className="footer-copy-right">{L('COPY_RIGHT_{0}', currentYear)}</span>
        </Col>
        <Col xs={24} md={8} className="h-100 col-left">
          <Card bordered={false} className="h-100">
            <div style={{ textAlign: 'center' }}>
              <img src="/assets/images/logoBwid.png" />
              <br />
              <img src="../../../assets/images/auth/union.png" />
              <p className="mt-3 welcome-message">{L('WELCOME_MESSAGE')}</p>
            </div>
            <div className="text-center w-100">
              <div style={{ maxWidth: '360px', margin: 'auto' }}>
                <Form form={formRegister} layout="vertical">
                  <Row className="mb-3">
                    <Col span={4} className="h-100 text-center">
                      <Button
                        className="rounded"
                        size="large"
                        icon={<LeftOutlined style={{ fontSize: '16px', color: '#2682d8' }} />}
                        onClick={() => navigate(userLayout.accountLogin.path)}
                      />
                    </Col>
                    <Col span={20}>
                      <div className="w-100 text-left">
                        <h2>{L('REGISTER_TITLE')}</h2>
                        <div>{L('ENTER_YOUR_INFORMATION')}</div>
                      </div>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="displayName" label={L('FULL_NAME')} rules={rules.displayName}>
                        <Input size="large" placeholder={L('FULL_NAME')} />
                      </Form.Item>
                      <Form.Item name="emailAddress" label={L('EMAIL')} rules={rules.email}>
                        <Input size="large" placeholder={L('EMAIL')} />
                      </Form.Item>
                      <Form.Item name="phoneNumber" label={L('PHONE_NUMBER')} rules={rules.phoneNumber}>
                        <Input size="large" placeholder={L('PHONE_NUMBER')} disabled />
                      </Form.Item>
                      {allowPassword && (
                        <>
                          <div style={{ wordWrap: 'break-word' }}>
                            {L('WE_SUPPORT_LOGIN_VIA_PHONE_NUMBER_AND_PASSWORD')}
                          </div>
                          <Form.Item name="password" label={L('NEW_PASSWORD')}>
                            <Input.Password
                              visibilityToggle
                              size="large"
                              placeholder={L('NEW_PASSWORD')}
                              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            />
                          </Form.Item>
                          <Form.Item name="passwordRetype" label={L('NEW_PASSWORD_RETYPE')}>
                            <Input.Password
                              visibilityToggle
                              size="large"
                              placeholder={L('NEW_PASSWORD_RETYPE')}
                              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            />
                          </Form.Item>
                        </>
                      )}
                    </Col>
                    <Col span={24} offset={0}>
                      <Button type="primary" className="w-100 my-1" shape="round" onClick={createAccount}>
                        {L('REGISTER')}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    )
  })
)

export default SMSRegisterAccount
