import { AppComponentListBase } from '@components/AppComponentBase'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import withRouter from '@components/Layout/Router/withRouter'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { filterOptions } from '@lib/helper'
import { validateMessages } from '@lib/validation'
import cardbuidingService from '@services/cardbuilding/cardbuidingService'
import CardbuidingStore from '@stores/cardBuilding/cardbuidingStore'
import RequestCardbuidingStore from '@stores/cardBuilding/requestCardBuildingStore'
import FileStore from '@stores/common/fileStore'
import ParkingStore from '@stores/parking/parkingStore'
import SessionStore from '@stores/sessionStore'
import Stores from '@stores/storeIdentifier'
import { Button, Col, Form, Input, Modal, Row, Select } from 'antd'
import { debounce } from 'lodash'
import { inject, observer } from 'mobx-react'
import React from 'react'
import rules from './validation'
import dayjs from 'dayjs'

export interface IProps {
  navigate: any
  params: any
  visible: boolean
  requestType: number
  formItem: any
  onRefresh: () => void
  onCancel: () => void
  parkingStore: ParkingStore
  requestCardbuidingStore: RequestCardbuidingStore
  cardbuidingStore: CardbuidingStore
  sessionStore: SessionStore
  fileStore: FileStore
}

const { formVerticalLayout, typeAccount, tenantType, listVehicleParkingType, cardRequestTypeEnum, listCardType } =
  AppConsts

@inject(
  Stores.RequestCardbuidingStore,
  Stores.CardbuidingStore,
  Stores.SessionStore,
  Stores.FileStore,
  Stores.ParkingStore
)
@observer
class UpdateVehiclesModal extends AppComponentListBase<IProps> {
  formRef = React.createRef<any>()

  state = {
    listCardActive: [] as any,
    isAllowOperator: false,
    listCompany: [] as any
  }

  isStaff =
    this.props.sessionStore.userAccountType === typeAccount.Develop ||
    this.props.sessionStore.userAccountType === typeAccount.Resident
      ? false
      : true

