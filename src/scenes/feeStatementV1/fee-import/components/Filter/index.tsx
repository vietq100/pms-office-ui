import AppComponentBase from '@components/AppComponentBase'
import { Col, Row, Select } from 'antd'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import PackageFeeStore from '@stores/fee/packageFeeStore'
import FeeTypeStore from '@stores/fee/feeTypeStore'
import AppConst, { listFeePaymentStatus, showToResidents } from '@lib/appconst'
import FeeStore from '@stores/fee/feeStore'
import debounce from 'lodash/debounce'
import amenityGroupService from '@services/booking/amenityGroupService'
import FeeGroupStore from '@stores/fee/feeGroupStore'
import amenityService from '@services/booking/amenityService'
import { L } from '@lib/abpUtility'

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
  selectUnit: number | undefined
  feeTypeGroup: any
  showFilerAmenity: boolean
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
      selectAmenity: [],
      selectUnit: undefined,
      feeTypeGroup: [],
      showFilerAmenity: false
    }
  }

  async componentDidMount() {
    return Promise.all([
      this.getAllAmenity(),
      this.handlePackageFeeSearch(''),
      this.handleFeeTypeSearch(''),
      this.handleUnitSearch('')
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
  handleFeeTypeSearch = async (keyword) => {
    await this.props.feeTypeStore?.getLists({
      keyword
    })
    const feeGroupStatement = this.props.feeTypeStore?.pagedResult.items.filter((obj) => obj.groupId === 1)
    const feeGroupFacility = this.props.feeTypeStore?.pagedResult.items.filter((obj) => obj.groupId === 2)
    const feeTypeGroup = [
      {
        name: L('FEE_STATEMENT_FEE_TYPE_FILTER_FEE_STATEMENT'),
        childs: feeGroupStatement
      },
      {
        name: L('FEE_STATEMENT_FEE_TYPE_FILTER_FEE_FACILIY'),
        childs: feeGroupFacility
      }
    ]
    this.setState({ feeTypeGroup: feeTypeGroup })
  }

  handleFeeTypeChange = (value) => {
    const feeGroup2 = this.state.feeTypeGroup[1]
    feeGroup2.childs.find((feeType) => feeType.groupId === 2 && feeType.id === value)
      ? this.setState({ showFilerAmenity: true })
      : this.setState({ showFilerAmenity: false })

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
  handleUnitChange = async (unitId) => {
    this.setState({ selectUnit: unitId })
    this.props.feeStore?.setFilter('unitId', unitId)
    await this.getAll()
    if (!unitId) {
      return
    }
  }

  handleUnitSearch = async (keyword) => {
    this.props.feeGroupStore?.getUnits({ keyword })
  }

  render() {
    const { packageFeeStore, className } = this.props
    return (
      <div className={className}>
        <Row gutter={[16, 8]}>
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
            <span>{this.L('FILTER_UNIT')}</span>
            <Select
              showSearch
              allowClear
              filterOption={false}
              className="full-width"
              value={this.state.selectUnit}
              onChange={this.handleUnitChange}
              onSearch={debounce(this.handleUnitSearch, 300)}>
              {this.props.feeGroupStore?.units?.map((unit: any, index) => {
                return (
                  <Select.Option key={index} value={unit.id}>
                    {unit.fullUnitCode}
                  </Select.Option>
                )
              })}
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
          </Col>{' '}
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
              {this.state.feeTypeGroup.map((item, index) => (
                <Select.OptGroup label={item.name} key={index}>
                  {item.childs.map((sub) => (
                    <Select.Option key={sub.id} value={sub.id}>
                      {sub.name}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
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
          {this.state.showFilerAmenity === true && (
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
