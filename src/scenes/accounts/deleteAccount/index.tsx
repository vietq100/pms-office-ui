import './index.less'
import * as React from 'react'
import { Card, Col, Input, Row, Form, Button } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import { L, LNotification } from '../../../lib/abpUtility'
import { validateMessages } from '../../../lib/validation'
import { userLayout } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import { emailRegex } from '@lib/appconst'

declare let abp: any

export interface IDeleteAccount {
  navigate: any
}

@observer
class DeleteAccount extends React.Component<IDeleteAccount> {
  formRef: any = React.createRef()
  state = {
    isSubmit: false,
    isMobile: false
  }

  componentDidMount(): void {
    if (window.screen.width <= 760) {
      this.resize(true)
    } else {
      this.resize(false)
    }
  }
  resize = (isResize) => {
    this.setState({ isMobile: isResize })
  }
  handleSubmit = async (values: any) => {
    if (values) {
      this.setState({ isSubmit: true })
      abp.notify.success(LNotification('SENT_REQUEST_DELETE_ACCOUNT_SUCCESS'))
      this.formRef.current.resetFields()
      setTimeout(() => this.setState({ isSubmit: false }), 10000)
    }
  }

  backToLogin = () => {
    this.props.navigate('/account' + userLayout.accountLogin.path)
  }

  public render() {
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
                  type="default" ghost
                  className="position-absolute"
                  icon={<LeftOutlined style={{ fontSize: '14px' }} />}
                  onClick={() => this.backToLogin()}
                />
                <h3>{L('SENT_REQUEST_DELETE_ACCOUNT_TITLE')}</h3>
              </div>

              <Row className="mt-3">
                <Col span={24} offset={0}>
                  <Form.Item name="email" rules={[{ required: true, pattern: emailRegex }]} label={L('SUBMIT_EMAIL')}>
                    <Input placeholder={L('SUBMIT_EMAIL')} size="large" />
                  </Form.Item>
                </Col>
                <Col span={24} offset={0}>
                  <Form.Item name="reason" rules={[{ required: true }]} label={L('SUBMIT_REASON')}>
                    <Input.TextArea placeholder={L('SUBMIT_REASON')} size="large" rows={4} />
                  </Form.Item>
                </Col>
              </Row>

              {this.state.isSubmit && (
                <Row className="mt-3">
                  <Col span={24} className="text-center text-danger">
                    {L('SUBMIT_DELETE_ACCOUNT_SUCCESS_MESSAGE')}
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
                  <Button style={{ width: '100%' }} htmlType={'submit'} type="primary" shape="round">
                    {L('BTN_SENT_SUBMIT')}
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

export default withRouter(DeleteAccount)
