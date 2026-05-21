import React from 'react'

import { Col, Form, Row, Card, Button, Modal, Input, DatePicker, Radio } from 'antd'
import { validateMessages } from '@lib/validation'
import AppConsts, { appPermissions, dateTimeFormat } from '../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppComponentBase from '../../../components/AppComponentBase'
import ProjectStore from '../../../stores/project/projectStore'
import { isGranted, isGrantedAny, L, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import Select from '@components/Select'
import { HomeOutlined } from '@ant-design/icons'
import FileStore from '@stores/common/fileStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import { debounce } from 'lodash'
import { UserOutlined, PhoneOutlined } from '@ant-design/icons/lib'
import DeliveryStore from '@stores/delivery/deliveryStore'
import { UnitUserModel } from '@models/User/IUserModel'
import rules from './validation'
import { RadioChangeEvent } from 'antd/lib/radio'
import deliveryService from '@services/delivery/deliveryService'
import { ReceiveModel } from '@models/delivery'
import FileUploadWrapV2 from '@components/FileUploadV2'
const { formVerticalLayout } = AppConsts
const confirm = Modal.confirm
const { Option } = Select
export interface IDeliveryFormProps {
  navigate: any
  params: any
  deliveryStore: DeliveryStore
  projectStore: ProjectStore
  fileStore: FileStore
}

@inject(Stores.DeliveryStore, Stores.ProjectStore, Stores.UnitStore, Stores.FileStore)
@observer
class DeliveryDetail extends AppComponentBase<IDeliveryFormProps> {
  formRef: any = React.createRef()

  state = {
    isDirty: false,
    files: [] as any,
    filesAfter: [] as any,
    statusId: 0,
    userOptions: [] as ReceiveModel[],
    userUnit: {} as any,
    idDocument: undefined
  }

  async componentDidMount() {
    const { deliveryStore } = this.props
    await Promise.all([
      this.findUnitResidents(''),
      deliveryStore.getListStatus({}),
      deliveryStore.getListTypes({}),
      this.getDetail(this.props.params?.id)
    ])
    await this.getUserInUnit()
    this.setState({ statusId: this.props.deliveryStore.editDelivery.statusId })
    this.initDefault()
  }
  initDefault = async () => {
    const { editDelivery } = this.props.deliveryStore
    if (editDelivery?.id) {
      this.props.projectStore.unitUserOptions = [UnitUserModel.assign(this.props.deliveryStore.editDelivery)]
    }
  }
  getDetail = async (id?) => {
    if (!id) {
      await this.props.deliveryStore.createDelivery()
    } else {
      await this.props.deliveryStore.get(this.props.params?.id)
      this.setState({
        idDocument: this.props.deliveryStore.editDelivery?.uniqueId,
        userUnit: -1
      })
    }
    if (this.props.deliveryStore.editDelivery.statusId === 3) {
      this.setState({ disabled: true })
      this.formRef.current.setFieldsValue({
        ...this.props.deliveryStore.editDelivery,
        residentName: this.props.deliveryStore.editDelivery.receiver.residentName,
        residentPhone: this.props.deliveryStore.editDelivery.receiver.residentPhone,
        residentEmail: this.props.deliveryStore.editDelivery.receiver.residentEmail,
        deliveredDate: this.props.deliveryStore.editDelivery.receiver.deliveredDate
      })
    } else {
      this.formRef.current.setFieldsValue({
        ...this.props.deliveryStore.editDelivery
      })
    }
  }

  keywordPlaceholder = ` ${this.L('ANNOUNCEMENT_PLACEHODER')}`
  handleSearch = (name, value) => {
    this.setState({ filter: { [name]: value }, skipCount: 0 }, async () => {
      await this.props.deliveryStore.get(this.props.params?.id)
    })
  }

  getUserInUnit = async () => {
    this.setState({ loading: true })
    const unitId = this.props.deliveryStore.editDelivery.unitId
    const userOptions = await deliveryService
      .getResidentInUnitDelivery({ maxResultCount: 50, skipCount: 0, unitId })
      .finally(() => {
        this.setState({ loading: false })
      })
    this.setState({ userOptions })
  }
  onChangeUserUnit = (e: RadioChangeEvent) => {
    const userUnit = e.target.value
    this.setState({ userUnit })
  }
  onRemoveFile = (file) => {
    const index = this.state.files.indexOf(file)
    const newFileList = [...this.state.files]
    newFileList.splice(index, 1)
    this.setState({ files: newFileList })
  }
  onRemoveFileAfter = (file) => {
    const index = this.state.files.indexOf(file)
    const newFileList = [...this.state.filesAfter]
    newFileList.splice(index, 1)
    this.setState({ filesAfter: newFileList })
  }
  beforeUploadFile = (file) => {
    this.setState({ files: [...this.state.files, file] })
    return false
  }
  beforeUploadFileAfter = (file) => {
    this.setState({ filesAfter: [...this.state.filesAfter, file] })
    return false
  }

  updateSearch = debounce((name, value) => {
    this.setState({ keyword: value })
  }, 100)

  changeStatus = async () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      this.setState({ statusId: values.statusId })
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
  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.deliveryStore.editDelivery?.id) {
        if (this.state.statusId === 3) {
          if (this.state.userUnit != -1) {
            if (values.residentUser?.residentPhone === null) {
              values.deliveryReceive.residentPhone === ''
            }

            await this.props.deliveryStore.update(
              {
                ...this.props.deliveryStore.editDelivery,
                ...values,
                deliveryReceive: values.residentUser
              },
              this.state.files,
              this.state.filesAfter
            )
          } else {
            await this.props.deliveryStore.update(
              {
                ...this.props.deliveryStore.editDelivery,
                ...values,
                deliveryReceive: {
                  residentName: values.residentName,
                  residentPhone: values.residentPhone,
                  residentEmail: values.residentEmail
                }
              },
              this.state.files,
              this.state.filesAfter
            )
          }
        } else {
          await this.props.deliveryStore.update(
            {
              ...this.props.deliveryStore.editDelivery,
              ...values
            },
            this.state.files,
            this.state.filesAfter
          )
        }
      } else {
        await this.props.deliveryStore.create(values, this.state.files)
      }

      this.props.navigate(portalLayouts.delivery.path)
    })
  }

  onCancel = () => {
    const { navigate } = this.props
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          navigate(portalLayouts.delivery.path)
        }
      })
      return
    }
    navigate(portalLayouts.delivery.path)
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>

          {isGrantedAny(appPermissions.delivery.create, appPermissions.delivery.update) &&
            this.props.deliveryStore.editDelivery.statusId != 3 && (
              <Button
                type="primary"
                onClick={this.onSave}
                disabled={this.props.params?.id && !isGranted(appPermissions.delivery.update)}
                loading={isLoading}
                shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
        </Col>
      </Row>
    )
  }

  public render() {
    const { isLoading, listStatus, listTypes } = this.props.deliveryStore
    const { unitUserOptions } = this.props.projectStore
    const { userOptions } = this.state
    return (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Card bordered={false} style={{ minHeight: 750 }} id="delivery-detail">
          <Form
            ref={this.formRef}
            layout={'vertical'}
            onFinish={this.onSave}
            onAbort={this.onCancel}
            onValuesChange={() => this.setState({ isDirty: true })}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[16, 0]}>
              <Col span={8}>
                <Form.Item name="unitUserId" label={L('RECEIVER')} rules={rules.unitUserId} {...formVerticalLayout}>
                  <Select
                    allowClear
                    showSearch
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
              <Col span={8}>
                <Form.Item name="fullUnitCode" label={L('UNIT_RECEIVER')} {...formVerticalLayout} rules={rules.unitId}>
                  <Input disabled={true} />
                </Form.Item>
                <Form.Item name="unitId" rules={rules.unitId} className="d-none">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col span={8}>
                <Form.Item name="deliveryTypeId" label={L('DELIVERY_TYPE')} {...formVerticalLayout} rules={rules.type}>
                  <Select allowClear showArrow className="full-width" style={{ width: '100%' }} filterOption={false}>
                    {this.renderOptions(listTypes)}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name={'receivedDate'} label={L('RECEIVER_DATE')} {...formVerticalLayout}>
                  <DatePicker
                    format={dateTimeFormat}
                    style={{ width: '100%' }}
                    placeholder={L('SELECT_DATE')}
                    showTime
                  />
                </Form.Item>
              </Col>
              {this.props.params?.id && (
                <Col span={8}>
                  <Form.Item name="statusId" label={L('STATUS')} {...formVerticalLayout}>
                    <Select
                      allowClear
                      showArrow
                      style={{ width: '100%' }}
                      onChange={this.changeStatus}
                      filterOption={false}>
                      {this.renderOptions(listStatus)}
                    </Select>
                  </Form.Item>
                </Col>
              )}
            </Row>
            {/* {this.props.params?.id && ( */}
            {this.state.statusId === 3 && (
              <Row gutter={[16, 0]}>
                <Col span={8}>
                  <Form.Item name={'deliveredDate'} label={L('DELIVERDE_DATE')} {...formVerticalLayout}>
                    <DatePicker
                      format={dateTimeFormat}
                      style={{ width: '100%' }}
                      placeholder={L('SELECT_DATE')}
                      showTime
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}
            {this.state.statusId === 3 && this.props.deliveryStore.editDelivery.statusId != 3 && (
              <Row gutter={[16, 0]}>
                <Col md={{ span: 8 }} sm={{ span: 0 }}>
                  <Form.Item name="residentUser" label={this.L('UNIT_USERS')}>
                    <Radio.Group onChange={this.onChangeUserUnit} defaultValue={-1}>
                      {userOptions?.map((userOption, index) => {
                        return (
                          <Col key={userOption.residentUserId}>
                            <Radio value={userOption} key={index}>
                              {L(userOption.residentName)} ({''}
                              {userOption.residentPhone || L('DONT_HAVE_PHONE_NUMBER')})
                            </Radio>
                          </Col>
                        )
                      })}
                      <Radio value={-1}>{L('OTHER_USER')}</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
            )}
            {this.state.statusId === 3 && this.state.userUnit === -1 && (
              <Row gutter={[48, 0]}>
                <Col span={8}>
                  <Form.Item name="residentName" label={L('ACTUAL_RECEIVER')} {...formVerticalLayout}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="residentEmail" label={L('STAFF_EMAIL')} {...formVerticalLayout}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="residentPhone" label={L('PHONE_NUMBER')} {...formVerticalLayout}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            )}
            <Col span={24}>
              <Form.Item name="description" label={L('DESCRIPTION')}>
                <Input.TextArea placeholder={L('DESCRIPTION')} rows={3} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="otherNote" label={L('OTHERNOTE')}>
                <Input.TextArea placeholder={L('OTHERNOTE')} rows={3} />
              </Form.Item>
            </Col>

            <Row gutter={[48, 0]}>
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item name="file" label={L('UPLOAD_IMAGE')}>
                  <FileUploadWrapV2
                    parentId={this.state.idDocument}
                    fileStore={this.props.fileStore}
                    onRemoveFile={this.onRemoveFile}
                    beforeUploadFile={this.beforeUploadFile}
                    specialModuleName="DELIVERY"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* {this.props.params?.id && ( */}
            {this.state.statusId === 3 && (
              <Row gutter={[48, 0]}>
                <Col sm={{ span: 24, offset: 0 }}>
                  <label>{L('DELIVERY_PICTURE_SIGNATURE_OF_RECEIVER')}</label>
                  <Form.Item name={'files'}>
                    <FileUploadWrapV2
                      parentId={this.state.idDocument}
                      fileStore={this.props.fileStore}
                      onRemoveFile={this.onRemoveFileAfter}
                      beforeUploadFile={this.beforeUploadFileAfter}
                      specialModuleName="DELIVERYSIGNATURE"
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}
          </Form>
        </Card>
      </WrapPageScroll>
    )
  }
}

export default withRouter(DeliveryDetail)