  async componentDidMount() {
    await Promise.all([
      this.findParkingLot(''),
      this.props.parkingStore.getType(),
      this.props.parkingStore.getStatus(),
      this.getAllCardActive()
    ])
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.visible &&
      !prevProps.visible &&
      this.props.requestCardbuidingStore.editRequestCardBuilding &&
      Object.keys(this.props.requestCardbuidingStore.editRequestCardBuilding).length > 0
    ) {
      this.getDetail()
    }
  }

  getDetail = async () => {
    const {
      editRequestCardBuilding,
      editRequestCardBuilding: {
        company,
        cardRequests: [firstCardRequest]
      }
    } = this.props.requestCardbuidingStore

    const {
      numberPlate,
      vehicleParkingType,
      vehicleTypeId,
      parkingId,
      tenantName,
      departmentName,
      cardTypes,
      tenantType: requestTenantType,
      card // keep card as a variable
    } = firstCardRequest || {}

    const { vehicleAttachment, stoppingDate } = card || {}
    const { id, status } = card || {}
    const { isGranted, vehicleStatusId, description } = vehicleAttachment || {}

    this.setState({
      listCompany: [
        {
          id: company?.id,
          label: company?.companyName,
          value: company?.id
        }
      ]
    })

    // THay đổi thông tin thẻ
    if (
      editRequestCardBuilding?.type === cardRequestTypeEnum.IsUpdate ||
      editRequestCardBuilding?.type === cardRequestTypeEnum.IsCancel
    ) {
      this.setState({ staffs: editRequestCardBuilding?.cardRequests })
      this.formRef?.current?.setFieldsValue({
        cardId: id,
        cardTypes: cardTypes || [],
        companyId: company?.id,
        departmentName: departmentName,
        tenantName: tenantName,
        stoppingDate: stoppingDate ? dayjs(stoppingDate) : this.props.formItem.current.getFieldValue('stoppingDate'),
        vehicleAttachment: {
          numberPlate: numberPlate,
          typeId: vehicleTypeId,
          parkingId: parkingId || null,
          tenantType: requestTenantType,
          vehicleParkingType: vehicleParkingType,
          isGranted: isGranted,
          description: description,
          vehicleStatusId: vehicleStatusId || status
        }
      })
    }
  }

  onClose = () => {
    this.formRef.current?.resetFields()
    this.props.onCancel()
  }

  onSave = async () => {
    const values = await this.formRef.current.validateFields()
    await this.props.parkingStore.update(values)
    this.props.onRefresh()
    this.props.onCancel()
  }

  getAllCardActive = async () => {
    if (this.isStaff) {
      const res = await cardbuidingService.getAll({ skipCount: 0, maxResultCount: 200, isEmpty: false })
      const newListCard = res?.items ?? []
      this.setState({ listCardActive: newListCard, isAllowOperator: true })
    } else {
      this.setState({ listCardActive: [], isAllowOperator: false })
    }
  }

  getListSearchCardActive = debounce(async (keyword: string) => {
    const result = await cardbuidingService.getAll({ keyword })
    this.setState({ listCardActive: result?.items })
  }, 300)

  findParkingLot = debounce(async (keyword) => {
    await this.props.parkingStore.getAllParking({ keyword })
  }, 300)

  onSelectCard = (idCard: number) => {
    const valueCard = this.state.listCardActive.find((item) => item?.id === idCard)

    if (this.props?.params?.id) {
      if (valueCard?.vehicleAttachment) {
        this.setState({
          listCompany: [
            {
              id: valueCard?.company?.id,
              label: valueCard?.company?.companyName,
              value: valueCard?.company?.id
            }
          ]
        })
        this.formRef.current.setFieldsValue({
          companyId: valueCard?.companyId,
          departmentName: valueCard?.departmentName,
          tenantName: valueCard?.tenantName,
          vehicleAttachment: valueCard?.vehicleAttachment
        })
      } else {
        this.formRef.current.setFieldValue('vehicleAttachment', null)
      }
    } else {
      this.setState({
        listCompany: [
          {
            id: valueCard?.company?.id,
            label: valueCard?.company?.companyName,
            value: valueCard?.company?.id
          }
        ]
      })
      this.formRef.current.setFieldsValue({
        companyId: valueCard?.companyId,
        departmentName: valueCard?.departmentName,
        tenantName: valueCard?.tenantName,
        vehicleAttachment: valueCard?.vehicleAttachment
      })
    }
  }

  render() {
    const { visible } = this.props
    const { vehicleTypes, vehicleStatus, grantedStatus } = this.props.parkingStore

    const isFormCancel = this.props.requestType === cardRequestTypeEnum.IsCancel

    return (
      <Modal
        maskClosable={false}
        title={L('BUILD_CARD_INFO')}
        open={visible}
        okText={L('BTN_SAVE')}
        onOk={this.onSave}
        cancelText={L('BTN_CANCEL')}
        onCancel={this.onClose}
        footer={[
          <>
            <Button onClick={this.onClose}>{L('BTN_CANCEL')}</Button>
            <Button type="primary" onClick={this.onSave}>
              {L('OK')}
            </Button>
          </>
        ]}>
        <Form layout="vertical" ref={this.formRef} validateMessages={validateMessages} size="middle">
          <Row gutter={16}>
            <Col sm={{ span: 24 }}>
              <Form.Item name="cardId" label={L('REQUEST_CARD_CARD_ID')} {...formVerticalLayout} rules={rules.required}>
                <Select
                  showArrow
                  showSearch
                  allowClear
                  disabled={isFormCancel}
                  onSearch={this.getListSearchCardActive}
                  onClear={this.getAllCardActive}
                  onSelect={(idCard) => this.onSelectCard(idCard)}
                  className="full-width"
                  filterOption={false}>
                  {this.renderOptions(
                    (this.state.listCardActive ?? []).map((item) => ({
                      id: item?.id,
                      value: item?.id,
                      label: item?.serialNumber
                    }))
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 24 }}>
              <Form.Item
                name="companyId"
                label={L('BUILD_CARD_COMPANY')}
                {...formVerticalLayout}
                rules={rules.required}>
                <Select disabled showArrow className="full-width" style={{ width: '100%' }} filterOption={false}>
                  {this.renderOptions(this.state.listCompany)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('VEHICLE_DEPARTMENT')} {...formVerticalLayout} name="departmentName">
                <Input disabled maxLength={10} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('VEHICLE_NAME_REGISTER')} {...formVerticalLayout} name="tenantName">
                <Input disabled maxLength={10} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('VEHICLE_BKS')}
                {...formVerticalLayout}
                name={['vehicleAttachment', 'numberPlate']}
                rules={rules.required}>
                <Input maxLength={50} disabled={isFormCancel} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('PARKING_TYPE_VEHICEL')}
                {...formVerticalLayout}
                name={['vehicleAttachment', 'typeId']}
                rules={rules.required}>
                <Select
                  filterOption={filterOptions}
                  placeholder={L('PARKING_SELECT_TYPE_VEHICEL')}
                  showSearch
                  allowClear
                  disabled={isFormCancel}
                  className="full-width">
                  {this.renderOptions(vehicleTypes)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('PARKING_LOT')}
                {...formVerticalLayout}
                name={['vehicleAttachment', 'parkingId']}
                rules={rules.required}>
                <Select
                  onSearch={this.findParkingLot}
                  placeholder={L('PARKING_LOT')}
                  showSearch
                  filterOption={false}
                  allowClear
                  disabled={isFormCancel}
                  className="full-width">
                  {this.renderOptions(this.props.parkingStore.parkingLot.items)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('PARKING_CARD_TENANT_TYPE')}
                {...formVerticalLayout}
                name={['vehicleAttachment', 'tenantType']}
                rules={rules.required}>
                <Select
                  placeholder={L('PARKING_CARD_TENANT_TYPE')}
                  showSearch
                  allowClear
                  className="full-width"
                  disabled={isFormCancel}>
                  {this.renderOptions(tenantType)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                name={['vehicleAttachment', 'vehicleParkingType']}
                label={L('BUILD_CARD_VEHICLE_FEE_CONFIGURATION')}
                {...formVerticalLayout}
                rules={rules.required}>
                <Select
                  showArrow
                  className="full-width"
                  style={{ width: '100%' }}
                  filterOption={false}
                  disabled={isFormCancel}>
                  {this.renderOptions(listVehicleParkingType)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                name={['vehicleAttachment', 'isGranted']}
                label={L('PARKING_CARD_GRANTED_STATUS')}
                {...formVerticalLayout}
                rules={rules.required}>
                <Select
                  showArrow
                  className="full-width"
                  style={{ width: '100%' }}
                  filterOption={false}
                  disabled={isFormCancel}>
                  {this.renderOptions(grantedStatus)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                name={['vehicleAttachment', 'vehicleStatusId']}
                label={L('PARKING_CARD_STATUS')}
                {...formVerticalLayout}
                rules={rules.required}>
                <Select showArrow className="full-width" style={{ width: '100%' }} filterOption={false}>
                  {this.renderOptions(vehicleStatus)}
                </Select>
              </Form.Item>
            </Col>
            {!isFormCancel && (
              <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item
                  name={'cardTypes'}
                  label={L('BUILD_CARD_CARD_TYPE')}
                  {...formVerticalLayout}
                  rules={rules.required}>
                  <Select
                    showArrow
                    mode="multiple"
                    className="full-width"
                    style={{ width: '100%' }}
                    filterOption={false}
                    disabled={isFormCancel}>
                    {this.renderOptions(listCardType)}
                  </Select>
                </Form.Item>
              </Col>
            )}
            {isFormCancel && (
              <Col sm={{ span: 24, offset: 0 }}>
                <FormDatePicker label={L('REQUEST_CARD_DATE_STOP_CARD')} name="stoppingDate" rule={rules.required} />
              </Col>
            )}
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('DESCRIPTION')} {...formVerticalLayout} name={['vehicleAttachment', 'description']}>
                <Input.TextArea maxLength={2000} rows={3} placeholder={L('PARKING_PLACEHOLDER')} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default withRouter(UpdateVehiclesModal)
