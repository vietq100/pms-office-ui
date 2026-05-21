import { Button, Col, Input, Row, Form } from 'antd'
import AccountStore from '../../../../stores/accountStore'
import AuthenticationStore from '../../../../stores/authenticationStore'
import { L } from '../../../../lib/abpUtility'
import SessionStore from '../../../../stores/sessionStore'
import rules from './index.validation'
import { validateMessages } from '../../../../lib/validation'
import { userLayout } from '@components/Layout/Router/router.config'
import { loginSteps, phoneStatus } from '@lib/appconst'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'

import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import PhoneInput from '@components/Inputs/PhoneInput/PhoneInput'
import Countdown from 'antd/lib/statistic/Countdown'
import { LeftOutlined } from '@ant-design/icons'
/* global grecaptcha */

export interface IPhoneLoginPanelProps {
  authenticationStore?: AuthenticationStore
  sessionStore?: SessionStore
  accountStore?: AccountStore
  history: any
  location: any
  handleBack: () => void
}

function PhoneLoginPanel(props: IPhoneLoginPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(loginSteps.login)
  const [errorMessage, setErrorMessage] = useState('')
  const [phoneNumberStatus, setPhoneNumberStatus] = useState(phoneStatus.undefined)
  const navigate = useNavigate()
  const [phoneNumber, setPhoneNumber] = useState<any>(undefined)
  const [allowResend, setAllowResend] = useState<boolean | undefined>(undefined)
  useEffect(() => {
    initFireBase()
  }, [])

  const initFireBase = () => {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('btn-submit-login', {
      size: 'invisible',
      callback: () => {
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
    const phoneCheck = await props.authenticationStore!.checkPhoneNumber(phoneNumber)
    setPhoneNumberStatus(phoneCheck.state)
    setPhoneNumber(phoneNumber)
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
  const location: any = useLocation()
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
          if (phoneNumberStatus === 1) {
            await props.authenticationStore!.loginSMS({
              idToken: user.user.Aa,
              phoneNumber: user.user.phoneNumber
            })
            if (location.state?.from?.pathname === '/logout') {
              return (window.location.href = '/')
            }
            return (window.location =
              location.state && location.state.from.pathname !== '/' ? location.state.from.pathname : '/')
          }
          if (phoneNumberStatus === 3) {
            props.authenticationStore!.phoneLoginModel = user.user
            navigate('/account' + userLayout.registerByOTP.path)
          }
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
    <>
      <Form onFinish={handleSubmit} validateMessages={validateMessages} layout={'vertical'} size="middle">
        <Row style={{ marginTop: '60px' }} gutter={[16, 16]}>
          {errorMessage && errorMessage.length > 0 && (
            <Col span={24} offset={0}>
              <label className="text-danger">{errorMessage}</label>
            </Col>
          )}
          <Col span={4} className="h-100 text-center">
            <Button
              className="rounded"
              size="large"
              icon={<LeftOutlined style={{ fontSize: '16px', color: '#2682d8' }} />}
              onClick={() => props.handleBack()}
            />
          </Col>
          <Col span={20}>
            <div className="w-100 text-left ml-1">
              <h2 className="ml-1">{L('LOGIN_WITH_OTP')}</h2>
            </div>
          </Col>
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
                <Form.Item name="phoneCode" rules={rules.userNameOrEmailAddress} label={L('PHONE_CODE')}>
                  <Input placeholder={L('PHONE_CODE')} size="middle" />
                </Form.Item>
              </Col>

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
              {allowResend !== false && (
                <Col span={24}>
                  <span>{L('OTP Code Sent')} · </span>

                  <Button onClick={() => resendPhoneCode(phoneNumber)} type={'link'} disabled={!allowResend}>
                    {allowResend ? (
                      <span>{L('BTN_RE_SEND_CODE')}</span>
                    ) : (
                      <span>
                        <Countdown
                          valueStyle={{ fontSize: '12px', color: 'grey' }}
                          value={Date.now() + 1000 * 60}
                          format="mm:ss"
                          onFinish={() => setAllowResend(true)}
                        />
                      </span>
                    )}
                  </Button>
                </Col>
              )}
            </>
          )}
        </Row>
      </Form>
    </>
  )
}

export default PhoneLoginPanel
