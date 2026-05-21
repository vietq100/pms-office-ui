
import * as React from 'react'

import { Button, Card, Col, Row } from 'antd'
import { inject, observer } from 'mobx-react'
import firebase from 'firebase/compat/app'
import AccountStore from '../../../stores/accountStore'
import AuthenticationStore from '../../../stores/authenticationStore'
import { L } from '../../../lib/abpUtility'
import SessionStore from '../../../stores/sessionStore'
import Stores from '../../../stores/storeIdentifier'
import { loginSteps, loginMethods, firebaseConfig } from '@lib/appconst'
import SystemAccountLoginPanel from '@scenes/accounts/Login/SystemAccountLoginPanel'

import SocialLogin from './SocialLogin/SocialLogin'
import { MailOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import LoginProjectPanel from '../LoginProjectPanel'
import Logo from '@assets/images/logo-horizontal.png'

export interface ILoginProps {
  authenticationStore?: AuthenticationStore
  sessionStore?: SessionStore
  accountStore?: AccountStore
  history: any
  location: any
  form: any
}

@inject(Stores.AuthenticationStore, Stores.SessionStore, Stores.AccountStore)
@observer
class Login extends React.Component<ILoginProps> {
  state = {
    step: loginSteps.login,
    method: null,
    isMobile: false,
    loginMethodsAllow: {
      allowSelfRegistration: false,
      isAppleAuthenticatorEnabled: false,
      isEmailProviderEnabled: true,
      isGoogleAuthenticatorEnabled: false,
      isMicrosoftAuthenticatorEnabled: false,
      isSmsProviderEnabled: false,
      useCaptchaOnRegistration: false
    }
  }

  async componentDidMount() {
    if (window.innerWidth <= 760) {
      this.resize(true)
    } else {
      this.resize(false)
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig)
      firebase.auth().languageCode = 'vi'
    }

    const res = await this.props.authenticationStore!.getMethod()
    this.setState({ loginMethodsAllow: res.twoFactorLogin })
  }

  resize = (isResize) => {
    this.setState({ isMobile: isResize })
  }

  handleSubmit = async (values: any) => {
    const { loginModel } = this.props.authenticationStore!
    if (values) {
      await this.props.authenticationStore!.login(values)
      sessionStorage.setItem('rememberMe', loginModel.rememberMe ? '1' : '0')
      const { state } = this.props.location
      window.location = state && state.from.pathname !== '/' ? state.from.pathname : '/'
    }
  }

  changeStep = async (value) => {
    this.setState({ step: value })
  }

  public render() {
    const { method, loginMethodsAllow } = this.state
    const currentYear = new Date().getFullYear()

    return (
      <>
        <Row className="page-login">
          <Col span={2}></Col>
          <Col xs={24} md={8} className="h-100 col-left">
            <Card
              className="form-login-style login-flex"
              bodyStyle={{
                display: 'flex',
                flexFlow: 'column wrap',
                justifyContent: 'space-between'
              }}>
              {method === null && this.state.step !== loginSteps.projectSelect && (
                <div>
                  <div style={{ textAlign: 'center', marginTop: 100 }}>
                    <img className="logo-horizontal" src={Logo} alt="logo" />
                    <br />
                    <img src="../../../assets/images/auth/union.png" alt="" />
                    <p className="mt-3 welcome-message">{L('WELCOME_MESSAGE')}</p>
                  </div>
                  {this.state.step !== loginSteps.projectSelect && (
                    <SocialLogin
                      changeStep={this.changeStep}
                      navigate={this.props.history}
                      authenticationStore={this.props.authenticationStore}
                      loginMethodsAllow={loginMethodsAllow}
                    />
                  )}

                  {loginMethodsAllow.isEmailProviderEnabled && this.state.step !== loginSteps.projectSelect && (
                    <Button
                      size="large"
                      className="w-100 my-1 text-left"
                      shape="round"
                      onClick={() => this.setState({ method: loginMethods.systemAccount })}
                      icon={<MailOutlined className="mx-3" />}>
                      {L('LOGIN_METHOD_NORMAL')}
                    </Button>
                  )}
                </div>
              )}

              {method === loginMethods.systemAccount && (
                <div>
                  {loginMethodsAllow.isEmailProviderEnabled && (
                    <SystemAccountLoginPanel
                      history={this.props.history}
                      location={useLocation}
                      authenticationStore={this.props.authenticationStore}
                      handleBack={() => this.setState({ method: null })}
                    />
                  )}
                </div>
              )}
              {this.state.step === loginSteps.projectSelect && (
                <LoginProjectPanel navigate={this.props.history} location={this.props.location} />
              )}
              <Row className="mb-3">
                <Col span={24} style={{ textAlign: 'center' }}>
                  <img src="../../../assets/images/auth/union.png" style={{ opacity: '.5' }} />
                </Col>
              </Row>
            </Card>
          </Col>
          {this.state.isMobile ? (
            <Col span={24} className="col-mobile">
              <div className="footer-copy-right ml-1 mr-1">{L('COPY_RIGHT_{0}', currentYear)}</div>
            </Col>
          ) : (
            <Col span={14} className="col-right">
              <span className="footer-copy-right">{L('COPY_RIGHT_{0}', currentYear)}</span>
            </Col>
          )}
        </Row>
      </>
    )
  }
}

export default Login
