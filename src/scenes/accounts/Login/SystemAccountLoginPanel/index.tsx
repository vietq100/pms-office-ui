
import * as React from 'react'

import { Button, Col, Row, Form } from 'antd'
import { inject, observer } from 'mobx-react'

import AccountStore from '@stores/accountStore'
import AuthenticationStore from '@stores/authenticationStore'
import { L } from '@lib/abpUtility'

import SessionStore from '@stores/sessionStore'
import Stores from '@stores/storeIdentifier'
import rules from './index.validation'
import { validateMessages } from '@lib/validation'
import LoginProjectPanel from '@scenes/accounts/LoginProjectPanel'
import { LeftOutlined } from '@ant-design/icons/lib'
import AppConsts, { loginSteps, userType } from '@lib/appconst'
import { TenantLoginModel } from '@services/tokenAuth/dto/authenticationModel'

import withRouter from '@components/Layout/Router/withRouter'
import SecurityConfirm from '../SecurityConfirm'
import FormInput from '@components/FormItem/FormInput'
import FormInputPassword from '@components/FormItem/FormInput/FormInputPassword'
import { userLayout } from '@components/Layout/Router/router.config'

const { authorization } = AppConsts
declare let abp: any

export interface ILoginProps {
  authenticationStore?: AuthenticationStore
  sessionStore?: SessionStore
  accountStore?: AccountStore
  navigate: any
  location: any
  form: any
  handleBack: () => void
}

@inject(Stores.AuthenticationStore, Stores.SessionStore, Stores.AccountStore)
@observer
class SystemAccountLoginPanel extends React.Component<ILoginProps> {
  state = {
    loginValues: {},
    userType: userType.staff,
    step: loginSteps.login
  }

  componentDidMount(): void {
    const params = new URLSearchParams(this.props.location?.search)
    if (
      params.get('step') === loginSteps.projectSelect + '' || // case: step 2
      (abp.session.userId && !localStorage.getItem(authorization.projectId))
    ) {
      // case: login
      this.setState({ step: loginSteps.projectSelect })
    }
  }

  handleSubmit = async (values: any) => {
    const { loginModel } = this.props.authenticationStore!
    if (values) {
      switch (this.state.userType) {
        case userType.staff: {
          await this.props.authenticationStore!.login(values)
          sessionStorage.setItem('rememberMe', loginModel.rememberMe ? '1' : '0')
          localStorage.setItem(authorization.userType, '1')
          this.setState({ step: loginSteps.projectSelect })
          break
        }
        case userType.tenant: {
          const dataResponese: TenantLoginModel = await this.props.authenticationStore!.loginAsTenant(values)

          sessionStorage.setItem('rememberMe', loginModel.rememberMe ? '1' : '0')
          if (dataResponese.isTwoFactorEnabled) {
            this.setState({
              step: loginSteps.securityCodeConfirm,
              loginValues: values
            })
          } else {
            const { state } = this.props.location
            window.location = state && state.from.pathname !== '/' ? state.from.pathname : '/'
          }
          localStorage.setItem(authorization.userType, '2')
          break
        }
        default:
          return
      }
    }
  }

  handleConfirmCodeSubmit = async (SecurityCode: string) => {
    await this.props.authenticationStore!.loginWithSecurityCode({
      ...this.state.loginValues,
      SecurityCode
    })
    const { state } = this.props.location
    window.location = state && state.from.pathname !== '/' ? state.from.pathname : '/'
  }

  public render() {
    const { step } = this.state

    return (
      <>
        {step === loginSteps.login && (
          <>
            <div style={{ textAlign: 'center', marginTop: 100 }}>
              <img src="../../../assets/images/logo-horizontal.png" alt="" className="logo-horizontal" />
              <br />
              <img src="../../../assets/images/auth/union.png" alt="" />
              <p className="mt-3 welcome-message">{L('WELCOME_MESSAGE')}</p>
            </div>
            <Form onFinish={this.handleSubmit} validateMessages={validateMessages} layout={'vertical'} size="middle">
              <Row style={{ marginTop: '20px' }} gutter={[16, 16]}>
                <Col span={24} className="position-relative">
                  <div className="w-100 text-center ml-1">
                    <h2 className="ml-1">{L('LOGIN_WITH_ACCOUNT')}</h2>
                  </div>
                  <Button
                    type="ghost"
                    className="position-absolute"
                    icon={<LeftOutlined style={{ fontSize: '16px' }} />}
                    onClick={() => this.props.handleBack()}
                  />
                </Col>
                <Col span={24} offset={0}>
                  <FormInput
                    name="userNameOrEmailAddress"
                    rule={rules.userNameOrEmailAddress}
                    label={L('USERNAME_OR_EMAIL')}
                  />
                </Col>
                <Col span={24} offset={0}>
                  <FormInputPassword name="password" rule={rules.password} label={L('PASSWORD')} />
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Button
                    style={{ width: '100%', marginTop: '10px' }}
                    htmlType={'submit'}
                    type="primary"
                    loading={this.props.authenticationStore?.isLoading || false}
                    shape="round">
                    {L('BTN_LOGIN')}
                  </Button>
                </Col>

                <Col span={24} style={{ marginTop: '10px', textAlign: 'center' }}>
                  <a
                    onClick={() => this.props.navigate('/account' + userLayout.forgotPassword.path)}
                    style={{ fontWeight: 600 }}>
                    {L('FORGOT_PASSWORD')}
                  </a>
                </Col>
              </Row>
            </Form>
          </>
        )}
        {step === loginSteps.projectSelect && (
          <LoginProjectPanel navigate={this.props.navigate} location={this.props.location} />
        )}

        {step === loginSteps.securityCodeConfirm && (
          <SecurityConfirm
            handleBackToLogin={() => this.setState({ step: loginSteps.login })}
            loading={this.props.authenticationStore?.isLoading}
            handleConfirmCodeSubmit={this.handleConfirmCodeSubmit}
          />
        )}
      </>
    )
  }
}

export default withRouter(SystemAccountLoginPanel)
