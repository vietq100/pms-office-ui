import { Checkbox, Modal, Form, Select, Col, Row } from 'antd'
import { L } from '../../../../lib/abpUtility'
import rules from './validation'
import AppConst, { modules } from '../../../../lib/appconst'
import MultiLanguageInput from '../../../../components/Inputs/MultiLanguageInput'
import AppComponentBase from '../../../../components/AppComponentBase'
import { validateMessages } from '../../../../lib/validation'

const { formVerticalLayout } = AppConst

export interface ICreateOrUpdateWfPriorityProps {
  visible: boolean
  onCancel: () => void
  modalType: string
  onCreate: () => void
  formRef: any
  id?: number
  isLoading: boolean
  moduleId?: number
}

class WfPriorityFormModal extends AppComponentBase<ICreateOrUpdateWfPriorityProps> {
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
              <Form.Item label={L('WF_PRIORITY_NAME')} {...formVerticalLayout} name="names" rules={rules.names}>
                <MultiLanguageInput />
              </Form.Item>
            </Col>
            {/*<Col sm={{ span: 12, offset: 0 }}>*/}
            {/*  <Form.Item*/}
            {/*    label={L('WF_PRIORITY_COLOR_CODE')}*/}
            {/*    {...formVerticalLayout}*/}
            {/*    name="icon"*/}
            {/*    rules={rules.surname}*/}
            {/*  >*/}
            {/*    <Input />*/}
            {/*  </Form.Item>*/}
            {/*</Col>*/}
            {/*<Col sm={{ span: 12, offset: 0 }}>*/}
            {/*  <Form.Item*/}
            {/*    label={L('WF_PRIORITY_BORDER_COLOR_CODE')}*/}
            {/*    {...formVerticalLayout}*/}
            {/*    name="icon"*/}
            {/*    rules={rules.surname}*/}
            {/*  >*/}
            {/*    <Input />*/}
            {/*  </Form.Item>*/}
            {/*</Col>*/}
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item {...formVerticalLayout} name="isDefault" valuePropName="checked">
                <Checkbox>{L('WF_PRIORITY_IS_DEFAULT')} </Checkbox>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item {...formVerticalLayout} name="isActive" valuePropName="checked">
                <Checkbox>{L('WF_PRIORITY_IS_ACTIVE')} </Checkbox>
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

export default WfPriorityFormModal
