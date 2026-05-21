import AppComponentBase from '@components/AppComponentBase'
import AppConst, { listFeePaymentStatus, showToResidents } from '@lib/appconst'
import packageFeeService from '@services/fee/packageFeeService'
import Stores from '@stores/storeIdentifier'
import { Col, Row, Select } from 'antd'
import debounce from 'lodash/debounce'
import { inject, observer } from 'mobx-react'
import FeeGroupStore from '@stores/fee/feeGroupStore'
import FeeTypeStore from '@stores/fee/feeTypeStore'
import amenityService from '@services/booking/amenityService'

const { activeStatus, feeSourceGroup } = AppConst

interface Props {
  feeGroupStore?: FeeGroupStore
  params: any
  className?: string
  feeTypeStore?: FeeTypeStore
}

interface State {
  packages: any
  selectedPackage: any
  feeTypeStore?: FeeTypeStore
  selectAmenity: any
  selectUnit: number | undefined
  selectFeeType: number | undefined
  projects: { value: string; label: string }[]
}

@inject(Stores.FeeGroupStore, Stores.UnitStore, Stores.FeeTypeStore)
@observer
export default class FeeGroupFilter extends AppComponentBase<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      packages: [],
      selectAmenity: [],
      selectedPackage: null,
      selectUnit: undefined,
      projects: [],
      selectFeeType: undefined
    }
  }
  async componentDidMount() {
    return Promise.all([
      this.handleUnitSearch(''),
      this.getAllAmenity(),
      this.getAll(),
      this.handleFeeTypeSearch(''),
      this.handlePackageFeeSearch('')
    ])
  }
  getAll = () => {
    const feeGroup = this.props.params['*'].slice(14)

    return this.props.feeGroupStore?.getAll({
      groupName: feeSourceGroup[feeGroup]
    })
  }

  getAllAmenity = async () => {
    const res = await amenityService.getAll({ isActive: true })
    this.setState({ selectAmenity: res.items })
  }
  handlePackageFeeSearch = async (keyword) => {
    const { feeGroupStore } = this.props
    const res = await packageFeeService.getAll({
      projectId: feeGroupStore?.projectId,
      keyword
    })
    this.setState({ packages: res.items })
  }

  handlePackageFeeChange = async (packageId) => {
    this.setState({ selectedPackage: packageId })
    this.props.feeGroupStore?.setFilter('packageId', packageId)
    await this.getAll()
    if (!packageId) {
      const response = await packageFeeService.getAll({
        projectId: this.props.feeGroupStore?.projectId
      })
      this.setState({ packages: response.items })
    }
  }

  handleUnitSearch = async (keyword) => {
    this.props.feeGroupStore?.getUnits({ keyword })
  }

  handleUnitChange = async (unitId) => {
    this.setState({ selectUnit: unitId })
    this.props.feeGroupStore?.setFilter('unitId', unitId)
    this.props.feeGroupStore?.setSelectResidentUnit(unitId)
    await this.getAll()
    if (!unitId) {
      await this.props.feeGroupStore?.getUnits({
        isActive: true,
        projectId: this.props.feeGroupStore?.projectId
      })
    }
  }
  handleFeeTypeSearch = async (keyword) => {
    const feeGroup = this.props.params['*'].slice(14)
    this.props.feeTypeStore?.getLists({
      groupName: feeSourceGroup[feeGroup],
      keyword
    })
  }

  handleFeeTypeChange = async (feeTypeId) => {
    this.setState({ selectFeeType: feeTypeId })
    this.props.feeTypeStore?.setFilter('feeTypeId', feeTypeId)
    this.props.feeGroupStore?.setFilter('feeTypeId', feeTypeId)
    await this.getAll()
  }
  handleActiveStatusChange = async (value = '') => {
    this.props.feeGroupStore?.setFilter('isActive', value.trim())
    await this.getAll()
  }

  handleShowToResidentChange = async (value) => {
    this.props.feeGroupStore?.setFilter('isShowToResident', value)
    await this.getAll()
  }

  handleFeeStatusChange = async (value) => {
    this.props.feeGroupStore?.setFilter('feeStatusId', value)
    await this.getAll()
  }

  handleFeeAmenityChange = async (value) => {
    this.props.feeGroupStore?.setFilter('amenityId', value)
    await this.getAll()
  }

  render() {
    const { feeTypeStore } = this.props
    const showActivationStatus = this.props.feeGroupStore?.filterObject?.groupName === feeSourceGroup.feeManagement

    return (
      <div className={this.props.className}>
        <Row gutter={[16, 8]}>
          <Col sm={{ span: 24 }} md={{ span: 6 }}>
            <span>{this.L('FEE_FILTER_PACKAGE')}</span>
            <Select
              showArrow
              showSearch
              allowClear
              filterOption={false}
              style={{ width: '100%' }}
              value={this.state.selectedPackage}
              onChange={this.handlePackageFeeChange}
              onSearch={this.handlePackageFeeSearch}>
              {this.state.packages.map((pfStore) => (
                <Select.Option value={`${pfStore.id}`} key={pfStore.guid}>
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
          </Col>
          <Col sm={{ span: 24 }} md={{ span: 6 }}>
            <span>{this.L('FEE_FILTER_TYPE')}</span>
            <Select
              showSearch
              allowClear
              filterOption={false}
              style={{ width: '100%' }}
              value={this.state.selectFeeType}
              onChange={this.handleFeeTypeChange}
              onSearch={this.handleFeeTypeSearch}>
              {feeTypeStore?.pagedResult?.items?.map((ft, index) => (
                <Select.Option value={`${ft.id}`} key={index}>
                  {ft.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col md={{ span: 6 }}>
            <span>{this.L('FEE_SHOW_TO_RESIDENT')}</span>
            <Select allowClear style={{ width: '100%' }} defaultValue={''} onChange={this.handleShowToResidentChange}>
              {showToResidents.map((status) => (
                <Select.Option value={status.value} key={status.value}>
                  {status.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          {/* {!showActivationStatus && (
            <Col sm={{ span: 24 }} md={{ span: 6 }}>
              <span>{this.L('FILTER_FEE_GROUP_AMENITY')}</span>
              <Select
                allowClear
                style={{ width: '100%' }}
                defaultValue={''}
                onChange={this.handleFeeAmenityChange}>
                {this.state.selectAmenity.map((item, index) => (
                  <Select.Option value={item.id} key={index}>
                    {item.amenityName}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          )} */}
          {showActivationStatus && (
            <Col md={{ span: 6 }}>
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
          )}
        </Row>
      </div>
    )
  }
}
