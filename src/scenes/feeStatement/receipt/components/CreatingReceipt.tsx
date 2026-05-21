import { HomeOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import AppComponentBase from '@components/AppComponentBase'
import withRouter from '@components/Layout/Router/withRouter'
import { L, LNotification } from '@lib/abpUtility'
import { appPermissions, dateFormat } from '@lib/appconst'
import { formatCurrency, notifySuccess } from '@lib/helper'
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
import get from 'lodash/get'
import { inject, observer } from 'mobx-react'
import moment from 'moment-timezone/moment-timezone'
import React from 'react'

type FeeDetail = {
  fullUnitCode: string
  customerName: string
  debitAmount: number
  billNumber: string
  feePayStatusId: number
  description: string
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
  creating: boolean
  feeDetails: FeeDetail[]
  isLoading: boolean
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
      creating: false,
      feeDetails: [],
      isLoading: !!hasRouteState
    }
  }
  async componentDidMount() {
    const feeGroupString = get(this.props, 'location.state')

    await this.props.projectStore.filterOptions({})

    if (feeGroupString) {
      const feeGroup = JSON.parse(feeGroupString)
      const { package: inputPackage, projectId, unitId, residentUnitId } = feeGroup

      const [feeDetails] = await Promise.all([
        receiptService.getOutStanding({
          projectId,
          packageId: inputPackage.id,
          unitId
        }),
        this.props.projectStore.filterUnitUserOptions({
          isActive: true,
          projectId,
          unitId
        }),
        this.props.packageFeeStore?.getAll({ projectId, maxResultCount: 1000 })
      ])
      this.unitIdFromState = residentUnitId
      this.form.current?.setFieldsValue({
        incomingDate: moment(new Date()),
        packageId: inputPackage.id,
        projectId
      })
      this.setState({ feeDetails, isLoading: false })
    } else {
      this.form.current?.setFieldsValue({ incomingDate: moment(new Date()) })
    }
  }

  errorResidentNotFound = () => {
    throw new Error('Resident was not selected')
  }

  onOk = () => {
    const self = this
    self.form.current
      ?.validateFields()
      .then(() => {
        self.setState({ creating: true })
        Modal.confirm({
          title: LNotification('DO_YOU_WANT_TO_CREATE_THIS_RECEIPT'),
          okText: L('BTN_YES'),
          cancelText: L('BTN_NO'),
          async onOk() {
            try {
              const formData = self.form.current?.getFieldsValue()
              const { projectId, incomingDate } = formData
              const { unitId } = formData
              const userId = Number(get(unitId.split('-'), '[1]'))
              if (!userId) {
                self.errorResidentNotFound()
              }
              const feePayer = self.getUserById(userId)
              const feeDetails = self.state.feeDetails.map((item: any) => ({
                feeDetailId: item.id,
                paidAmount: item.totalAmount - item.debitAmount
              }))
              await self.props.receiptStore.create({
                feeDetails,
                feePayer,
                projectId,
                incomingDate
              })
              notifySuccess(LNotification('SUCCESS'), LNotification('ITEM_CREATE_SUCCEED'))
              self.setState({ creating: false }, () => self.props.navigate('/receipt'))
            } catch (e) {
              self.setState({ creating: false })
              throw e
            }
          }
        })
      })
      .catch((e) => {
        self.setState({ creating: false })
        throw e
      })
  }

  handleUnitSearch = async (keyword) => {
    await this.props.projectStore.filterUnitUserOptions({
      keyword,
      isActive: true,
      projectId: this.form.current?.getFieldValue('projectId')
    })
  }

  handleProjectSearch = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  // noinspection DuplicatedCode
  handleProjectChange = async (projectId) => {
    this.form.current?.setFieldsValue({ unitId: '', packageId: '' })
    if (projectId) {
      await Promise.all([
        this.props.projectStore.filterUnitUserOptions({
          isActive: true,
          projectId
        }),
        this.props.packageFeeStore?.getAll({ projectId })
      ])
      await this.getOutStanding()
    } else {
      await Promise.all([this.props.projectStore.filterOptions({}), this.props.projectStore.resetUnitUserOptions()])
      this.props.packageFeeStore?.clearData()
    }
  }

  handlePackageFeeSearch = (keyword) => {
    this.props.packageFeeStore?.getAll({ keyword })
  }

  getUserById = (id) => {
    const foundUser = this.props.projectStore.unitUserOptions.find((unit: any) => unit.userId === id)
    return {
      residentId: id,
      fullName: get(foundUser, 'displayName'),
      email: get(foundUser, 'emailAddress'),
      phoneNumber: get(foundUser, 'phoneNumber')
    }
  }

  getOutStanding = async () => {
    const { projectId, packageId, unitId } = this.form.current?.getFieldsValue() as any
    if (projectId && packageId && unitId) {
      const _unit = Number(unitId.split('-')[0])
      const feeDetails = await receiptService.getOutStanding({
        projectId,
        packageId,
        unitId: _unit
      })
      this.setState({ feeDetails })
    } else {
      this.setState({ feeDetails: [] })
    }
  }

  renderButtonActions = () => (
    <div className={'create-receipt-footer'}>
      <div className={'flex column'}>
        <div className="flex wrap space-between summary">
          <div className={'flex column'}>
            <span className="text-left">{this.L('RECEIPT_TOTAL_DEBIT')}</span>
            <span className={'total'}>{formatCurrency(this.getTotalDebit())}</span>
          </div>
          <div className={'flex column'}>
            <span>{this.L('RECEIPT_NEED_TO_PAY')}</span>
            <span className={'total'}>{formatCurrency(this.getTotalDebit())}</span>
          </div>
        </div>
        <Divider type={'horizontal'} />
        <div className={'inline-flex'}>
          <Button onClick={this.props.navigate(-1)} className={'mr-2'}>
            {L('BTN_CANCEL')}
          </Button>
          {this.isGranted(appPermissions.feeReceipt.create) && (
            <Button
              type="primary"
              onClick={this.onOk}
              loading={this.state.creating}
              disabled={!this.state.feeDetails.length}>
              {L('BTN_CONFIRM_RECEIPT')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  getTotalDebit = () => {
    let total = 0
    this.state.feeDetails.forEach((f: FeeDetail) => (total += f.debitAmount))
    return total
  }

  render() {
    const {
      projectStore: { projectOptions, unitUserOptions }
    } = this.props
    const { feeDetails } = this.state

    return (
      <div className={'create-receipt-content'}>
        <Form
          layout={'vertical'}
          ref={this.form}
          style={{ backgroundColor: 'white', padding: 16 }}
          validateMessages={validateMessages}
          size="middle">
          <Row gutter={[16, 0]}>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item name={'projectId'} rules={[{ required: true }]} label={this.L('PROJECT')}>
                <Select
                  showArrow
                  showSearch
                  allowClear
                  filterOption={false}
                  style={{ width: '100%' }}
                  onChange={this.handleProjectChange}
                  onSearch={debounce(this.handleProjectSearch, 300)}>
                  {projectOptions.map((pfStore: any) => (
                    <Select.Option value={pfStore.value} key={pfStore.value}>
                      {pfStore.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item name="unitId" rules={[{ required: true }]} label={this.L('WORK_ORDER_RESIDENT')}>
                <Select
                  showSearch
                  allowClear
                  filterOption={false}
                  className="full-width"
                  onChange={this.getOutStanding}
                  onSearch={debounce(this.handleUnitSearch, 300)}
                  disabled={!this.form.current?.getFieldValue('projectId')}>
                  {unitUserOptions.map((option: ResidentUnit, index) => {
                    return (
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
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item name={'packageId'} label={this.L('FEE_FILTER_PACKAGE')} rules={[{ required: true }]}>
                <Select
                  showArrow
                  showSearch
                  allowClear
                  filterOption={false}
                  style={{ width: '100%' }}
                  onChange={this.getOutStanding}
                  onSearch={debounce(this.handlePackageFeeSearch, 300)}
                  disabled={!this.form.current?.getFieldValue('projectId')}>
                  {this.props.packageFeeStore?.pagedResult?.items.map((pfStore) => (
                    <Select.Option value={pfStore.id as any} key={pfStore.guid}>
                      {pfStore.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item name={'incomingDate'} label={this.L('FEE_RECEIPT_INCOMING_DATE')} rules={[{ required: true }]}>
                <DatePicker format={dateFormat} style={{ width: '100%' }} placeholder={L('SELECT_DATE')} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <h3 className={'mt-3'}>{this.L('RECEIPT_FEE_DETAILS')}</h3>
        {feeDetails.length > 0 ? (
          <div className={'flex column create-receipt'}>
            {feeDetails.map((feeDetail: FeeDetail, index) => (
              <React.Fragment key={index}>
                <Row gutter={16} style={{ minHeight: 100 }}>
                  <Col sm={{ span: 20 }}>
                    <div className={'flex column'}>
                      <span>
                        <b>{formatCurrency(feeDetail.debitAmount)}</b>
                      </span>
                      <span>
                        {feeDetail.billNumber} - {feeDetail.feeType?.name}
                      </span>
                      <span className="text-truncate-2 text-muted small">{feeDetail.description}</span>
                    </div>
                  </Col>
                  <Col sm={{ span: 4 }} className="text-right">
                    <Tag color={'#f50'} className="cell-round mr-0">
                      {L('FEE_UNPAID')}
                    </Tag>
                  </Col>
                </Row>
              </React.Fragment>
            ))}
          </div>
        ) : this.state.isLoading ? (
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
        {this.renderButtonActions()}
      </div>
    )
  }
}

export default withRouter(CreatingReceipt)
