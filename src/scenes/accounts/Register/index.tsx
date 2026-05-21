import { LeftOutlined, LockOutlined } from '@ant-design/icons'
import PhoneInput from '@components/Inputs/PhoneInput/PhoneInput'
import { userLayout } from '@components/Layout/Router/router.config'
import { L } from '@lib/abpUtility'
import { notifyError, notifySuccess } from '@lib/helper'
import AuthenticationStore from '@stores/authenticationStore'
import Stores from '@stores/storeIdentifier'
import { Button, Card, Col, Row, Form, Input } from 'antd'
import { inject } from 'mobx-react'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useNavigate } from 'react-router'
import firebase from 'firebase/compat/app'
import { firebaseConfig } from '@lib/appconst'
import rules from './validation'
import Input6VerifyCode from '@components/Inputs/InputVerifyCode/Input6VerifyCode'

interface Props {
  authenticationStore: AuthenticationStore
}

const RegisterPage = inject(Stores.AuthenticationStore)(
  observer((props: Props) => {
    const currentYear = new Date().getFullYear()
    const navigate = useNavigate()
    const [code, setCode] = React.useState('')
    const [registerBaseInformation, setRegisterBaseInformation] = React.useState<any>(undefined)
    const [needEmail, setNeedEmail] = React.useState(false)
    const [enterCodeState, setEnterCodeState] = React.useState(false)
    const [formRegister] = Form.useForm()
    const [errorMessage, setErrorMessage] = React.useState('')
    React.useEffect(() => {
      initRecapt()
    }, [])

    const initFireBase = () => {
      firebase.initializeApp(firebaseConfig)
      firebase.auth().languageCode = 'vi'
    }

    const initRecapt = async () => {
      if (!firebase.apps.length) await initFireBase()

      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('btn-submit-register', {
        size: 'invisible',
        callback: (response) => {},
        'expired-callback': () => {}
      })
    }

    const sendPhoneCode = async (phoneNumber) => {
      const appVerifier = window.recaptchaVerifier
      if (!appVerifier) {
        return
      }
      const phoneCheck = await props.authenticationStore!.checkPhoneNumber(phoneNumber)

      if (phoneCheck.state === 1) {
        notifyError('', L('PHONENUMBER_ALREADY_HAVE_ACCOUNT'))
      } else {
        window.confirmationResult = await firebase
          .auth()
          .signInWithPhoneNumber(phoneNumber, appVerifier)
          .catch((error) => {
            setErrorMessage(error.message)
            window.recaptchaVerifier.render().then(function (widgetId) {
              grecaptcha.reset(widgetId)
            })
          })
        setEnterCodeState(true)
      }
    }
    const verifyPhoneCode = async (phoneCode) => {
      try {
        const confirmationResult = window.confirmationResult
        if (!confirmationResult) {
          return
        }
        confirmationResult
          .confirm(phoneCode)
          .then(async (user) => {
            await props.authenticationStore.registerAccount({
              name: registerBaseInformation.name,
              surname: registerBaseInformation.surname,
              emailAddress: registerBaseInformation.email,
              password: registerBaseInformation.password,
              phoneNumber: registerBaseInformation.prefix + registerBaseInformation.phoneNumber,
              phoneNumberIdToken: user.user.Aa
            })
            notifySuccess(L('SUCCESSFULLY'), L('REGISTER_SUCCESSFULLY'))
            navigate(userLayout.accountLogin.path)
          })
          .catch((error) => {
            setErrorMessage(error.message)
            window.recaptchaVerifier.render().then(function (widgetId) {
              grecaptcha.reset(widgetId)
            })
          })
      } catch (e) {}
    }

    React.useEffect(() => {
      if (abp.setting.values['App.UserManagement.TwoFactorLogin.IsEmailProviderEnabled'] === 'true') {
        setNeedEmail(true)
      } else {
        setNeedEmail(false)
      }
    }, [])
    const handleRegister = async () => {
      const values = await formRegister.validateFields()
      if (values.password !== values.passwordRetype) {
        notifyError('', L('RETYPE_PASSWORD_NOT_MATCH'))
        return
      }
      setRegisterBaseInformation(values)
      sendPhoneCode(values.prefix + values.phoneNumber)
    }

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
                  <Row className="mb-3" gutter={[16, 16]}>
                    <Col span={4} className="h-100 text-center">
                      <Button
                        className="rounded"
                        size="large"
                        icon={<LeftOutlined style={{ fontSize: '16px', color: '#2682d8' }} />}
                        onClick={() => navigate('/account' + userLayout.accountLogin.path)}
                      />
                    </Col>

                    {enterCodeState ? (
                      <>
                        <Col span={20}>
                          <div className="w-100 text-left ml-1">
                            <h2 className="ml-1">{L('REGISTER_TITLE')}</h2>
                            <div>{L('ENTER_YOUR_CODE')}</div>
                          </div>
                        </Col>
                        <Col className="text-danger">{errorMessage}</Col>
                        <Col>
                          <Input6VerifyCode onChange={(value) => setCode(value)} />
                        </Col>
                        <Col span={24} offset={0}>
                          <Button
                            id="btn-submit-register"
                            type="primary"
                            className="w-100 my-1"
                            shape="round"
                            onClick={() => verifyPhoneCode(code)}>
                            {L('VERIFY_CODE')}
                          </Button>
                        </Col>
                      </>
                    ) : (
                      <>
                        <Col span={20}>
                          <div className="w-100 text-left ml-1">
                            <h2 className="ml-1">{L('REGISTER_TITLE')}</h2>
                            <div>{L('ENTER_YOUR_INFORMATION')}</div>
                          </div>
                        </Col>
                        <Col span={24}>
                          <Form.Item name="surname" label={L('FIRST_NAME')} rules={rules.displayName}>
                            <Input size="large" placeholder={L('FIRST_NAME')} />
                          </Form.Item>
                          <Form.Item name="name" label={L('LAST_NAME')} rules={rules.displayName}>
                            <Input size="large" placeholder={L('LAST_NAME')} />
                          </Form.Item>
                          <Form.Item name="email" label={L('EMAIL')} rules={needEmail ? rules.displayName : undefined}>
                            <Input size="large" placeholder={L('EMAIL')} />
                          </Form.Item>
                          <PhoneInput />
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
                        </Col>
                        <Col span={24} offset={0}>
                          <Button
                            id="btn-submit-register"
                            type="primary"
                            className="w-100 my-1"
                            shape="round"
                            onClick={handleRegister}>
                            {L('SEND_VERIFY_CODE')}
                          </Button>
                        </Col>
                      </>
                    )}
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

export default RegisterPage
