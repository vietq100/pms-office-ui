import { QuestionCircleOutlined } from '@ant-design/icons'
import FormInput from '@components/FormItem/FormInput'
import AppConsts from '@lib/appconst'
import cardbuidingService from '@services/cardbuilding/cardbuidingService'
import { Button, Col, Form, Input, Row, Select, Tooltip } from 'antd'
import { debounce } from 'lodash'
import AppComponentBase from '../../../../components/AppComponentBase'
import { L } from '../../../../lib/abpUtility'
import rules from './validation'
import UpdateVehiclesModal from './UpdateVehiclesModal'

const { formVerticalLayout, cardRequestStatusEnum } = AppConsts

export interface IProps {
  isStaff: boolean
  formItem: any
  itemDetail: any
  requestType: number
  listVehicleType: any[]
  listParking: any[]
  listTenantTypeUseVehicle: any[]
  listVehicleParkingType: any[]
  onRefresh: () => void
}

class ComponentRequestChangeInfo extends AppComponentBase<IProps> {
  state = {
    listCardByCompany: [] as any,
    listCompany: [] as any,
    showPopup: false
  }

  componentDidMount() {
    this.getAllCardByCompany('')
  }

  getAllCardByCompany = debounce(async (keyword) => {
    if (!this.props.itemDetail?.id) {
      if (!this.props.isStaff) {
        const res = await cardbuidingService.getAllCardsByCompany({ keyword, maxResultCount: 400, skipCount: 0 })
        this.setState({ listCardByCompany: res?.items })
      } else {
        this.setState({ listCardByCompany: [this.props.itemDetail?.card] })
      }
    } else {
      const res = await cardbuidingService.getAllCardsByCompany({ keyword, maxResultCount: 400, skipCount: 0 })
      this.setState({ listCardByCompany: res?.items })
      this.setState({ listCompany: [this.props.itemDetail?.company] })
    }
  }, 300)

  onSelectCard = (value) => {
    const cardSelect = this.state.listCardByCompany.find((item) => item?.tenantName === value)

    if (cardSelect) {
      this.setState({ listCompany: [cardSelect?.company] })
      this.props.formItem?.current?.setFieldsValue({
        cardId: cardSelect?.id,
        companyId: cardSelect?.companyId,
        tenantName: cardSelect?.tenantName,
        departmentName: cardSelect?.departmentName,
        numberPlate: cardSelect?.vehicleAttachment?.numberPlate,
        tenantType: cardSelect?.vehicleAttachment?.tenantType,
        vehicleTypeId: cardSelect?.vehicleAttachment?.typeId,
        vehicleParkingType: cardSelect?.vehicleAttachment?.vehicleParkingType,
        parkingId: cardSelect?.vehicleAttachment?.parkingId
      })
    } else {
      this.props.formItem?.current?.setFieldsValue({
        cardId: undefined,
        tenantName: value
      })
    }
  }

