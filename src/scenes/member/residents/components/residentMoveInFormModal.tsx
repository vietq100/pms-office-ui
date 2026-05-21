import * as React from 'react'

import { Col, Form, Input, Modal, Row, Select, DatePicker, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { L } from '@lib/abpUtility'
import rules from './resident.validation'
import AppConsts, { dateFormat } from '@lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppComponentBase from '@components/AppComponentBase'
import ResidentStore from '@stores/member/resident/residentStore'
import UnitStore from '@stores/project/unitStore'
import { validateMessages } from '@lib/validation'
import unitService from '@services/project/unitService'
import { filterOptions } from '@lib/helper'
import { MinusOutlined } from '@ant-design/icons/lib'
import SessionStore from '@stores/sessionStore'

const { formVerticalLayout } = AppConsts

export interface IUnitFormProps {
  residentStore?: ResidentStore
  sessionStore?: SessionStore
  unitStore?: UnitStore
  visible: boolean
  onCancel: () => void
  onCreate: () => void
  initialValue: any
  projectOptions: any
}

@inject(Stores.UnitStore)
@inject(Stores.ResidentStore)
@inject(Stores.SessionStore)
@observer
class ResidentMoveInFormModal extends AppComponentBase<IUnitFormProps> {
  formRef: any = React.createRef()
  state = {
    loading: false,
    projectId: undefined,
    units: []
  }

  async componentDidMount() {
    this.props.residentStore?.getMemberTypes()
    this.props.residentStore?.getMemberRoles()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible) {
      if (this.props.visible) {
        const form = this.formRef.current
        if (this.props.initialValue?.projectId) {
          this.setState({ projectId: this.props.initialValue?.projectId }, () => {
            this.setState({ units: [this.props.initialValue?.unit] })
          })

          form.setFieldsValue({
            units: this.props.initialValue?.units
          })
        } else {
          this.changeProject(this.props.sessionStore?.projectId)

          form.setFieldsValue({
            units: this.props.initialValue?.units
          })
        }
      }
    }
  }

  changeProject = (projectId) => {
    this.setState({ projectId }, () => {
      this.findUnits('')
      const form = this.formRef.current
      form.resetFields()
    })
  }

  findUnits = async (keyword) => {
    const { projectId } = this.state
    if (!projectId) {
      return
    }
    const results = await unitService.filterOptions({
      keyword,
      projectId,
      maxResultCount: 20,
      skipCount: 0
    })
    this.setState({ units: results || [] })
  }

  onSave = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      const { userId } = values
      this.setState({ loading: true })
      try {
        let prepareData
        await Promise.all(
          (values.units || []).map(async (item) => {
            prepareData = {
              unitId: item.unitId,
              residents: [
                {
                  ...item,
                  userId
                }
              ]
            }

            if (this.props.initialValue?.projectId) {
              await this.props.unitStore?.updateUnitUser({
                id: this.props.initialValue?.id,
                typeId: item.typeId,
                roleId: item.roleId,
                moveInDate: item.handOverDate
              })
              this.props.residentStore?.getResidentUnits({
                userId: this.props.initialValue?.residentId,
                isActive: true
              })
            } else {
              await this.props.residentStore?.moveIn(prepareData)
            }
          })
        )

        this.setState({ loading: false })
      } catch (error) {
        this.setState({ loading: false })
      }
      this.setState({ projectId: undefined })
      form.resetFields()
      this.props.onCreate()
    })
  }

  onCancel = () => {
    this.setState({ projectId: undefined })
    this.formRef.current.resetFields()
    this.props.onCancel()
  }

  render() {
    const { visible, residentStore, initialValue, projectOptions } = this.props
    const { units } = this.state
    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={this.onCancel}
        onOk={this.onSave}
        width={800}
        title={this.props.initialValue?.projectId ? L('EDIT_MOVE_IN') : L('UNIT_MOVE_IN')}
        confirmLoading={this.state.loading}>
        <Form
          ref={this.formRef}
          layout={'vertical'}
          initialValues={initialValue}
          validateMessages={validateMessages}
          size="middle">
          <Form.Item name={'userId'} style={{ height: 0 }}>
            <Input style={{ display: 'none' }} />
          </Form.Item>
          <Row gutter={[24, 24]}>
            {!this.props.initialValue?.projectId && (
              <Col sm={{ span: 24, offset: 0 }}>
                <label>{this.L('SELECT_PROJECT')}</label>
                <Select
                  showSearch
                  allowClear
                  defaultValue={this.props.sessionStore?.projectId}
                  disabled={true}
                  className="full-width"
                  filterOption={filterOptions}
                  onChange={this.changeProject}>
                  {this.renderOptions(projectOptions)}
                </Select>
              </Col>
            )}
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.List name="units">
                {(fields, { add, remove }) => {
                  return (
                    <Row gutter={[24, 24]}>
                      {fields.map((field, index) => (
                        <Col sm={{ span: 24, offset: 0 }} key={field.key}>
                          <Row
                            gutter={[16, 0]}
                            style={{
                              border: '1px dashed #d9d9d9',
                              marginLeft: 0,
                              marginRight: 0
                            }}
                            className="pt-3">
                            <Col sm={{ span: 12, offset: 0 }}>
                              <Form.Item
                                label={L('RESIDENT_UNIT')}
                                {...formVerticalLayout}
                                name={[field.name, 'unitId']}
                                rules={rules.name}>
                                <Select
                                  showSearch
                                  className="full-width"
                                  onSearch={this.findUnits}
                                  filterOption={false}
                                  placeholder={`${L('FULL_UNIT_CODE')}`}
                                  disabled={this.props.initialValue?.projectId}>
                                  {this.renderOptions(units)}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col sm={{ span: 12, offset: 0 }}>
                              <Form.Item
                                label={L('UNIT_RESIDENT_ROLE')}
                                {...formVerticalLayout}
                                name={[field.name, 'roleId']}
                                rules={rules.name}>
                                <Select className="full-width" disabled={!this.state.projectId}>
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
                                <Select className="full-width" disabled={!this.state.projectId}>
                                  {this.renderOptions(residentStore?.memberTypes || [])}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col sm={{ span: 12, offset: 0 }}>
                              <Form.Item
                                label={L('UNIT_RESIDENT_MOVE_IN_DATE')}
                                {...formVerticalLayout}
                                name={[field.name, 'handOverDate']}>
                                <DatePicker
                                  className="full-width"
                                  format={dateFormat}
                                  disabled={!this.state.projectId}
                                  placeholder={L('UNIT_RESIDENT_MOVE_IN_DATE')}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          <span
                            style={{
                              position: 'absolute',
                              right: '4px',
                              top: '3px'
                            }}>
                            <Button
                              style={{ display: 'none' }}
                              type="dashed"
                              shape="round"
                              size="small"
                              onClick={() => remove(index)}
                              disabled={!this.state.projectId}>
                              <MinusOutlined />
                            </Button>
                          </span>
                        </Col>
                      ))}
                      <Col sm={{ span: 12, offset: 0 }} style={{ display: 'none' }}>
                        <Button type="dashed" onClick={add} className="full-width" disabled={!this.state.projectId}>
                          <PlusOutlined /> {L('BTN_ADD_RESIDENT')}
                        </Button>
                      </Col>
                    </Row>
                  )
                }}
              </Form.List>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default ResidentMoveInFormModal
