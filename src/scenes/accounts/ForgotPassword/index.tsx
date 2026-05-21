
import * as React from 'react'

import { Card, Col, Input, Row, Form, Button } from 'antd'
import { LeftOutlined, UserOutlined } from '@ant-design/icons'
import { inject, observer } from 'mobx-react'

import AccountStore from '../../../stores/accountStore'
import { L, LNotification } from '../../../lib/abpUtility'
import SessionStore from '../../../stores/sessionStore'
import Stores from '../../../stores/storeIdentifier'
import rules from './index.validation'
import { validateMessages } from '../../../lib/validation'
import { userLayout } from '@components/Layout/Router/router.config'
import { BarcodeOutlined, LockOutlined } from '@ant-design/icons/lib'
import withRouter from '@components/Layout/Router/withRouter'

declare let abp: any

export interface IForgotPasswordProps {
  sessionStore?: SessionStore
  accountStore?: AccountStore
  navigate: any
  location: any
  form: any
}

const forgotPassword = {
  sendRequest: 1,
  resetPassword: 2,
  finish: 3
}

@inject(Stores.SessionStore, Stores.AccountStore)
@observer
class ForgotPassword extends React.Component<IForgotPasswordProps> {
  formRef: any = React.createRef()
  state = {
    emailAddress: '',
    forgotPasswordStep: forgotPassword.sendRequest,
    isMobile: false
  }

  componentDidMount(): void {
    if (window.screen.width <= 760) {
      this.resize(true)
    } else {
      this.resize(false)
    }

    const params = new URLSearchParams(this.props.location?.search)
    const emailAddress = params.get('emailaddress')
    const resetCode = params.get('resetCode')
    if (emailAddress && resetCode) {
      this.setState({
        forgotPasswordStep: forgotPassword.resetPassword,
        emailAddress
      })
      const form = this.formRef.current
      form.setFieldsValue({ emailAddress, resetCode })
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize.bind(this))
  }
  resize = (isResize) => {
    this.setState({ isMobile: isResize })
  }
  handleSubmit = async (values: any) => {
    if (values) {
      switch (this.state.forgotPasswordStep) {
        case forgotPassword.sendRequest: {
          const sendSuccess = await this.props.accountStore!.requestForgotPassword(values)
          if (sendSuccess) {
            this.setState({
              forgotPasswordStep: forgotPassword.resetPassword,
              emailAddress: values.emailAddress
            })
            abp.notify.success(LNotification('REQUEST_FORGOT_PASSWORD_SUCCESS'))
          }
          break
        }
        case forgotPassword.resetPassword: {
          const sendSuccess = await this.props.accountStore!.resetPassword({
            ...values,
            emailAddress: this.state.emailAddress
          })
          if (sendSuccess) {
            this.setState({ forgotPasswordStep: forgotPassword.finish })
            abp.notify.success(LNotification('RESET_PASSWORD_SUCCESS'))
          }
          break
        }
      }
    }
  }

  backToLogin = () => {
    this.props.navigate('/account' + userLayout.accountLogin.path)
  }

  public render() {
    const { forgotPasswordStep } = this.state

    return (
      <Col className="name">
        <Form
          ref={this.formRef}
          onFinish={this.handleSubmit}
          validateMessages={validateMessages}
          layout={'vertical'}
          size="middle">
          <div className="d-flex justify-content-center">
            <Card className={this.state.isMobile ? 'card-mobie' : 'card-web'}>
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="ghost"
                  className="position-absolute"
                  icon={<LeftOutlined style={{ fontSize: '14px' }} />}
                  onClick={() => this.backToLogin()}
                />
                <h3>{L('FORGOT_PASSWORD_TITLE')}</h3>
              </div>
              {forgotPasswordStep === forgotPassword.sendRequest && (
                <Row className="mt-3">
                  <Col span={24} offset={0}>
                    <Form.Item name="emailAddress" rules={rules.userNameOrEmailAddress} label={L('EMAIL')}>
                      <Input
                        placeholder={L('EMAIL')}
                        prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              {forgotPasswordStep === forgotPassword.resetPassword && (
                <Row className="mt-3">
                  <Col span={24} offset={0}>
                    <Form.Item name="resetCode" rules={rules.resetCode} label={L('RESET_PASSWORD_CODE')}>
                      <Input
                        placeholder={L('RESET_PASSWORD_CODE')}
                        prefix={<BarcodeOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24} offset={0}>
                    <Form.Item name="password" rules={rules.password} label={L('NEW_PASSWORD')}>
                      <Input.Password
                        placeholder={L('NEW_PASSWORD')}
                        prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item name="passwordRetype" rules={rules.passwordRetype} label={L('NEW_PASSWORD_RETYPE')}>
                      <Input.Password
                        placeholder={L('NEW_PASSWORD_RETYPE')}
                        prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        size="large"
                        type="password"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              {forgotPasswordStep === forgotPassword.finish && (
                <Row className="mt-3">
                  <Col span={24} className="text-center">
                    {L('RESET_PASSWORD_SUCCESS_MESSAGE')}
                  </Col>
                </Row>
              )}
              <Row className="mt-3" gutter={[16, 16]}>
                <Col xs={{ span: 24 }} sm={{ span: 12 }}>
                  <Button style={{ width: '100%' }} type="default" shape="round" onClick={this.backToLogin}>
                    {L('BTN_BACK_TO_LOGIN')}
                  </Button>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 12 }}>
                  <Button
                    style={{ width: '100%' }}
                    htmlType={'submit'}
                    type="primary"
                    shape="round"
                    disabled={forgotPasswordStep === forgotPassword.finish}
                    loading={this.props.accountStore?.isLoading || false}>
                    {L(forgotPasswordStep === forgotPassword.sendRequest ? 'BTN_SEND' : 'BTN_RESET_PASSWORD')}
                  </Button>
                </Col>
              </Row>
            </Card>
          </div>
        </Form>
      </Col>
    )
  }
}

export default withRouter(ForgotPassword)
