import { Button, Col, Input, Row, Form, Card } from 'antd'
import { loginSteps } from '@lib/appconst'
import { useEffect, useState } from 'react'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import PhoneInput from '@components/Inputs/PhoneInput/PhoneInput'
import Countdown from 'antd/lib/statistic/Countdown'
import AuthenticationStore from '@stores/authenticationStore'
import SessionStore from '@stores/sessionStore'
import AccountStore from '@stores/accountStore'
import Stores from '@stores/storeIdentifier'
import { inject, observer } from 'mobx-react'
import { L } from '@lib/abpUtility'
import { validateMessages } from '@lib/validation'
/* global grecaptcha */

export interface IPhoneLoginPanelProps {
  authenticationStore?: AuthenticationStore
  sessionStore?: SessionStore
  accountStore?: AccountStore
  history?: any
  location?: any
}

const RegisterPhoneForSocial = inject(
  Stores.AuthenticationStore,
  Stores.AccountStore,
  Stores.SessionStore
)(
  observer((props: IPhoneLoginPanelProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(loginSteps.login)
    const [errorMessage, setErrorMessage] = useState('')
    const [phoneNumber, setPhoneNumber] = useState<any>(undefined)
    const [allowResend, setAllowResend] = useState<boolean | undefined>(undefined)
    useEffect(() => {
      initFireBase()
    }, [])

    const initFireBase = () => {
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('btn-submit-login', {
        size: 'invisible',
        callback: (response) => {
          console.log(response)
          setStep(loginSteps.projectSelect)
          setIsLoading(false)
        },
        'expired-callback': () => {
          setIsLoading(false)
        }
      })
    }

    const sendPhoneCode = async (phoneNumber) => {
      setIsLoading(true)
      const appVerifier = window.recaptchaVerifier
      if (!appVerifier) {
        setIsLoading(false)
        return
      }
      window.confirmationResult = await firebase
        .auth()
        .signInWithPhoneNumber(phoneNumber, appVerifier)
        .catch((error) => {
          setErrorMessage(error.message)
          window.recaptchaVerifier.render().then(function (widgetId) {
            grecaptcha.reset(widgetId)
          })
        })
      setIsLoading(false)
    }

    const resendPhoneCode = async (phoneNumber) => {
      setIsLoading(true)
      const appVerifier = new firebase.auth.RecaptchaVerifier('btn-submit-login', {
        size: 'invisible'
      })
      setPhoneNumber(phoneNumber)
      window.confirmationResult = await firebase
        .auth()
        .signInWithPhoneNumber(phoneNumber, appVerifier)
        .then(() => setAllowResend(false))
        .catch((error) => {
          setErrorMessage(error.message)
          window.recaptchaVerifier.render().then(function (widgetId) {
            grecaptcha.reset(widgetId)
          })
        })
      setIsLoading(false)
    }

    const verifyPhoneCode = async (phoneCode) => {
      try {
        setIsLoading(true)
        const confirmationResult = window.confirmationResult
        if (!confirmationResult) {
          setIsLoading(false)
          return
        }
        confirmationResult
          .confirm(phoneCode)
          .then(async (user) => {
            await props.authenticationStore!.loginSocial({
              PhoneNumberIdToken: user.user.Aa,
              phoneNumber: user.user.phoneNumber
            })
            window.location.href = '/'
          })
          .catch((error) => {
            setErrorMessage(error.message)
          })
          .finally(() => setIsLoading(false))
      } catch (e) {
        console.log(e)
      }
    }

    const handleSubmit = async (values) => {
      const phoneNumber = values.prefix + values.phoneNumber
      if (step === loginSteps.login) {
        await sendPhoneCode(phoneNumber)
      } else {
        await verifyPhoneCode(values.phoneCode)
      }
    }

    return (
      <Row className="page-login">
        <Col span={2}></Col>
        <Col xs={24} md={8} className="h-100 col-left">
          <Card
            style={{
              height: 900,
              backgroundImage: 'url(/static/media/bg-form.dd8f7bb34ff6dd88a5c6.svg)',
              backgroundSize: 'cover',
              borderRadius: 40
            }}
            className="ant-card ant-card-bordered col-left form">
            <div style={{ textAlign: 'center' }}>
              <img src="../../../assets/images/logo-horizontal.png" className="logo-horizontal" />
              <br />
              <img src="../../../assets/images/auth/union.png" />
              <p className="mt-3 welcome-message">{L('REGISTER_PHONE_FOR_SOCIAL')}</p>
            </div>
            <div className="text-center w-100">
              <div style={{ maxWidth: '360px', margin: 'auto' }}>
                <Form onFinish={handleSubmit} validateMessages={validateMessages} layout={'vertical'} size="middle">
                  <Row style={{ marginTop: '60px' }}>
                    {errorMessage && errorMessage.length > 0 && (
                      <Col span={24} offset={0}>
                        <label className="text-danger">{errorMessage}</label>
                      </Col>
                    )}

                    {step === loginSteps.login && (
                      <>
                        <Col span={24} offset={0}>
                          <PhoneInput />
                        </Col>
                        <Col span={24}>
                          <Button
                            style={{ width: '100%', marginTop: '10px' }}
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            shape="round"
                            id="btn-submit-login">
                            {L('BTN_GET_VERIFICATION_CODE')}
                          </Button>
                        </Col>
                      </>
                    )}
                    {step === loginSteps.projectSelect && (
                      <>
                        <Col span={24} offset={0}>
                          <Form.Item name="phoneCode" label={L('PHONE_CODE')}>
                            <Input placeholder={L('PHONE_CODE')} size="large" />
                          </Form.Item>
                        </Col>
                        {allowResend !== false && (
                          <Col span={24}>
                            <Button
                              style={{ width: '100%', marginTop: '10px' }}
                              onClick={() => resendPhoneCode(phoneNumber)}
                              loading={isLoading}
                              shape="round"
                              type={allowResend ? 'link' : 'default'}
                              disabled={!allowResend}
                              id="btn-submit-login">
                              {allowResend ? (
                                <span>{L('BTN_RE_SEND_CODE')}</span>
                              ) : (
                                <span>
                                  <Countdown
                                    valueStyle={{
                                      fontSize: '12px',
                                      color: 'grey'
                                    }}
                                    value={Date.now() + 1000 * 60 * 2}
                                    format="mm:ss"
                                    onFinish={() => setAllowResend(true)}
                                  />
                                </span>
                              )}
                            </Button>
                          </Col>
                        )}
                        <Col span={24}>
                          <Button
                            style={{ width: '100%', marginTop: '10px' }}
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            shape="round"
                            id="btn-submit-login">
                            {L('BTN_VERIFY_CODE')}
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
export default RegisterPhoneForSocial
