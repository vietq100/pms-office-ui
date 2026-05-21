import React from 'react'

import { Col, Form, Row, Select, Card, Modal, Button, Input, DatePicker } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { isGrantedAny, L, LNotification } from '../../../../lib/abpUtility'
import { filterOptions } from '../../../../lib/helper'
import { validateMessages } from '../../../../lib/validation'
import rules from './validation'
import AppConsts, { appPermissions, dateTimeFormat } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import VisitorStore from '../../../../stores/communication/visitorStore'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import AppComponentBase from '../../../../components/AppComponentBase'
import ProjectStore from '../../../../stores/project/projectStore'
import { UserOutlined, PhoneOutlined } from '@ant-design/icons/lib'
import { portalLayouts } from '../../../../components/Layout/Router/router.config'
import { UnitUserModel } from '../../../../models/User/IUserModel'
import FileStore from '../../../../stores/common/fileStore'
import SessionStore from '../../../../stores/sessionStore'
import withRouter from '@components/Layout/Router/withRouter'
import dayjs from 'dayjs'

const { formVerticalLayout } = AppConsts
const { confirm } = Modal
const { Option } = Select
const tabKeys = {
  tabInfo: 'VISITOR_TAB_INFO',
  tabComment: 'VISITOR_TAB_COMMENTS',
  tabAuditLog: 'VISITOR_TAB_AUDIT_LOG'
}

export interface IVisitorFormProps {
  navigate: any
  params: any
  visitorStore: VisitorStore
  projectStore: ProjectStore
  fileStore: FileStore
  sessionStore: SessionStore
}

@inject(Stores.VisitorStore, Stores.ProjectStore, Stores.FileStore, Stores.SessionStore)
@observer
class VisitorDetail extends AppComponentBase<IVisitorFormProps> {
  state = {
    isDirty: false,
    tabActiveKey: tabKeys.tabInfo,
    files: [] as any,
    visitReasons: [] as any
  }
  formRef: any = React.createRef()

  async componentDidMount() {
    await Promise.all([this.findUnitResidents(''), this.getDetail(this.props.params?.id)])
    this.initDefault()
  }

  initDefault = async () => {
    const { editVisitor } = this.props.visitorStore
    if (editVisitor?.id) {
      this.props.projectStore.unitUserOptions = [
        UnitUserModel.init(
          this.props.visitorStore.editVisitor?.displayName,
          this.props.visitorStore.editVisitor?.userId,
          this.props.visitorStore.editVisitor?.unitId,
          this.props.visitorStore.editVisitor?.fullUnitCode
        )
      ]
    }

    await this.props.visitorStore.getVisitReasons()
  }

  getDetail = async (id?) => {
    if (!id) {
      await this.props.visitorStore.createVisitor()
    } else {
      await this.props.visitorStore.get(id)
    }
    this.formRef.current.setFieldsValue({
      ...this.props.visitorStore.editVisitor
    })
  }

  findUnitResidents = async (keyword) => {
    await this.props.projectStore.filterUnitUserOptions({ keyword })
  }

  updateUnitResident = async (value) => {
    const { unitUserOptions } = this.props.projectStore
    const form = this.formRef.current

    if (!unitUserOptions || !unitUserOptions.length) {
      return
    }
    const resident = unitUserOptions.find((item) => item.optionValue === value)
    form.setFieldsValue({
      unitId: resident?.unitId,
      userId: resident?.userId,
      fullUnitCode: resident?.fullUnitCode
    })
  }

