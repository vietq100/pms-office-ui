import AppComponentBase from '@components/AppComponentBase'
import { Col, Input, Row, Select } from 'antd'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import PackageFeeStore from '@stores/fee/packageFeeStore'
import FeeTypeStore from '@stores/fee/feeTypeStore'
import AppConst, { listFeePaymentStatus, showToResidents } from '@lib/appconst'
import FeeStore from '@stores/fee/feeStore'
import debounce from 'lodash/debounce'
import './fee-filter.less'
import amenityGroupService from '@services/booking/amenityGroupService'
import FeeGroupStore from '@stores/fee/feeGroupStore'
import amenityService from '@services/booking/amenityService'

const { activeStatus } = AppConst

interface Props {
  params: any
  feeGroupStore?: FeeGroupStore
  packageFeeStore?: PackageFeeStore
  feeTypeStore?: FeeTypeStore
  feeStore?: FeeStore
  className?: string
}
interface State {
  selectedPackage: any
  groupName: string
  amenities: any
  selectAmenity: any
}
@inject(Stores.PackageFeeStore, Stores.FeeTypeStore, Stores.FeeStore, Stores.AmenityStore, Stores.FeeGroupStore)
@observer
export default class FeeImportFilter extends AppComponentBase<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      selectedPackage: null,
      groupName: '',
      amenities: null,
      selectAmenity: []
    }
  }

  async componentDidMount() {
    return Promise.all([
      this.getAllAmenity(),
      this.handlePackageFeeSearch('')
      // this.handleFeeTypeSearch(' ')
    ])
  }

  handlePackageFeeChange = (value) => {
    const foundPackage = (this.props.packageFeeStore?.packageOptions || []).find((item) => item.id === Number(value))
    this.props.feeStore?.setSelectedPackageFee(foundPackage)
    this.props.feeStore?.setFilter('packageId', value)
    this.setState({ selectedPackage: value })
    this.getAll()
  }
  handlePackageFeeSearch = debounce(async (keyword) => {
    await this.props.packageFeeStore?.filterOption({ keyword })
  }, 100)
  handleFeeTypeSearch = (keyword) => {
    this.props.feeTypeStore?.getLists({ keyword })
  }

  handleFeeTypeChange = (value) => {
    this.props.feeStore?.setFilter('feeTypeId', value)
    this.getAll()
  }
  handleAmenityTypeSearch = async (keyword) => {
    const res = await amenityGroupService.getAll({ keyword, isActive: true })
    this.setState({ amenities: res })
  }
  handleAmenityTypeChange = (value) => {
    this.props.feeStore?.setFilter('amnenityId', value)
    this.getAll()
  }

  handleSearch = (keyword) => {
    this.props.feeStore?.setFilter('keyword', keyword)
    this.getAll()
  }

  getAll = () => {
    this.props.feeStore?.getAll({})
  }

  handleShowToResidentChange = (value) => {
    this.props.feeStore?.setFilter('isShowToResident', value)
    this.getAll()
  }

  handleActiveStatusChange = (value) => {
    this.props.feeStore?.setFilter('isActive', value)
    this.getAll()
  }

  handleFeeStatusChange = (value) => {
    this.props.feeStore?.setFilter('feeStatus', value)
    this.getAll()
  }

  getAllAmenity = async () => {
    const res = await amenityService.getAll({ isActive: true })

    this.setState({ selectAmenity: res.items })
  }
  handleFeeAmenityChange = async (value) => {
    this.props.feeStore?.setFilter('amenityId', value)
    this.getAll()
  }

  render() {
    const { packageFeeStore, feeTypeStore, className } = this.props
    return (
      <div className={className}>
        <Row gutter={[16, 8]}>
          <Col md={{ span: 6 }} sm={{ span: 24 }}>
            <span>{this.L('FILTER_KEYWORD')}</span>
            <Input.Search onSearch={this.handleSearch} allowClear placeholder={this.L('FEE_SEARCH_PLACEHOLDER')} />
          </Col>
          <Col sm={{ span: 24 }} md={{ span: 6 }}>
            <span>{this.L('FEE_FILTER_PACKAGE')}</span>
            <Select
              style={{ width: '100%' }}
              showArrow
              showSearch
              allowClear
              filterOption={false}
              value={this.state.selectedPackage as any}
              onChange={this.handlePackageFeeChange}
              onSearch={this.handlePackageFeeSearch}>
              {(packageFeeStore?.packageOptions || []).map((pfStore, index) => (
                <Select.Option value={`${pfStore.id}`} key={index}>
                  {pfStore.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col sm={{ span: 24 }} md={{ span: 6 }}>
            <span>{this.L('FEE_FILTER_TYPE')}</span>
            <Select
              showSearch
              showArrow
              allowClear
              filterOption={false}
              style={{ width: '100%' }}
              onChange={this.handleFeeTypeChange}
              onSearch={this.handleFeeTypeSearch}>
              {feeTypeStore?.pagedResult?.items?.map((ft, index) => (
                <Select.Option value={`${ft.id}`} key={index}>
                  {ft.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col sm={{ span: 24 }} md={{ span: 6 }}>
            <span>{this.L('FEE_STATUS')}</span>
            <Select allowClear style={{ width: '100%' }} defaultValue={''} onChange={this.handleFeeStatusChange}>
              {listFeePaymentStatus.map((status) => (
                <Select.Option value={status.value} key={status.value}>
                  {status.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col sm={{ span: 24 }} md={{ span: 6 }}>
            <span>{this.L('FEE_SHOW_TO_RESIDENT')}</span>
            <Select allowClear style={{ width: '100%' }} defaultValue={''} onChange={this.handleShowToResidentChange}>
              {showToResidents.map((status) => (
                <Select.Option value={status.value} key={status.value}>
                  {status.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col sm={{ span: 24 }} md={{ span: 6 }}>
            <span>{this.L('FILTER_ACTIVE_STATUS')}</span>
            <Select
              allowClear
              style={{ width: '100%' }}
              defaultValue={this.L('ACTIVE')}
              onChange={this.handleActiveStatusChange}>
              {activeStatus.map((status) => (
                <Select.Option value={status.value} key={status.value}>
                  {status.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          {this.props.params['*'].slice(14) === 'feeReservation' && (
            <Col sm={{ span: 24 }} md={{ span: 6 }}>
              <span>{this.L('FILTER_FEE_GROUP_AMENITY')}</span>
              <Select allowClear style={{ width: '100%' }} defaultValue={''} onChange={this.handleFeeAmenityChange}>
                {this.state.selectAmenity.map((item, index) => (
                  <Select.Option value={item.id} key={index}>
                    {item.amenityName}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          )}
        </Row>
      </div>
    )
  }
}
