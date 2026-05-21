import React from 'react'

import { Col, Form, Row, Card, Button, Input, Switch } from 'antd'
import { validateMessages } from '@lib/validation'
import AppConsts, { appPermissions } from '@lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppComponentBase from '@components/AppComponentBase'
import { isGranted, isGrantedAny, L } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import Select from '@components/Select'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import rules from './validation'
import CardbuidingStore from '@stores/cardBuilding/cardbuidingStore'
import { capitalizeWords } from '@lib/helper'

const { formVerticalLayout, listCardsStatus, listTenantTypeUseVehicle, listVehicleParkingType, listCardType } =
  AppConsts

export interface IProps {
  navigate: any
  params: any
  cardbuidingStore: CardbuidingStore
}

@inject(Stores.CardbuidingStore)
@observer
class BuildingCardDetailPage extends AppComponentBase<IProps> {
  formRef: any = React.createRef()

  state = {
    cardIsActive: false,
    isUseVehicle: false
  }

  async componentDidMount() {
    await Promise.all([this.getDetail(this.props.params?.id), this.getListCompany(), this.getListMasterData()])
  }

  getDetail = async (id?) => {
    if (!id) {
      await this.formRef.current?.resetFields()
      await this.props.cardbuidingStore.initCard()
    } else {
      await this.props.cardbuidingStore.get(this.props.params?.id)
      if (this.props.cardbuidingStore.editCardBuilding?.status === 1) {
        //0: trống, 1: hoạt động
        this.setState({ cardIsActive: true })
      }
      if (this.props.cardbuidingStore.editCardBuilding?.vehicleAttachment?.numberPlate) {
        this.setState({ isUseVehicle: true })
      }
      this.formRef.current?.setFieldsValue({
        ...this.props.cardbuidingStore.editCardBuilding,
        isUseVehicle: this.state.isUseVehicle,
        cardTypes: this.props.cardbuidingStore.editCardBuilding?.cardTypes || []
      })
    }
  }

  getListCompany = async () => {
    await this.props.cardbuidingStore.getListCompany()
  }

