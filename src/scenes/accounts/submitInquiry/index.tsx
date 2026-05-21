import * as React from 'react'
import { Card, Col, Input, Row, Form, Button } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import { L, LNotification } from '../../../lib/abpUtility'
import { validateMessages } from '../../../lib/validation'
import { userLayout } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import ListImageUpload from '@components/FileUpload/ListUpload'
import FileStore from '@stores/common/fileStore'

declare let abp: any

export interface ISubmitInquiry {
  navigate: any
}

@observer
class SubmitInquiry extends React.Component<ISubmitInquiry> {
  formRef: any = React.createRef()
  state = {
    isSubmit: false,
    isMobile: false,
    images: []
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
      abp.notify.success(LNotification('SUBMIT_INQUIRY_SUCCESS'))
      this.setState({ images: [] })
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
                  type="ghost"
                  className="position-absolute"
                  icon={<LeftOutlined style={{ fontSize: '14px' }} />}
                  onClick={() => this.backToLogin()}
                />
                <h3>{L('SUBMIT_INQUIRY_TITLE')}</h3>
              </div>

              <Row className="mt-3">
                <Col span={24} offset={0}>
                  <Form.Item name="title" rules={[{ required: true }]} label={L('SUBMIT_TITLE')}>
                    <Input placeholder={L('SUBMIT_TITLE')} size="large" />
                  </Form.Item>
                </Col>
                <Col span={24} offset={0}>
                  <Form.Item name="content" rules={[{ required: true }]} label={L('SUBMIT_CONTENT')}>
                    <Input.TextArea placeholder={L('SUBMIT_CONTENT')} size="large" rows={4} />
                  </Form.Item>
                </Col>
                <Col span={24} offset={0}>
                  <label>{L('INQUIRT_CONTENT_PLACEHOLDER')}</label>
                  <ul>
                    <li>{L('PLACEHOLDER_CONTENT_1')}</li>
                    <li>{L('PLACEHOLDER_CONTENT_2')}</li>
                    <li>{L('PLACEHOLDER_CONTENT_3')}</li>
                  </ul>
                </Col>
              </Row>
              <Col span={24} offset={0}>
                <ListImageUpload
                  maxFile={5}
                  maxSize={3}
                  fileStore={new FileStore()}
                  initialFileList={this.state.images}
                  changeFile={(fileList) => this.setState({ images: fileList })}
                />
                <label style={{ display: 'flex', justifyContent: 'center' }}>{L('INQUIRT_IAMGE')}</label>
              </Col>
              {this.state.isSubmit && (
                <Row className="mt-3">
                  <Col span={24} className="text-center">
                    {L('SUBMIT_CONTENT_SUCCESS_MESSAGE')}
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

export default withRouter(SubmitInquiry)