  render() {
    const isInvalidToUpdateVehicle =
      this.props.formItem?.current?.getFieldValue('status') === cardRequestStatusEnum.IsCancelled ||
      this.props.formItem?.current?.getFieldValue('status') === cardRequestStatusEnum.IsDone

    return (
      <Row gutter={[16, 0]}>
        <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="labelTitle">{L('REQUEST_CARD_TENANT_NAME')}</label>
          {this.props.isStaff && (
            <Button
              size="small"
              type="primary"
              onClick={() => this.setState({ showPopup: !this.state.showPopup })}
              disabled={isInvalidToUpdateVehicle}>
              {L('BTN_UPDATE_CARD_REQUEST_CHANGE_INFO')}
            </Button>
          )}
        </Col>
        <Col span={6}>
          <Form.Item
            name="tenantName"
            label={L('REQUEST_CARD_TENANT_NAME')}
            {...formVerticalLayout}
            rules={rules.required}>
            {/* <AutoComplete
              style={{ width: '100%' }}
              onSearch={this.getAllCardByCompany}
              onChange={this.onSelectCard}
              placeholder={L('REQUEST_CARD_TENANT_NAME')}
              options={listCardByCompany.map((item) => ({
                key: item?.id,
                value: item?.tenantName,
                label: (
                  <>
                    {item?.tenantName}
                    <br />
                    <span className="fs-6 text-muted">{item?.departmentName}</span>
                  </>
                )
              }))}
              filterOption={false}
              onBlur={(e) => {
                const capitalized = capitalizeWords((e.target as HTMLInputElement).value)
                this.props.formItem.current.setFieldsValue({ tenantName: capitalized })
              }}
              disabled={!!this.props.isStaff}
            /> */}
            <Select
              showArrow
              showSearch
              onSearch={this.getAllCardByCompany}
              onSelect={(idCard) => this.onSelectCard(idCard)}
              className="full-width"
              filterOption={false}
              disabled={!!this.props.isStaff}>
              {this.renderOptions(
                (this.state.listCardByCompany ?? []).map((item) => ({
                  key: item?.id,
                  value: item?.tenantName,
                  label: (
                    <>
                      {item?.tenantName}
                      <br />
                      <span className="fs-6 text-muted">{item?.departmentName}</span>
                    </>
                  )
                }))
              )}
            </Select>
          </Form.Item>
          <Form.Item name="cardId" noStyle>
            <Input type="hidden" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="departmentName"
            label={L('REQUEST_CARD_DEPARTMENT')}
            {...formVerticalLayout}
            rules={rules.required}>
            <Input disabled={!!this.props.isStaff || this.props.requestType === 3} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="elevatorAccess" label={L('BUILD_CARD_ELEVATOR')} {...formVerticalLayout}>
            <Input disabled={!!this.props.isStaff || this.props.requestType === 3} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="numberPlate"
            label={L('BUILD_CARD_VEHICLE_NUMBER_PLATE')}
            {...formVerticalLayout}
            rules={rules.required}>
            <Input disabled={!!this.props.isStaff || this.props.requestType === 3} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="tenantType"
            label={L('BUILD_CARD_VEHICLE_TENANT_TYPE')}
            {...formVerticalLayout}
            rules={rules.required}>
            <Select
              showArrow
              className="full-width"
              style={{ width: '100%' }}
              filterOption={false}
              disabled={!!this.props.isStaff || this.props.requestType === 3}>
              {this.renderOptions(this.props.listTenantTypeUseVehicle)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="vehicleTypeId"
            label={L('BUILD_CARD_VEHICLE_TYPE')}
            {...formVerticalLayout}
            rules={rules.required}>
            <Select
              showArrow
              className="full-width"
              style={{ width: '100%' }}
              filterOption={false}
              disabled={!!this.props.isStaff || this.props.requestType === 3}>
              {this.renderOptions(this.props.listVehicleType)}
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="vehicleParkingType"
            label={L('BUILD_CARD_VEHICLE_FEE_CONFIGURATION')}
            {...formVerticalLayout}
            rules={rules.required}>
            <Select
              showArrow
              className="full-width"
              style={{ width: '100%' }}
              filterOption={false}
              disabled={!!this.props.isStaff || this.props.requestType === 3}>
              {this.renderOptions(this.props.listVehicleParkingType)}
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name="parkingId"
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100vw' }}>
                <div>{L('BUILD_CARD_VEHICLE_PARKING')}</div>
                <div>
                  <Tooltip title={L('NOTE_PARKING_ADMIN')}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </div>
              </div>
            }
            {...formVerticalLayout}>
            <Select disabled showArrow className="full-width" style={{ width: '100%' }} filterOption={false}>
              {this.renderOptions(this.props.listParking)}
            </Select>
          </Form.Item>
        </Col>
        {!this.props.isStaff && (
          <Col sm={{ span: 24, offset: 0 }}>
            <FormInput name="updateDescription" label={L('LAST_MODIFIER_USER_DESTIPTION')} />
          </Col>
        )}
        <UpdateVehiclesModal
          onRefresh={this.props.onRefresh}
          formItem={this.props.formItem}
          requestType={this.props.requestType}
          visible={this.state.showPopup}
          onCancel={() => {
            this.setState({ showPopup: false })
          }}
        />
      </Row>
    )
  }
}

export default ComponentRequestChangeInfo