  getListMasterData = async () => {
    await this.props.cardbuidingStore.getListVehicleType()
    await this.props.cardbuidingStore.getListParking()
    // await this.props.cardbuidingStore.getListFeeParking()
  }

  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      try {
        if (this.props.cardbuidingStore.editCardBuilding?.id) {
          await this.props.cardbuidingStore.update({
            ...this.props.cardbuidingStore.editCardBuilding,
            ...values,
            tenantName: values?.serialNumber
          })
        } else {
          await this.props.cardbuidingStore.create({ ...values, tenantName: values?.serialNumber })
        }
        this.props.navigate(portalLayouts.buildingCardManagement.path)
      } catch (e) {
        console.log(e)
      }
    })
  }

  onChangeStatusCard = (value: string | number) => {
    if (value === 1) {
      this.setState({ cardIsActive: true })
    } else {
      this.setState({ cardIsActive: false })
    }
  }

  onChangeStatusUseVehicle = (status: boolean) => {
    if (status) {
      this.setState({ isUseVehicle: true })
    } else {
      this.setState({ isUseVehicle: false })
    }
  }

  onCancel = () => {
    const { navigate } = this.props

    navigate(portalLayouts.buildingCardManagement.path)
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>

          {isGrantedAny(appPermissions.cardBuilding.create, appPermissions.cardBuilding.update) && (
            <Button
              type="primary"
              onClick={this.onSave}
              disabled={this.props.params?.id && !isGranted(appPermissions.cardBuilding.update)}
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
    const { cardIsActive } = this.state
    const { isLoading, listCompany, listVehicleType, listParking } = this.props.cardbuidingStore
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
              <Col span={24}>
                <label className="labelTitle">{L('BUILD_CARD_INFO')}</label>
              </Col>
              <Col span={12}>
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

              <Col span={12}>
                <Form.Item
                  name="status"
                  label={L('BUILD_CARD_CARD_STATUS')}
                  {...formVerticalLayout}
                  rules={rules.required}>
                  <Select
                    onChange={(value) => this.onChangeStatusCard(value)}
                    showArrow
                    className="full-width"
                    style={{ width: '100%' }}
                    filterOption={false}>
                    {this.renderOptions(listCardsStatus)}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            {cardIsActive && (
              <Row gutter={[16, 0]}>
                <Col span={12}>
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

                {/* <Col span={8}>
                  <Form.Item
                    name="tenantName"
                    label={L('BUILD_CARD_TENANT_NAME')}
                    {...formVerticalLayout}
                    rules={rules.required}>
                    <Input />
                  </Form.Item>
                </Col> */}

                <Col span={12}>
                  <Form.Item
                    name="departmentName"
                    label={L('BUILD_CARD_DEPARTMENT_NAME')}
                    {...formVerticalLayout}
                    rules={rules.required}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name="description" label={L('BUILD_CARD_DESCRIPTION')} {...formVerticalLayout}>
                    <Input.TextArea rows={5} />
                  </Form.Item>
                </Col>

                {(!this.props.params?.id ||
                  (this.props.params?.id && !this.props.cardbuidingStore.editCardBuilding?.vehicleAttachment)) && (
                  <Col span={24}>
                    <Form.Item
                      label={L('BUILD_CARD_VEHICLE')}
                      {...formVerticalLayout}
                      name="isUseVehicle"
                      valuePropName="checked">
                      <Switch onChange={(value) => this.onChangeStatusUseVehicle(value)} />
                    </Form.Item>
                  </Col>
                )}

                {this.state.isUseVehicle && (
                  <>
                    <Col span={24}>
                      <label className="labelTitle">{L('VEHICLE_CARD_INFO')}</label>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name={['vehicleAttachment', 'typeId']}
                        label={L('BUILD_CARD_VEHICLE_TYPE')}
                        {...formVerticalLayout}
                        rules={rules.required}>
                        <Select
                          disabled={
                            this.props.params?.id && this.props.cardbuidingStore.editCardBuilding?.vehicleAttachment
                          }
                          showArrow
                          className="full-width"
                          style={{ width: '100%' }}
                          filterOption={false}>
                          {this.renderOptions(listVehicleType)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name={['vehicleAttachment', 'numberPlate']}
                        label={L('BUILD_CARD_VEHICLE_NUMBER_PLATE')}
                        {...formVerticalLayout}
                        rules={rules.required}>
                        <Input
                          disabled={
                            this.props.params?.id && this.props.cardbuidingStore.editCardBuilding?.vehicleAttachment
                          }
                        />
                      </Form.Item>
                    </Col>
                    {/* <Col span={6}>
                      <Form.Item
                        name={['vehicleAttachment', 'model']}
                        label={L('BUILD_CARD_VEHICLE_MODEL')}
                        {...formVerticalLayout}>
                        <Input
                          disabled={
                            this.props.params?.id && this.props.cardbuidingStore.editCardBuilding?.vehicleAttachment
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name={['vehicleAttachment', 'color']}
                        label={L('BUILD_CARD_VEHICLE_COLOR')}
                        {...formVerticalLayout}>
                        <Input
                          disabled={
                            this.props.params?.id && this.props.cardbuidingStore.editCardBuilding?.vehicleAttachment
                          }
                        />
                      </Form.Item>
                    </Col> */}
                    <Col span={6}>
                      <Form.Item
                        name={['vehicleAttachment', 'parkingId']}
                        label={L('BUILD_CARD_VEHICLE_PARKING')}
                        {...formVerticalLayout}
                        rules={rules.required}>
                        <Select
                          disabled={
                            this.props.params?.id && this.props.cardbuidingStore.editCardBuilding?.vehicleAttachment
                          }
                          showArrow
                          className="full-width"
                          style={{ width: '100%' }}
                          filterOption={false}>
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
                    <Col span={6}>
                      <Form.Item
                        name={['vehicleAttachment', 'tenantType']}
                        label={L('BUILD_CARD_VEHICLE_TENANT_TYPE')}
                        {...formVerticalLayout}
                        rules={rules.required}>
                        <Select
                          disabled={
                            this.props.params?.id && this.props.cardbuidingStore.editCardBuilding?.vehicleAttachment
                          }
                          showArrow
                          className="full-width"
                          style={{ width: '100%' }}
                          filterOption={false}>
                          {this.renderOptions(listTenantTypeUseVehicle)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name={['vehicleAttachment', 'vehicleParkingType']}
                        label={L('BUILD_CARD_VEHICLE_FEE_CONFIGURATION')}
                        {...formVerticalLayout}
                        rules={rules.required}>
                        <Select
                          disabled={
                            this.props.params?.id && this.props.cardbuidingStore.editCardBuilding?.vehicleAttachment
                          }
                          showArrow
                          className="full-width"
                          style={{ width: '100%' }}
                          filterOption={false}>
                          {this.renderOptions(listVehicleParkingType)}
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
                          filterOption={false}
                          disabled={
                            this.props.params?.id && this.props.cardbuidingStore.editCardBuilding?.vehicleAttachment
                          }>
                          {this.renderOptions(listCardType)}
                        </Select>
                      </Form.Item>
                    </Col>
                  </>
                )}
              </Row>
            )}
          </Form>
        </Card>
      </WrapPageScroll>
    )
  }
}

export default withRouter(BuildingCardDetailPage)
