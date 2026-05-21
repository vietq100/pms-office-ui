import { AppComponentListBase } from '@components/AppComponentBase'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import WrapPageScroll from '@components/WrapPageScroll'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import ParkingStore from '@stores/parking/parkingStore'
import { Button, Card, Col, Form, Input, Row, Select } from 'antd'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { validateMessages } from '@lib/validation'
import rules from './validation'
import Stores from '@stores/storeIdentifier'
import { debounce } from 'lodash'
import { filterOptions } from '@lib/helper'
import cardbuidingService from '@services/cardbuilding/cardbuidingService'
import SessionStore from '@stores/sessionStore'
import CardbuidingStore from '@stores/cardBuilding/cardbuidingStore'
import InfiniteScrollSelect from '@components/Select/InfiniteScrollSelect'

const { formVerticalLayout, tenantType, typeAccount, listVehicleParkingType, listCardType } = AppConsts

export interface IVehicleProps {
  parkingStore: ParkingStore
  sessionStore: SessionStore
  cardbuidingStore: CardbuidingStore
  navigate: any
  params: any
}

@inject(Stores.ParkingStore, Stores.SessionStore, Stores.CardbuidingStore)
@observer
class CardParkingDetailPage extends AppComponentListBase<IVehicleProps> {
  formRef: any = React.createRef()

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
      this.getAllCardActive(),
      this.getDetail(this.props.params?.id)
    ])
  }

  getDetail = async (id?) => {
    if (!id) {
      await this.formRef.parkingStore.init()
    } else {
      if (this.isStaff) {
        await this.props.parkingStore.getByAdmin(id)
      } else {
        await this.props.parkingStore.getByResident(id)
      }
    }

    this.setState({
      listCompany: [
        {
          id: this.props.parkingStore?.editParkingCard?.company?.id,
          label: this.props.parkingStore?.editParkingCard?.company?.companyName,
          value: this.props.parkingStore?.editParkingCard?.company?.id
        }
      ]
    })

    this.formRef.current.setFieldsValue({
      ...this.props.parkingStore.editParkingCard,
      cardId: this.props.parkingStore.editParkingCard?.id
    })
  }

  getAllCardActive = async () => {
    if (this.isStaff) {
      const res = await cardbuidingService.getAll({ skipCount: 0, maxResultCount: 200, isEmpty: false })
      const newListCard = res?.items

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
      console.log(valueCard)
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

  onSave = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      const body = {
        cardId: values?.cardId,
        cardTypes: values?.cardTypes,
        vehicleAttachment: values?.vehicleAttachment
      }
      await this.props.parkingStore.update(body)

      this.onCancel()
    })
  }

  onCancel = () => {
    this.props.navigate(portalLayouts.cardParkingManagement.path)
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {/* {isGrantedAny(appPermissions.parking.create, appPermissions.parking.update) && ( */}

          {this.isStaff && (
            <Button type="primary" onClick={this.onSave} loading={isLoading} shape="round">
              {L('BTN_SAVE')}
            </Button>
          )}
          {/* )} */}
        </Col>
      </Row>
    )
  }
  public render() {
    const { vehicleTypes, vehicleStatus, grantedStatus } = this.props.parkingStore
    return (
      <WrapPageScroll renderActions={() => this.renderActions(false)}>
        <Card bordered={false}>
          <Form
            ref={this.formRef}
            layout={'vertical'}
            onAbort={this.onCancel}
            onValuesChange={() => this.setState({ isDirty: true })}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[16, 0]}>
              {this.isStaff && (
                <Col span={6}>
                  <Form.Item
                    name="cardId"
                    label={L('REQUEST_CARD_CARD_ID')}
                    {...formVerticalLayout}
                    rules={rules.required}>
                    <InfiniteScrollSelect
                      fetchApi={(params) => cardbuidingService.getAll({ ...params, isEmpty: false })}
                      onChange={(idCard) => this.onSelectCard(idCard)}
                      value={this.formRef?.current?.getFieldValue('cardId')}
                      placeholder={L('REQUEST_CARD_CARD_ID')}
                      optionRenderer={(item) => ({
                        id: item?.id,
                        value: item?.id,
                        label: item?.serialNumber
                      })}
                    />
                  </Form.Item>
                </Col>
              )}

              <Col span={6}>
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
              <Col sm={{ span: 6, offset: 0 }}>
                <Form.Item label={L('VEHICLE_DEPARTMENT')} {...formVerticalLayout} name="departmentName">
                  <Input disabled maxLength={10} />
                </Form.Item>
              </Col>
              <Col sm={{ span: 6, offset: 0 }}>
                <Form.Item label={L('VEHICLE_NAME_REGISTER')} {...formVerticalLayout} name="tenantName">
                  <Input disabled maxLength={10} />
                </Form.Item>
              </Col>
              <Col sm={{ span: 6, offset: 0 }}>
                <Form.Item
                  label={L('VEHICLE_BKS')}
                  {...formVerticalLayout}
                  name={['vehicleAttachment', 'numberPlate']}
                  rules={rules.required}>
                  <Input maxLength={50} />
                </Form.Item>
              </Col>
              <Col sm={{ span: 6, offset: 0 }}>
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
                    className="full-width">
                    {this.renderOptions(vehicleTypes)}
                  </Select>
                </Form.Item>
              </Col>
              {/* <Col sm={{ span: 6, offset: 0 }}>
                <Form.Item label={L('VEHICLE_MODEL')} {...formVerticalLayout} name={['vehicleAttachment', 'model']}>
                  <Input maxLength={50} />
                </Form.Item>
              </Col>
              <Col sm={{ span: 6, offset: 0 }}>
                <Form.Item label={L('VEHICLE_COLOR')} {...formVerticalLayout} name={['vehicleAttachment', 'color']}>
                  <Input maxLength={10} />
                </Form.Item>
              </Col> */}
              <Col sm={{ span: 6, offset: 0 }}>
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
                    className="full-width">
                    {this.renderOptions(this.props.parkingStore.parkingLot.items)}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={{ span: 6, offset: 0 }}>
                <Form.Item
                  label={L('PARKING_CARD_TENANT_TYPE')}
                  {...formVerticalLayout}
                  name={['vehicleAttachment', 'tenantType']}
                  rules={rules.required}>
                  <Select placeholder={L('PARKING_CARD_TENANT_TYPE')} showSearch allowClear className="full-width">
                    {this.renderOptions(tenantType)}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
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
              <Col span={6}>
                <Form.Item
                  name={['vehicleAttachment', 'isGranted']}
                  label={L('PARKING_CARD_GRANTED_STATUS')}
                  {...formVerticalLayout}
                  rules={rules.required}>
                  <Select showArrow className="full-width" style={{ width: '100%' }} filterOption={false}>
                    {this.renderOptions(grantedStatus)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
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
              <Col span={6}>
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
                    filterOption={false}>
                    {this.renderOptions(listCardType)}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={{ span: 6, offset: 0 }}>
                <Form.Item
                  label={L('OLD_VEHICLE_BKS')}
                  {...formVerticalLayout}
                  name={['vehicleAttachment', 'oldNumberPlate']}>
                  <Input maxLength={50} />
                </Form.Item>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item label={L('DESCRIPTION')} {...formVerticalLayout} name={['vehicleAttachment', 'description']}>
                  <Input.TextArea maxLength={2000} rows={3} placeholder={L('PARKING_PLACEHOLDER')} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </WrapPageScroll>
    )
  }
}

export default withRouter(CardParkingDetailPage)
