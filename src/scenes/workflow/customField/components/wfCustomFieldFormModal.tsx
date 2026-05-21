import { Checkbox, Input, Modal, Form, Select, Col, Row } from 'antd'
import { L } from '../../../../lib/abpUtility'
import rules from './validation'
import AppConst, { modules, wfFieldTypes } from '../../../../lib/appconst'
import MultiLanguageInput from '../../../../components/Inputs/MultiLanguageInput'
import AppComponentBase from '../../../../components/AppComponentBase'
import { validateMessages } from '../../../../lib/validation'

const { formVerticalLayout } = AppConst

export interface ICreateOrUpdateWfCustomFieldProps {
  visible: boolean
  onCancel: () => void
  modalType: string
  onCreate: () => void
  formRef: any
  initModel?: any
  id?: number
  isLoading: boolean
  moduleId?: number
}

class WfCustomFieldFormModal extends AppComponentBase<ICreateOrUpdateWfCustomFieldProps> {
  state = {
    confirmDirty: false,
    fieldTypeId: undefined,
    wfFieldTypes: Object.keys(wfFieldTypes).map((key) => {
      return {
        label: `WF_FIELD_TYPE_${key.toUpperCase()}`,
        value: wfFieldTypes[key]
      }
    })
  }

  componentDidUpdate(prevProps): void {
    if (!prevProps.visible && this.props.visible && this.props.initModel) {
      this.setState({ fieldTypeId: this.props.initModel.fieldType })
    }
  }

  changeFieldType = (value) => {
    this.setState({ fieldTypeId: value })
  }

  render() {
    const { visible, onCancel, onCreate, id, formRef } = this.props
    const { fieldTypeId } = this.state
    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        onOk={onCreate}
        title={L(id ? 'EDIT' : 'CREATE')}
        confirmLoading={this.props.isLoading}>
        <Form ref={formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('WF_CUSTOM_FIELD_NAME')} {...formVerticalLayout} name="names" rules={rules.names}>
                <MultiLanguageInput />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('WF_CUSTOM_FIELD_TYPE')}
                {...formVerticalLayout}
                name="fieldType"
                rules={rules.fieldType}>
                <Select allowClear className="full-width" onChange={this.changeFieldType}>
                  {this.renderOptions(this.state.wfFieldTypes)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('WF_CUSTOM_FIELD_POSITION')} {...formVerticalLayout} name="position">
                <Input />
              </Form.Item>
            </Col>
            {fieldTypeId !== wfFieldTypes.list && fieldTypeId !== wfFieldTypes.dateTime && (
              <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item label={L('WF_CUSTOM_FIELD_MIN_LENGTH')} {...formVerticalLayout} name="minLength">
                  <Input />
                </Form.Item>
              </Col>
            )}
            {fieldTypeId !== wfFieldTypes.list && fieldTypeId !== wfFieldTypes.dateTime && (
              <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item label={L('WF_CUSTOM_FIELD_MAX_LENGTH')} {...formVerticalLayout} name="maxLength">
                  <Input />
                </Form.Item>
              </Col>
            )}
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('WF_CUSTOM_FIELD_REGEXP')} {...formVerticalLayout} name="regexp">
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('WF_CUSTOM_FIELD_DEFAULT_VALUE')} {...formVerticalLayout} name="defaultValue">
                <Input />
              </Form.Item>
            </Col>
            {fieldTypeId === wfFieldTypes.list && (
              <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item
                  label={L('WF_CUSTOM_FIELD_POSSIBLE_VALUE')}
                  {...formVerticalLayout}
                  name="possibleValues"
                  rules={rules.possibleValues}>
                  <Input />
                </Form.Item>
              </Col>
            )}
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={''} {...formVerticalLayout} name="isRequired" valuePropName="checked">
                <Checkbox>{L('WF_CUSTOM_FIELD_IS_REQUIRED')} </Checkbox>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item {...formVerticalLayout} name="isActive" valuePropName="checked">
                <Checkbox>{L('ACTIVE_STATUS')} </Checkbox>
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('WF_CUSTOM_FIELD_DESCRIPTION')} {...formVerticalLayout} name="descriptions">
                <MultiLanguageInput />
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

export default WfCustomFieldFormModal
