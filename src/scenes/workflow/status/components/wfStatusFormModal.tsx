import { Checkbox, Input, Modal, Form, Select, Row, Col } from 'antd'
import { L } from '../../../../lib/abpUtility'
import rules from './validation'
import AppConst, { modules } from '../../../../lib/appconst'
import MultiLanguageInput from '../../../../components/Inputs/MultiLanguageInput'
import AppComponentBase from '../../../../components/AppComponentBase'
import { validateMessages } from '../../../../lib/validation'

const { formVerticalLayout } = AppConst

export interface ICreateOrUpdateWfStatusProps {
  visible: boolean
  onCancel: () => void
  modalType: string
  onCreate: () => void
  formRef: any
  id?: number
  isLoading: boolean
  moduleId?: number
}

class WfStatusFormModal extends AppComponentBase<ICreateOrUpdateWfStatusProps> {
  state = {
    confirmDirty: false
  }

  render() {
    const { visible, onCancel, onCreate, id } = this.props
    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        onOk={onCreate}
        title={L(id ? 'EDIT' : 'CREATE')}
        confirmLoading={this.props.isLoading}>
        <Form ref={this.props.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('WF_STATUS_NAME')} {...formVerticalLayout} name="names" rules={rules.names}>
                <MultiLanguageInput />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('WF_STATUS_COLOR_CODE')}
                {...formVerticalLayout}
                name="colorCode"
                rules={rules.colorCode}>
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('WF_STATUS_BORDER_COLOR_CODE')}
                {...formVerticalLayout}
                name="borderColorCode"
                rules={rules.borderColorCode}>
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item {...formVerticalLayout} name="isDefault" valuePropName="checked">
                <Checkbox>{L('WF_STATUS_IS_DEFAULT')} </Checkbox>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item {...formVerticalLayout} name="isIssueClosed" valuePropName="checked">
                <Checkbox>{L('WF_STATUS_IS_CLOSED_ISSUE')} </Checkbox>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item {...formVerticalLayout} name="isActive" valuePropName="checked">
                <Checkbox>{L('ACTIVE_STATUS')} </Checkbox>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item {...formVerticalLayout} name="isFirstResponse" valuePropName="checked">
                <Checkbox>{L('1_ST_RESPONSE')} </Checkbox>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item {...formVerticalLayout} name="isSkipEscalationNotification" valuePropName="checked">
                <Checkbox>{L('SKIP_ESCALATION_NOTIFICATION')} </Checkbox>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item {...formVerticalLayout} name="isAdjustEscalationCompleteTime" valuePropName="checked">
                <Checkbox>{L('ADJUST_SLA_COMPLETION_TIME')} </Checkbox>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item {...formVerticalLayout} name="isReOpened" valuePropName="checked">
                <Checkbox>{L('WF_STATUS_IS_REOPEN')} </Checkbox>
              </Form.Item>
            </Col>
            {!this.props.moduleId && (
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item label={L('WF_MODULE')} {...formVerticalLayout} name="moduleIds" rules={rules.moduleIds}>
                  <Select showSearch showArrow allowClear className="full-width" mode="multiple">
                    {this.renderOptions(modules)}
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default WfStatusFormModal
