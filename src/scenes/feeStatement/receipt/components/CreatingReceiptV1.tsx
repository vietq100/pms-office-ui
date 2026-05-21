import { HomeOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import AppComponentBase from '@components/AppComponentBase'
import { L, LNotification, LError } from '@lib/abpUtility'
import AppConst, { appPermissions, dateFormat } from '@lib/appconst'
import { formatCurrency } from '@lib/helper'
import { validateMessages } from '@lib/validation'
import { ResidentUnit } from '@models/fee'
import receiptService from '@services/fee/receiptService'
import PackageFeeStore from '@stores/fee/packageFeeStore'
import ReceiptStore from '@stores/fee/receiptStore'
import ProjectStore from '@stores/project/projectStore'
import Stores from '@stores/storeIdentifier'
import { Button, Col, DatePicker, Divider, Empty, Modal, Row, Select, Spin, Tag } from 'antd'
import Form, { FormInstance } from 'antd/lib/form'
import debounce from 'lodash/debounce'
import groupBy from 'lodash/groupBy'
import get from 'lodash/get'
import { inject, observer } from 'mobx-react'
import React from 'react'
import './create-receipt.less'
import Checkbox from 'antd/lib/checkbox'
import Input from 'antd/es/input'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import FormSelect from '@components/FormItem/FormSelect'
import feeService from '@services/fee/feeService'
import dayjs from 'dayjs'

const { feeSourceGroup } = AppConst
const feeSourceGroups = Object.keys(feeSourceGroup).map((key) => {
  return { label: L(`FEE_SOURCE_GROUP_${key}`), value: feeSourceGroup[key] }
})

type FeeDetail = {
  fullUnitCode: string
  customerName: string
  debitAmount: number
  billNumber: string
  feePayStatusId: number
  description: string
  isSelected: boolean
  feeType: {
    name: string
  }
  package: {
    name: string
    period: number
    year: number
  }
}

interface Props {
  navigate: any
  packageFeeStore?: PackageFeeStore
  projectStore: ProjectStore
  receiptStore: ReceiptStore
}

interface State {
  unit: any
  feeDetails: FeeDetail[]
  feeGroups: any[]
  isLoading: boolean
  totalDebit: number
  isSelectedAll: boolean
  groupName: string
  listPayment: any[]
}

@inject(Stores.PackageFeeStore, Stores.ProjectStore, Stores.ReceiptStore)
@observer
class CreatingReceipt extends AppComponentBase<Props, State> {
  form = React.createRef<FormInstance>()
  unitIdFromState = null

  constructor(props) {
    super(props)
    const hasRouteState = get(this.props, 'location.state')
    this.state = {
      unit: {},
      feeDetails: [],
      feeGroups: [],
      isLoading: !!hasRouteState,
      totalDebit: 0,
      isSelectedAll: false,
      groupName: '',
      listPayment: []
    }
  }

  async componentDidMount() {
    const dataStateString = get(this.props, 'location.state')

    if (dataStateString) {
      const dataState = JSON.parse(dataStateString)
      const { unitId, groupName, selectedFeeId } = dataState

      await Promise.all([
        this.getOutStanding(unitId, groupName, selectedFeeId),
        this.props.projectStore.filterUnitUserOptions({
          isActive: true,
          unitId
        })
      ])
      const [firstUnitUser] = this.props.projectStore.unitUserOptions
      this.form.current?.setFieldsValue({
        incomingDate: dayjs(new Date()),
        unitUserId: firstUnitUser?.optionValue,
        unitId,
        groupName
      })
      this.setState({ isLoading: false, groupName })
    } else {
      await this.handleUnitSearch('')
      this.form.current?.setFieldsValue({ incomingDate: dayjs(new Date()) })
    }
    const listPayment = await feeService.getListPaymentChannels({})
    this.setState({ listPayment })
  }

  get getSelectedOutStanding() {
    const { feeGroups } = this.state
    return feeGroups.reduce((result, item) => {
      const selectedFeeDetails = (item.feeDetails || []).filter((item) => item.isSelected)
      return [...result, ...selectedFeeDetails]
    }, [])
  }

  get getTotalDebitSelected() {
    return this.getSelectedOutStanding.reduce((total, item) => (total += item.debitAmount), 0)
  }

  get getPayerInfo() {
    const formData = this.form.current?.getFieldsValue() || {}
    const { unitUserId } = formData
    const userId = Number(get(unitUserId.split('-'), '[1]'))

    if (!userId) {
      throw new Error(LError('RESIDENT_WAS_NOT_SELECTED'))
    }
    const foundUser = this.props.projectStore.unitUserOptions.find((unit: any) => unit.userId === userId)
    return {
      residentId: userId,
      fullName: get(foundUser, 'displayName'),
      email: get(foundUser, 'emailAddress'),
      phoneNumber: get(foundUser, 'phoneNumber')
    }
  }

  onOk = () => {
    this.form.current?.validateFields().then(() => {
      Modal.confirm({
        title: LNotification('DO_YOU_WANT_TO_CREATE_THIS_RECEIPT'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),

        onOk: async () => {
          const formData = this.form.current?.getFieldsValue() || {}
          const { incomingDate, paymentChanelId } = formData
          const feePayer = this.getPayerInfo
          const feeDetails = this.getSelectedOutStanding.map((item: any) => ({
            feeDetailId: item.id,
            paidAmount: item.totalAmount - item.debitAmount
          }))

          await this.props.receiptStore
            .create({
              feeDetails,
              feePayer,
              incomingDate,
              paymentChanelId
            })
            .then((res) => {
              this.props.navigate(portalLayouts.feeReceiptDetail.path.replace(':id', res.id))
            })
        }
      })
    })
  }

  handleUnitSearch = debounce(async (keyword) => {
    await this.props.projectStore.filterUnitUserOptions({
      keyword,
      isActive: true
    })
  }, 200)

  handlePackageFeeSearch = (keyword) => {
    this.props.packageFeeStore?.getAll({ keyword })
  }

  handleSelectFee = async (groupIndex, feeDetailIndex) => {
    const { feeGroups } = this.state
    if (
      feeGroups.length < groupIndex ||
      !feeGroups[groupIndex].feeDetails ||
      feeGroups[groupIndex].feeDetails.length < feeDetailIndex
    ) {
      return
    }

    feeGroups[groupIndex].feeDetails[feeDetailIndex].isSelected =
      !feeGroups[groupIndex].feeDetails[feeDetailIndex].isSelected
    this.setState({ feeGroups: feeGroups })
  }

  selectOrDeselectAll = () => {
    const { isSelectedAll, feeGroups } = this.state
    feeGroups.forEach((feeGroup) => {
      ;(feeGroup.feeDetails || []).forEach((feeDetail) => (feeDetail.isSelected = !isSelectedAll))
    })
    this.setState({ isSelectedAll: !isSelectedAll, feeGroups: feeGroups })
  }

  setUnitId = async () => {
    const formData = this.form.current?.getFieldsValue() || {}
    const unitId = Number(formData.unitUserId?.split('-')[0]) || undefined
    this.form.current?.setFieldsValue({ unitId })

    await this.getOutStanding()
  }

  getOutStanding = async (unitId?, groupName?, selectedFeeId?) => {
    try {
      const formData = this.form.current?.getFieldsValue() || {}
      unitId = unitId || formData?.unitId
      groupName = groupName || formData?.groupName

      if (unitId) {
        const feeDetails = await receiptService.getOutStanding({
          unitId
        })
        const groups = groupBy(feeDetails, 'packageId')
        const feeGroups = Object.keys(groups).map((key) => {
          groups[key].forEach((feeDetail) => (feeDetail.isSelected = !selectedFeeId || selectedFeeId === feeDetail.id))

          return {
            packageId: key,
            package: groups[key].length ? groups[key][0].package || {} : {},
            feeDetails: groups[key]
          }
        })

        const totalDebit = feeDetails.reduce((total, item) => total + item.debitAmount, 0)
        this.setState({
          feeDetails,
          feeGroups: feeGroups,
          totalDebit,
          isSelectedAll: feeDetails.length > 0
        })
      } else {
        this.setState({ feeDetails: [], isSelectedAll: false })
      }
    } catch (e) {
      console.log(e)
    }
  }

  renderButtonActions = () => {
    const { totalDebit } = this.state
    return (
      <Row className={'create-receipt-footer'}>
        <Col sm={{ span: 12 }}>
          <Button onClick={() => this.props.navigate(-1)} className={'mr-2'}>
            {L('BTN_CANCEL')}
          </Button>
          {this.isGranted(appPermissions.feeReceipt.create) && (
            <Button
              type="primary"
              onClick={this.onOk}
              loading={this.props.receiptStore.isLoading}
              disabled={!this.getTotalDebitSelected}>
              {L('BTN_CONFIRM_RECEIPT')}
            </Button>
          )}
        </Col>
        <Col sm={{ span: 12 }} className="text-right">
          <div className="mb-0">
            <span>{this.L('RECEIPT_TOTAL_DEBIT')}: </span>
            <span className="price">{formatCurrency(totalDebit)}</span>
          </div>
          <h4 className="mb-0">
            <span>{this.L('RECEIPT_NEED_TO_PAY')}: </span>
            <span className={'total price'}>{formatCurrency(this.getTotalDebitSelected)}</span>
          </h4>
        </Col>
      </Row>
    )
  }

  render() {
    const {
      projectStore: { unitUserOptions }
    } = this.props
    const { feeGroups, isLoading, totalDebit } = this.state
    const isSelectedAll = totalDebit > 0 && totalDebit === this.getTotalDebitSelected

    return (
      <div className={'create-receipt-content'}>
        <Form
          layout={'vertical'}
          ref={this.form}
          style={{ backgroundColor: 'white', padding: 16 }}
          validateMessages={validateMessages}
          size="middle">
          <Row gutter={[16, 0]}>
            <Form.Item name="unitId" style={{ height: 0 }}>
              <Input style={{ display: 'none' }} hidden={true} />
            </Form.Item>
            <Col md={{ span: 6 }} sm={{ span: 24 }}>
              <Form.Item name="unitUserId" rules={[{ required: true }]} label={this.L('WORK_ORDER_RESIDENT')}>
                <Select
                  showSearch
                  allowClear
                  filterOption={false}
                  className="full-width"
                  onChange={this.setUnitId}
                  onSearch={this.handleUnitSearch}>
                  {unitUserOptions.map((option: ResidentUnit, index) => {
                    return !option.displayName ? null : (
                      <Select.Option key={index} value={option.optionValue}>
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
                      </Select.Option>
                    )
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col md={{ span: 6 }} sm={{ span: 24 }}>
              <Form.Item name={'incomingDate'} label={this.L('FEE_RECEIPT_INCOMING_DATE')} rules={[{ required: true }]}>
                <DatePicker format={dateFormat} style={{ width: '100%' }} placeholder={L('SELECT_DATE')} />
              </Form.Item>
            </Col>
            <Col md={{ span: 6 }} sm={{ span: 24 }}>
              <FormSelect
                selectProps={{
                  size: 'middle'
                }}
                rule={[{ required: true }]}
                options={this.state.listPayment}
                label={L('PAYMENT_CHANEL')}
                name={'paymentChanelId'}
              />
            </Col>
            <Col md={{ span: 6 }} sm={{ span: 24 }}>
              <Form.Item name={'groupName'} label={this.L('FEE_SOURCE')} rules={[{ required: true }]}>
                <Select allowClear filterOption={false} className="full-width" onChange={() => this.getOutStanding()}>
                  {(feeSourceGroups || []).map((item: any, index) => (
                    <Select.Option key={index} value={item.value}>
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <h3 className="mb-0 mt-3">
          <Checkbox onChange={this.selectOrDeselectAll} checked={isSelectedAll}>
            {this.L('RECEIPT_FEE_DETAILS')}
          </Checkbox>
        </h3>
        <div className={'flex column create-receipt'}>
          {feeGroups.length > 0 ? (
            feeGroups.map((feeGroup, feeGroupIndex) => {
              return (
                <React.Fragment key={feeGroupIndex}>
                  <Row gutter={16} className="receipt-group-package">
                    <Col sm={{ span: 24 }}>
                      <Divider orientation="left" plain style={{ margin: 0 }}>
                        <h4 style={{ fontWeight: 600 }}>
                          {this.L('FEE_PACKAGE')}: {feeGroup.package?.name}
                        </h4>
                      </Divider>
                    </Col>
                  </Row>
                  {feeGroup.feeDetails.map((feeDetail: FeeDetail, feeDetailIndex) => (
                    <React.Fragment key={feeDetailIndex}>
                      <Row gutter={16}>
                        <Col sm={{ span: 20 }}>
                          <Checkbox
                            onChange={() => this.handleSelectFee(feeGroupIndex, feeDetailIndex)}
                            checked={feeDetail.isSelected}>
                            {feeDetail.billNumber} - {feeDetail.feeType?.name}
                          </Checkbox>
                          <div className="text-truncate-2 text-muted small" style={{ paddingLeft: '25px' }}>
                            {feeDetail.description}
                          </div>
                        </Col>
                        <Col sm={{ span: 4 }} className="text-right">
                          <Tag className="cell-round mr-0">{formatCurrency(feeDetail.debitAmount)}</Tag>
                        </Col>
                      </Row>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              )
            })
          ) : isLoading ? (
            <div className="flex center-content">
              <Spin />
            </div>
          ) : (
            <Empty
              className={'fee-detail-empty'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ backgroundColor: 'white', padding: '16px 0', margin: 0 }}
            />
          )}
        </div>
        {this.renderButtonActions()}
      </div>
    )
  }
}

export default withRouter(CreatingReceipt)
