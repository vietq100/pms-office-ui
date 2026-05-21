import { Button, Col, Divider, Form, Row } from 'antd'
import { L, isGranted, isGrantedAny } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import { validateMessages } from '@lib/validation'
import withRouter from '@components/Layout/Router/withRouter'
import { appPermissions } from '@lib/appconst'
import CKEditorInput from '@components/Inputs/CKEditorInput'
import ProjectStore from '@stores/project/projectStore'
import React from 'react'
import AppComponentBase from '@components/AppComponentBase'
import Stores from '@stores/storeIdentifier'
import { inject, observer } from 'mobx-react'

export interface Props {
  projectStore: ProjectStore
  navigate: any
}
@inject(Stores.ProjectStore)
@observer
class SettingHederFooter extends AppComponentBase<Props> {
  formRef: any = React.createRef()

  async componentDidMount() {
    this.getFeeTemplateInfoSettings()
  }
  getFeeTemplateInfoSettings = async () => {
    await this.props.projectStore.getFeeTemplateInfoSettings()
    this.formRef.current.setFieldsValue({
      ...this.props.projectStore.templateInfoHeaderFooter
    })
  }
  handleSubmit = () => {
    this.formRef.current.validateFields().then(async (values: any) => {
      await this.props.projectStore.updateFeeTemplateInfoSettings(values)
      this.props.projectStore.getFeeTemplateInfoSettings()
    })
  }

  renderActions = (loading?) => {
    return (
      <Row gutter={4}>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button
            type="primary"
            disabled={
              !isGrantedAny(appPermissions.paymentSetting.create) || !isGranted(appPermissions.paymentSetting.update)
            }
            onClick={this.handleSubmit}
            loading={loading}
            shape="round">
            {L('BTN_SAVE')}
          </Button>
        </Col>
      </Row>
    )
  }
  public render() {
    const { isLoading } = this.props.projectStore
    return (
      <>
        <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
          <Form layout="vertical" ref={this.formRef} validateMessages={validateMessages} size="middle">
            <Row gutter={16}>
              <Col md={{ span: 24 }}>
                <Divider orientation="left" orientationMargin="0">
                  <h4>{L('SETTING_TITLE_FEE_NOTIFICATION')}</h4>
                </Divider>
              </Col>
              <Col md={{ span: 24 }}>
                <Form.Item
                  label={L('SETTING_HEADER')}
                  name={['feeNotification', 'header']}
                  rules={[{ required: true }]}>
                  <CKEditorInput />
                </Form.Item>
              </Col>
              <Divider orientation="left"></Divider>
              <Col md={{ span: 24 }}>
                <Form.Item
                  label={L('SETTING_FOOTER')}
                  name={['feeNotification', 'footer']}
                  rules={[{ required: true }]}>
                  <CKEditorInput />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col md={{ span: 24 }}>
                <Divider orientation="left" orientationMargin="0">
                  <h4>{L('SETTING_TITLE_FEE_STOP_SERVICE_NOTICATION')}</h4>
                </Divider>
              </Col>
              <Col md={{ span: 24 }}>
                <Form.Item
                  label={L('SETTING_HEADER')}
                  name={['feeStopServiceNotification', 'header']}
                  rules={[{ required: true }]}>
                  <CKEditorInput />
                </Form.Item>
              </Col>
              <Divider />
              <Col md={{ span: 24 }}>
                <Form.Item
                  label={L('SETTING_FOOTER')}
                  name={['feeStopServiceNotification', 'footer']}
                  rules={[{ required: true }]}>
                  <CKEditorInput />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </WrapPageScroll>
      </>
    )
  }
}

export default withRouter(SettingHederFooter)
