import * as React from 'react'

import { Switch, Input, InputNumber, Form, Upload, Col, Row } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { L } from '../../../../lib/abpUtility'
import rules from './project.validation'
import AppConsts from '../../../../lib/appconst'
import { validateMessages } from '../../../../lib/validation'
const { formVerticalLayout } = AppConsts

export interface ICreateOrUpdateUserProps {
  formRef: any
}

class ProjectForm extends React.Component<ICreateOrUpdateUserProps> {
  state = {
    confirmDirty: false
  }

  render() {
    const normFile = (e) => {
      if (Array.isArray(e)) {
        return e
      }
      return e && e.fileList
    }

    return (
      <>
        <Form ref={this.props.formRef} validateMessages={validateMessages} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('PROJECT_PROJECT_NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('PROJECT_PROJECT_CODE')} {...formVerticalLayout} name="code" rules={rules.code}>
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('PROJECT_INVESTOR')} {...formVerticalLayout} name="investorName">
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('PROJECT_LOCATION')} {...formVerticalLayout} name="address">
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('PROJECT_HOTLINE')} {...formVerticalLayout} name="hotline">
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('PROJECT_NUMBER_LIMIT_REQUEST')} {...formVerticalLayout} name="numberOfLimit">
                <InputNumber className={'full-width'} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('ACTIVE_STATUS')} {...formVerticalLayout} name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('PROJECT_LOGO')} {...formVerticalLayout}>
                <Form.Item name="dragger" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                  <Upload.Dragger name="files" action="/upload.do">
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">{L('FILE_INSTRUCTION')}</p>
                    <p className="ant-upload-hint">{L('FILE_HINT')}</p>
                  </Upload.Dragger>
                </Form.Item>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </>
    )
  }
}

export default ProjectForm
