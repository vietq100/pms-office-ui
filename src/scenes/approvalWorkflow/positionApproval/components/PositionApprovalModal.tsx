import { Form, Modal, Col, Row, Button, Select } from 'antd'
import { isGrantedAny, L } from '../../../../lib/abpUtility'
import AppConsts, { appPermissions } from '../../../../lib/appconst'
import AppComponentBase from '../../../../components/AppComponentBase'
import { validateMessages } from '../../../../lib/validation'
import React from 'react'
import FormRadioButton from '@components/FormItem/FormRadioButton'
import PositionApprovalStore from '@stores/approvalWorkflow/positionApproval/positionApprovalStore'
import companyService from '@services/project/companyService'
import FormInput from '@components/FormItem/FormInput'
import { filterOptions } from '@lib/helper'
import staffService from '@services/member/staff/staffService'
import developService from '@services/member/develop/developService'

const { listPositionType, formVerticalLayout, listStatusActive, positionTypeEnum } = AppConsts

export interface IBuildingFormProps {
  positionApprovalStore: PositionApprovalStore
  idDetail: any
  visible: boolean
  onCancel: () => void
}

class PositionApprovalModal extends AppComponentBase<IBuildingFormProps, any> {
  formRef: any = React.createRef()

  state = {
    listCompany: [] as any,
    listUser: [] as any,
    isNotTenant: false
  }

  componentDidUpdate = async (prevProps: Readonly<IBuildingFormProps>) => {
    if (!prevProps.visible && this.props.visible) {
      if (this.props.visible) {
        this.getListCompany('')
        this.setState({ listUser: [] })
        if (this.props.idDetail) {
          await this.props.positionApprovalStore.get(this.props.idDetail)

          this.initTypePosition(this.props.positionApprovalStore.editPositionApproval.typeId)

          this.formRef.current?.setFieldsValue(this.props.positionApprovalStore.editPositionApproval)
        } else {
          this.props.positionApprovalStore.initPositionApproval()
          this.formRef.current?.setFieldsValue()
        }
      }
    }
  }

  initTypePosition = (type: number) => {
    if (type === positionTypeEnum.Tenant) {
      this.setState({ isNotTenant: false })
      this.props.positionApprovalStore.editPositionApproval?.companyId &&
        this.getListUserCompany(this.props.positionApprovalStore.editPositionApproval?.companyId)
    } else {
      this.setState({ isNotTenant: true })
      this.getListUserOperatorOrDevelop(type)
    }
  }

  getListCompany = async (keyword: string) => {
    const filter = {
      skipCount: 0,
      maxResultCount: 50,
      isActive: true,
      keyword
    }
    const result = await companyService.getAll(filter)
    this.setState({ listCompany: result?.items })
  }

  getListUserCompany = async (companyId) => {
    if (companyId) {
      const result = await companyService.getUsers({ id: companyId, isActive: true })
      this.setState({ listUser: result })
    }
  }

  getListUserOperatorOrDevelop = async (type: number, keyword?: string) => {
    let result
    switch (type) {
      case positionTypeEnum.Developer:
        result = await developService.getAll({ isActive: true, maxResultCount: 20, skipCount: 0, keyword })
        this.setState({ listUser: result.items })
        break

      case positionTypeEnum.Operator:
        result = await staffService.filterOptions({ maxResultCount: 30, skipCount: 0, isActive: true, keyword })
        this.setState({ listUser: result })
        break

      default:
        this.setState({ listUser: [] })
    }
  }

  checkTypePosition = (type: number) => {
    if (type === positionTypeEnum.Tenant) {
      this.setState({ isNotTenant: false })
    } else {
      this.formRef.current.setFieldValue('companyId', null)
      this.setState({ isNotTenant: true })
      this.getListUserOperatorOrDevelop(type)
    }
  }

  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.positionApprovalStore.editPositionApproval?.id) {
        await this.props.positionApprovalStore.update({
          ...this.props.positionApprovalStore.editPositionApproval,
          ...values
        })
      } else {
        await this.props.positionApprovalStore.create({ ...values, isActive: true })
      }

      this.setState({ modalVisible: false })
      this.props.onCancel()
      form.resetFields()
    })
  }
  render() {
    const { visible, onCancel, idDetail } = this.props

    return (
      this.props.visible && (
        <Modal
          width={'70%'}
          open={visible}
          onCancel={onCancel}
          destroyOnClose
          title={L('POSITION_TILE')}
          footer={[
            <>
              <Button onClick={onCancel}>{L('BTN_CANCEL')}</Button>
              {isGrantedAny(appPermissions.building.create, appPermissions.building.update) && (
                <Button
                  key="submit"
                  disabled={idDetail && !isGrantedAny(appPermissions.building.update)}
                  type="primary"
                  loading={this.props.positionApprovalStore.isLoading}
                  onClick={this.onSave}>
                  {L('BTN_SAVE')}
                </Button>
              )}
            </>
          ]}
          okButtonProps={{
            className: !isGrantedAny(appPermissions.building.create, appPermissions.building.update) ? 'd-none' : ''
          }}>
          <Form ref={this.formRef} layout="vertical" validateMessages={validateMessages} size="middle">
            <Row gutter={[16, 0]}>
              <Col sm={{ span: 24, offset: 0 }}>
                <FormRadioButton
                  name="typeId"
                  label={L('POSITION_TYPE')}
                  rule={[{ required: true }]}
                  options={listPositionType}
                  onChange={(e) => this.checkTypePosition(e.target.value)}
                  disabled={this.props.idDetail}
                />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormInput
                  label={L('POSITION_POSITION')}
                  name="name"
                  rule={[{ required: true }, { min: 5 }, { max: 256 }]}
                />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('POSITION_COMPANY')}
                  {...formVerticalLayout}
                  name="companyId"
                  rules={[{ required: !this.state.isNotTenant }]}>
                  <Select
                    disabled={this.state.isNotTenant}
                    allowClear
                    showSearch
                    filterOption={false}
                    onChange={this.getListUserCompany}
                    onSearch={this.getListCompany}
                    style={{ width: '100%' }}>
                    {this.state.listCompany.map((item: any) => (
                      <Select.Option key={item?.id} value={item?.id}>
                        {item?.companyName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {this.props.idDetail && (
                <Col sm={{ span: 8, offset: 0 }}>
                  <Form.Item
                    label={L('POSITION_STATUS')}
                    {...formVerticalLayout}
                    name="isActive"
                    rules={[{ required: true }]}>
                    <Select style={{ width: '100%' }}>
                      {listStatusActive.map((item: any) => (
                        <Select.Option key={item?.id} value={item?.value}>
                          {item?.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item
                  label={L('POSITION_NAME_STAFF')}
                  {...formVerticalLayout}
                  name="userIds"
                  rules={[{ required: true }]}>
                  <Select mode="multiple" filterOption={filterOptions} style={{ width: '100%' }}>
                    {this.state.listUser.map((item: any) => (
                      <Select.Option key={item?.id} value={item?.id}>
                        {item?.displayName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      )
    )
  }
}

export default PositionApprovalModal
