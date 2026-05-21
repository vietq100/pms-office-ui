import * as React from 'react'

import { Col, Form, Input, Modal, Row, Select, Switch, DatePicker, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { L } from '../../../../lib/abpUtility'
import rules from './unit.validation'
import AppConsts, { dateFormat } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import AppComponentBase from '../../../../components/AppComponentBase'
import ResidentStore from '../../../../stores/member/resident/residentStore'
import UnitStore from '../../../../stores/project/unitStore'
import residentService from '../../../../services/member/resident/residentService'
import { validateMessages } from '../../../../lib/validation'
import { AsyncSelect, asyncSelectType } from '@components/Select/AsyncSelect'

const { formVerticalLayout } = AppConsts

export interface IUnitFormProps {
  residentStore?: ResidentStore
  unitStore?: UnitStore
  visible: boolean
  onCancel: () => void
  onCreate: () => void
  initialValue: any
}

@inject(Stores.UnitStore)
@inject(Stores.ResidentStore)
@observer
class UnitMoveInFormModal extends AppComponentBase<IUnitFormProps> {
  formRef: any = React.createRef()
  state = {
    confirmDirty: false,
    residents: []
  }

  async componentDidMount() {
    this.props.residentStore?.getMemberTypes()
    this.props.residentStore?.getMemberRoles()
  }

  findResidents = async (keyword) => {
    const results = await residentService.filterOptions({ keyword })
    this.setState({ residents: results || [] })
  }

  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      await this.props.unitStore?.moveIn(values)
      form.resetFields()
      this.props.onCreate()
    })
  }

  onCancel = () => {
    const form = this.formRef.current
    form.resetFields()
    this.props.onCancel()
  }

  render() {
    const { visible, residentStore, initialValue } = this.props
    // const { residents } = this.state
    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={this.onCancel}
        onOk={this.onSave}
        width={1024}
        title={L('UNIT_MOVE_IN')}>
        <Form
          ref={this.formRef}
          layout={'vertical'}
          initialValues={initialValue}
          validateMessages={validateMessages}
          size="middle">
          <Form.Item name={'unitId'} style={{ height: 0 }}>
            <Input hidden={true} />
          </Form.Item>
          <Row gutter={[24, 24]}>
            <Form.List name="residents">
              {(fields, { add }) => {
                return (
                  <>
                    {fields.map((field) => (
                      <Col sm={{ span: 12, offset: 0 }} key={field.key}>
                        <Row gutter={[16, 0]} style={{ border: '1px dashed #d9d9d9' }}>
                          <Col sm={{ span: 12, offset: 0 }}>
                            <Form.Item
                              label={L('UNIT_RESIDENT')}
                              {...formVerticalLayout}
                              name={[field.name, 'parentId']}
                              rules={rules.name}>
                              <AsyncSelect type={asyncSelectType.resident} fieldName={'label'} fieldValue={'value'} />
                            </Form.Item>
                          </Col>
                          <Col sm={{ span: 12, offset: 0 }}>
                            <Form.Item
                              label={L('UNIT_RESIDENT_ROLE')}
                              {...formVerticalLayout}
                              name={[field.name, 'roleId']}
                              rules={rules.name}>
                              <Select className="full-width">
                                {this.renderOptions(residentStore?.memberRoles || [])}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col sm={{ span: 12, offset: 0 }}>
                            <Form.Item
                              label={L('UNIT_RESIDENT_TYPE')}
                              {...formVerticalLayout}
                              name={[field.name, 'typeId']}
                              rules={rules.name}>
                              <Select className="full-width">
                                {this.renderOptions(residentStore?.memberTypes || [])}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col sm={{ span: 12, offset: 0 }}>
                            <Form.Item
                              label={L('UNIT_RESIDENT_MOVE_IN_DATE')}
                              {...formVerticalLayout}
                              name={[field.name, 'handOverDate']}>
                              <DatePicker className="full-width" format={dateFormat} placeholder={L('SELECT_DATE')} />
                            </Form.Item>
                          </Col>
                          <Col sm={{ span: 12, offset: 0 }}>
                            <Form.Item
                              label={L('UNIT_RESIDENT_IS_PRIMARY_CONTACT')}
                              {...formVerticalLayout}
                              name={[field.name, 'isPrimaryContact']}
                              valuePropName="checked">
                              <Switch defaultChecked />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                    ))}
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Button type="dashed" onClick={add} className="full-width">
                        <PlusOutlined /> {L('BTN_ADD_RESIDENT')}
                      </Button>
                    </Col>
                  </>
                )
              }}
            </Form.List>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default UnitMoveInFormModal