  onRemoveFile = (file) => {
    const index = this.state.files.indexOf(file)
    const newFileList = [...this.state.files]
    newFileList.splice(index, 1)
    this.setState({ files: newFileList })
  }

  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.visitorStore.editVisitor?.id) {
        await this.props.visitorStore.update(
          {
            ...this.props.visitorStore.editVisitor,
            ...values
          },
          this.state.files
        )
      } else {
        await this.props.visitorStore.create(values, this.state.files)
      }

      this.props.navigate(portalLayouts.communicationVisitor.path)
    })
  }

  onCancel = () => {
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          this.props.navigate(portalLayouts.communicationVisitor.path)
        }
      })
      return
    }
    this.props.navigate(portalLayouts.communicationVisitor.path)
  }

  renderActions = (isLoading?) => {
    const { tabActiveKey } = this.state
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {tabActiveKey === tabKeys.tabInfo &&
            isGrantedAny(appPermissions.visitor.create, appPermissions.visitor.update) && (
              <Button
                type="primary"
                disabled={this.props.visitorStore.editVisitor?.id && !isGrantedAny(appPermissions.visitor.update)}
                onClick={this.onSave}
                loading={isLoading}
                shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
        </Col>
      </Row>
    )
  }

  render() {
    const {
      projectStore: { unitUserOptions },
      visitorStore: { isLoading, visitReasons, editVisitor }
    } = this.props
    const currentDate = dayjs().subtract(30, 'day')
    const registerTime = this.formRef.current?.getFieldValue('registerTime')
    const registerCheckoutTime = this.formRef.current?.getFieldValue('registerCheckoutTime')
    const checkInTime = this.formRef.current?.getFieldValue('checkInTime')
    const checkOutTime = this.formRef.current?.getFieldValue('checkOutTime')
    return (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Card bordered={false} style={{ minHeight: 750 }}>
          <Form
            ref={this.formRef}
            layout={'vertical'}
            onFinish={this.onSave}
            onAbort={this.onCancel}
            onValuesChange={() => this.setState({ isDirty: true })}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[16, 0]}>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('VISITOR_RESIDENT')}
                  {...formVerticalLayout}
                  name="unitUserId"
                  rules={rules.unitUserId}>
                  <Select
                    showSearch
                    allowClear
                    filterOption={false}
                    className="full-width"
                    onSearch={this.findUnitResidents}
                    onChange={this.updateUnitResident}
                    disabled={this.formRef.current?.getFieldValue('id')}>
                    {(unitUserOptions || []).map((option, index) => {
                      return (
                        <Option key={index} value={option.optionValue}>
                          {option.displayName}
                          <div className="text-muted small" style={{ display: 'flex' }}>
                            <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                              <HomeOutlined className="mr-1" />
                              {option.fullUnitCode}
                            </span>

                            <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                              {option.emailAddress && option.emailAddress.length && (
                                <>
                                  <UserOutlined className="mr-1" />
                                  {option.userName}
                                </>
                              )}
                            </span>
                            <span className={'text-truncate'} style={{ flex: 1 }}>
                              {option.phoneNumber && option.phoneNumber.length && (
                                <>
                                  <PhoneOutlined className="mr-1" />
                                  {option.phoneNumber}
                                </>
                              )}
                            </span>
                          </div>
                        </Option>
                      )
                    })}
                  </Select>
                </Form.Item>
                <Form.Item name="userId" rules={rules.userId} className="d-none">
                  <Input />
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item label={L('VISITOR_UNIT')} {...formVerticalLayout} name="fullUnitCode" rules={rules.unitId}>
                  <Input disabled={true} />
                </Form.Item>
                <Form.Item name="unitId" rules={rules.unitId} className="d-none">
                  <Input />
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('VISITOR_NAME')}
                  {...formVerticalLayout}
                  name="visitorName"
                  rules={rules.visitorName}>
                  <Input />
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('VISITOR_IDENTITY_NUMBER')}
                  {...formVerticalLayout}
                  name="identityCardNumber"
                  rules={rules.identityCardNumber}>
                  <Input />
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item label={L('VISITOR_MOBILE')} {...formVerticalLayout} name="phoneNumber">
                  <Input />
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('VISITOR_REASON')}
                  {...formVerticalLayout}
                  name="reasonForVisitId"
                  rules={rules.reasonForVisitId}>
                  <Select showSearch allowClear className="full-width" filterOption={filterOptions}>
                    {this.renderOptions(visitReasons)}
                  </Select>
                </Form.Item>
              </Col>
              <Col md={{ span: 8 }} sm={{ span: 8 }}>
                <Form.Item
                  name={'registerTime'}
                  label={this.L('VISITOR_REGISTER_CHECK_IN_DATE')}
                  rules={[{ required: true }]}>
                  <DatePicker
                    format={dateTimeFormat}
                    style={{ width: '100%' }}
                    disabledDate={(d) =>
                      (!editVisitor.id && d.isBefore(currentDate)) ||
                      (registerCheckoutTime && (!d || d.isAfter(registerCheckoutTime)))
                    }
                    placeholder={L('SELECT_DATE')}
                    showTime
                  />
                </Form.Item>
              </Col>
              <Col md={{ span: 8 }} sm={{ span: 8 }}>
                <Form.Item
                  name={'registerCheckoutTime'}
                  label={this.L('VISITOR_REGISTER_CHECK_OUT_DATE')}
                  rules={[{ required: true }]}>
                  <DatePicker
                    format={dateTimeFormat}
                    style={{ width: '100%' }}
                    disabledDate={(d) =>
                      (!editVisitor.id && d.isBefore(currentDate)) || (registerTime && (!d || d.isBefore(registerTime)))
                    }
                    placeholder={L('SELECT_DATE')}
                    showTime
                  />
                </Form.Item>
              </Col>
              <Col md={{ span: 8 }} sm={{ span: 8 }}>
                <Form.Item name={'checkInTime'} label={this.L('VISITOR_CHECK_IN_DATE')}>
                  <DatePicker
                    format={dateTimeFormat}
                    style={{ width: '100%' }}
                    disabledDate={(d) =>
                      (!editVisitor.id && d.isBefore(currentDate)) || (checkOutTime && (!d || d.isAfter(checkOutTime)))
                    }
                    placeholder={L('SELECT_DATE')}
                    showTime
                  />
                </Form.Item>
              </Col>
              <Col md={{ span: 8 }} sm={{ span: 8 }}>
                <Form.Item name={'checkOutTime'} label={this.L('VISITOR_CHECK_OUT_DATE')}>
                  <DatePicker
                    format={dateTimeFormat}
                    style={{ width: '100%' }}
                    disabledDate={(d) =>
                      (!editVisitor.id && d.isBefore(currentDate)) || (checkInTime && (!d || d.isBefore(checkInTime)))
                    }
                    placeholder={L('SELECT_DATE')}
                    showTime
                  />
                </Form.Item>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item label={L('VISITOR_DESCRIPTION')} {...formVerticalLayout} name="description">
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </WrapPageScroll>
    )
  }
}

export default withRouter(VisitorDetail)
