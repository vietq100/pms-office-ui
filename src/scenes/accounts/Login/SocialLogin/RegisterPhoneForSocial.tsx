import './index.less'
import { Button, Col, Input, Row, Form } from 'antd'
import AccountStore from '../../../../stores/accountStore'
import AuthenticationStore from '../../../../stores/authenticationStore'
import { L } from '../../../../lib/abpUtility'
import SessionStore from '../../../../stores/sessionStore'
import rules from './index.validation'
import { validateMessages } from '../../../../lib/validation'
import { loginSteps } from '@lib/appconst'
import { useEffect, useState } from 'react'

import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import PhoneInput from '@components/Inputs/PhoneInput/PhoneInput'
import Countdown from 'antd/lib/statistic/Countdown'
/* global grecaptcha */
declare let abp: any

export interface IPhoneLoginPanelProps {
  authenticationStore?: AuthenticationStore
  sessionStore?: SessionStore
  accountStore?: AccountStore
  history?: any
  location?: any
}

function RegisterPhoneForSocial(props: IPhoneLoginPanelProps) {
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
    } catch (e) {}
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
              <Form.Item name="phoneCode" rules={rules.userNameOrEmailAddress} label={L('PHONE_CODE')}>
                <Input placeholder={L('PHONE_CODE')} size="middle" />
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
                        valueStyle={{ fontSize: '12px', color: 'grey' }}
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
  )
}
export default RegisterPhoneForSocial
