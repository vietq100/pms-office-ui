import AppComponentBase from '@components/AppComponentBase'
import withRouter from '@components/Layout/Router/withRouter'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import CardbuidingStore from '@stores/cardBuilding/cardbuidingStore'
import Stores from '@stores/storeIdentifier'
import { Button, Col, Form, Input, Modal, Row, Select } from 'antd'
import { inject, observer } from 'mobx-react'
import React from 'react'
import rules from './validation'
import { capitalizeWords } from '@lib/helper'
import RequestCardbuidingStore from '@stores/cardBuilding/requestCardBuildingStore'

interface IProps {
  visible: boolean
  formItem: any
  onRefresh: () => void
  onCancel: () => void
  cardbuidingStore: CardbuidingStore
  requestCardbuidingStore: RequestCardbuidingStore
}

const { formVerticalLayout, listCardsStatus, listTenantTypeUseVehicle, listVehicleParkingType, listCardType } =
  AppConsts

@inject(Stores.CardbuidingStore, Stores.RequestCardbuidingStore)
@observer
class CreateCardBuildingModal extends AppComponentBase<IProps> {
  formRef: any = React.createRef()

  async componentDidMount() {
    await Promise.all([this.getListMasterData()])
  }

  componentDidUpdate(prevProps: Readonly<IProps>): void {
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
      requestCardbuidingStore: {
        editRequestCardBuilding: { company }
      },
      formItem: {
        cardTypes,
        tenantName,
        departmentName,
        creatorDescription,
        vehicleTypeId,
        numberPlate,
        tenantType,
        parkingId,
        vehicleParkingType
      }
    } = this.props

    this.formRef?.current?.setFieldsValue({
      cardTypes: cardTypes || [],
      serialNumber: tenantName,
      status: 1,
      companyId: company?.id,
      departmentName: departmentName,
      description: creatorDescription,
      vehicleAttachment: {
        typeId: vehicleTypeId,
        numberPlate: numberPlate,
        parkingId: parkingId,
        tenantType: tenantType,
        vehicleParkingType: vehicleParkingType
      }
    })
  }

  getListMasterData = async () => {
    await this.props.cardbuidingStore.getListCompany()
    await this.props.cardbuidingStore.getListParking()
  }

  onSave = () => {
    this.formRef.current.validateFields().then(async (values: any) => {
      try {
        await this.props.cardbuidingStore.create({
          cardRequestId: this.props.formItem.id,
          ...values,
          tenantName: values?.serialNumber
        })
        this.onClose()
      } catch (error) {
        console.log(error)
      }
    })
  }

  onClose = () => {
    this.formRef?.current?.resetFields()
    this.props.onCancel()
    this.props.onRefresh()
  }

  render() {
    const { visible } = this.props
    const { listCompany, listVehicleType, listParking } = this.props.cardbuidingStore

    return (
      <Modal
        maskClosable={false}
        open={visible}
        okText={L('BTN_SAVE')}
        cancelText={L('BTN_CANCEL')}
        onOk={this.onSave}
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
          <Row gutter={[16, 0]}>
            <Col span={24}>
              <label className="labelTitle">{L('BUILD_CARD_INFO')}</label>
            </Col>
            <Col sm={{ span: 12 }}>
              <Form.Item
                name="serialNumber"
                label={L('BUILD_CARD_CODE')}
                {...formVerticalLayout}
                rules={rules.required}>
                <Input
                  onBlur={(e) => {
                    const capitalized = capitalizeWords(e.target.value)
                    this.formRef.current.setFieldsValue({ serialNumber: capitalized })
                  }}
                />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12 }}>
              <Form.Item
                name="status"
                label={L('BUILD_CARD_CARD_STATUS')}
                {...formVerticalLayout}
                rules={rules.required}>
                <Select disabled showArrow className="full-width" style={{ width: '100%' }} filterOption={false}>
                  {this.renderOptions(listCardsStatus)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12 }}>
              {' '}
              <Form.Item
                name="companyId"
                label={L('BUILD_CARD_COMPANY')}
                {...formVerticalLayout}
                rules={rules.required}>
                <Select showArrow className="full-width" style={{ width: '100%' }} filterOption={false}>
                  {this.renderOptions(listCompany)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12 }}>
              <Form.Item name="departmentName" label={L('BUILD_CARD_DEPARTMENT_NAME')} {...formVerticalLayout}>
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24 }}>
              <Form.Item name="description" label={L('BUILD_CARD_DESCRIPTION')} {...formVerticalLayout}>
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <label className="labelTitle">{L('VEHICLE_CARD_INFO')}</label>
            </Col>

            <Col sm={{ span: 12 }}>
              <Form.Item
                name={['vehicleAttachment', 'typeId']}
                label={L('BUILD_CARD_VEHICLE_TYPE')}
                {...formVerticalLayout}
                rules={rules.required}>
                <Select showArrow className="full-width" style={{ width: '100%' }} filterOption={false}>
                  {this.renderOptions(listVehicleType)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12 }}>
              <Form.Item
                name={['vehicleAttachment', 'numberPlate']}
                label={L('BUILD_CARD_VEHICLE_NUMBER_PLATE')}
                {...formVerticalLayout}
                rules={rules.required}>
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12 }}>
              <Form.Item
                name={['vehicleAttachment', 'parkingId']}
                label={L('BUILD_CARD_VEHICLE_PARKING')}
                {...formVerticalLayout}
                rules={rules.required}>
                <Select showArrow className="full-width" style={{ width: '100%' }} filterOption={false}>
                  {this.renderOptions(
                    (listParking ?? []).map((item) => ({
                      id: item?.id,
                      value: item?.id,
                      label: item?.name,
                      name: item?.name
                    }))
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12 }}>
              <Form.Item
                name={['vehicleAttachment', 'tenantType']}
                label={L('BUILD_CARD_VEHICLE_TENANT_TYPE')}
                {...formVerticalLayout}
                rules={rules.required}>
                <Select showArrow className="full-width" style={{ width: '100%' }} filterOption={false}>
                  {this.renderOptions(listTenantTypeUseVehicle)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12 }}>
              <Form.Item
                name={['vehicleAttachment', 'vehicleParkingType']}
                label={L('BUILD_CARD_VEHICLE_FEE_CONFIGURATION')}
                {...formVerticalLayout}
                rules={rules.required}>
                <Select showArrow className="full-width" style={{ width: '100%' }} filterOption={false}>
                  {this.renderOptions(listVehicleParkingType)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12 }}>
              <Form.Item
                name={'cardTypes'}
                label={L('BUILD_CARD_CARD_TYPE')}
                {...formVerticalLayout}
                rules={rules.required}>
                <Select showArrow mode="multiple" className="full-width" style={{ width: '100%' }} filterOption={false}>
                  {this.renderOptions(listCardType)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default withRouter(CreateCardBuildingModal)
