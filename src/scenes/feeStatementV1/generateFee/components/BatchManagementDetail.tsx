import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu, Statistic, Tag, Button } from 'antd'

import { AppComponentListBase } from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst, { appPermissions } from '@lib/appconst'

import FeeGenerateStore from '@stores/fee/feeGenerateStore'

import { EllipsisOutlined } from '@ant-design/icons'
import CustomDrawer from '@components/Drawer/CustomDrawer'
import { debounce } from 'lodash'
import {
  columnMotobikeParking12Hours,
  columnParking,
  columnsFeeElectric,
  columnsFeeImport,
  columnsFeeManagement,
  columnsFeeRent,
  columnsFeeWater,
  columnOverTimeElectric
} from './column'
import { filterOptions, formatNumber } from '@lib/helper'
import cardbuidingService from '@services/cardbuilding/cardbuidingService'
import ExportFeeModal from './ExportFeeModal'
import { ExcelIcon } from '@components/Icon'

const { pageSize, activeStatus, feeAvailableStatus, targetSourceKeys, generateType, statusGenerateFee } = AppConst
export interface IProps {
  visible: boolean
  dataSend: any
  onCancel: () => void
  feeGenerateStore: FeeGenerateStore
}

export interface IState {
  maxResultCount: number
  skipCount: number
  filters: any
  feeType: any
  toggleModal: boolean
  listCompany: any[]
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.FeeGenerateStore, Stores.FeeStore)
@observer
class BatchManagementDetail extends AppComponentListBase<IProps, IState> {
  state = {
    maxResultCount: pageSize.pageSize_10,
    skipCount: 0,
    filters: {},
    feeType: undefined,
    toggleModal: false,
    listCompany: [] as any
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.getListCompany()
  }

  async componentDidUpdate(prevProps) {
    if (this.props.dataSend.id !== prevProps.dataSend.id) {
      await Promise.all([this.getAll()])
    }
  }

  getListCompany = async () => {
    const listCompany = await cardbuidingService.getListCompany()
    this.setState({ listCompany })
  }

  getAll = async () => {
    await this.props.feeGenerateStore.GetAllDetail({
      FeeGenerateId: this.props.dataSend.id,
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })

    await this.props.feeGenerateStore.getOverviewDetail({
      FeeGenerateId: this.props.dataSend.id,
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
    const itemFirst = this.props.feeGenerateStore.pagedBatchResult.items.map((item) => {
      return item
    })
    this.setState({ feeType: itemFirst })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  activateOrDeactivate = async (id: number) => {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        this.props.feeGenerateStore.deative(id)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  cofirmFeeGenerate = async () => {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_CONFIRM_THIS_ITEM'),
      content: LNotification('FEESTATEMENT_GENERATE_CONFIRM_ITEM_TO_DO'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        this.props.feeGenerateStore.cofirm(this.props.dataSend.id)
        self.handleTableChange({ current: 1 })
      }
    })
  }
  handleSearch = (name, value) => {
    const { filters } = this.state

    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      await this.getAll()
    })
  }
  handleExportFees = async (feeGenerateId?) => {
    const { feeGenerateStore } = this.props
    await feeGenerateStore.exportFeeGenerate({ feeGenerateId })
  }

  renderActionGroups = () => {
    return (
      <>
        {(this.props.dataSend.feeTypeId === generateType.OvertimeElectricity ||
          this.props.dataSend.feeTypeId === generateType.management ||
          this.props.dataSend.feeTypeId === generateType.rent) && (
          <Button
            type="primary"
            shape="round"
            onClick={() => this.setState({ toggleModal: !this.state.toggleModal })}
            className="mr-1">
            {this.L('BTN_PRINT_PDF')}
          </Button>
        )}
        <Button
          shape="circle"
          type="primary"
          className="mr-1"
          onClick={() => this.handleExportFees(this.props.dataSend.id)}
          icon={<ExcelIcon />}
          disabled={!this.props.feeGenerateStore.pagedBatchResult.totalCount}
        />
      </>
    )
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 300)

  public render() {
    let columns
    const {
      feeGenerateStore: { pagedBatchResult }
    } = this.props

    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            placeholder={L('GEN_FEE_BATCH_DETAI_PLACEHOLDER')}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>

        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('GEN_FEE_BATCH_DETAI_GEN_STATUS')}</label>
          <Select
            showSearch
            showArrow
            allowClear
            filterOption={false}
            onChange={(value) => this.handleSearch('IsAvailable', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(feeAvailableStatus)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('GEN_FEE_BATCH_DETAI_FEE_STATUS')}</label>
          <Select
            allowClear
            showArrow
            onChange={(value) => this.handleSearch('isActive', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_COMPANY')}</label>
          <Select
            mode="multiple"
            placeholder={this.L('FILTER_COMPANY')}
            style={{ width: '100%' }}
            filterOption={filterOptions}
            onChange={(value) => this.handleSearch('companyIds', value)}>
            {this.renderOptions(this.state.listCompany)}
          </Select>
        </Col>
      </Row>
    )

    if (this.props.dataSend.targetSource === targetSourceKeys.import) {
      columns = columnsFeeImport({
        title: L('GEN_FEE_UNIT'),
        dataIndex: 'fullUnitCode',
        key: 'fullUnitCode',
        width: '13%',
        render: (fullUnitCode, item: any) => (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 18, offset: 0 }} className="col-info">
              <div className="full-name text-truncate text-link-to-detail">
                <a className="link-text-table"> {fullUnitCode ?? '--'}</a>
              </div>
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.feeGenerate.delete) && item.isActive === true && (
                      <Menu.Item key={2} onClick={() => this.activateOrDeactivate(item.id)}>
                        {L('BTN_DEACTIVATE_GEN_FEE')}
                      </Menu.Item>
                    )}
                  </Menu>
                }
                placement="bottomLeft">
                <EllipsisOutlined className="button-action-hiden-table-cell" />
              </Dropdown>
            </Col>
          </Row>
        )
      })
    } else {
      switch (this.props.dataSend.feeTypeId) {
        case generateType.management:
          columns = columnsFeeManagement({
            title: L('GEN_FEE_CODE_CONTRACT'),
            dataIndex: 'leaseAgreement',
            key: 'leaseAgreement',
            width: '13%',
            render: (leaseAgreement, item: any) => (
              <Row style={{ justifyContent: 'space-between' }}>
                <Col sm={{ span: 18, offset: 0 }} className="col-info">
                  <div className="full-name text-truncate text-link-to-detail">
                    <a className="link-text-table"> {leaseAgreement?.contractId ?? '--'}</a>
                  </div>
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <Dropdown
                    trigger={['click']}
                    overlay={
                      <Menu>
                        {this.isGranted(appPermissions.feeGenerate.delete) && item.isActive === true && (
                          <Menu.Item key={2} onClick={() => this.activateOrDeactivate(item.id)}>
                            {L('BTN_DEACTIVATE_GEN_FEE')}
                          </Menu.Item>
                        )}
                      </Menu>
                    }
                    placement="bottomLeft">
                    <EllipsisOutlined className="button-action-hiden-table-cell" />
                  </Dropdown>
                </Col>
              </Row>
            )
          })
          break
        case generateType.electric:
          columns = columnsFeeElectric({
            title: L('GEN_FEE_COMPANY'),
            dataIndex: 'company',
            key: 'company',
            width: '15%',
            render: (company, item: any) => (
              <Row style={{ justifyContent: 'space-between' }}>
                <Col sm={{ span: 18, offset: 0 }} className="col-info">
                  <div className="full-name text-truncate text-link-to-detail">
                    <a className="link-text-table"> {company?.companyName ?? '--'}</a>
                  </div>
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <Dropdown
                    trigger={['click']}
                    overlay={
                      <Menu>
                        {this.isGranted(appPermissions.feeGenerate.delete) && item.isActive === true && (
                          <Menu.Item key={2} onClick={() => this.activateOrDeactivate(item.id)}>
                            {L('BTN_DEACTIVATE_GEN_FEE')}
                          </Menu.Item>
                        )}
                      </Menu>
                    }
                    placement="bottomLeft">
                    <EllipsisOutlined className="button-action-hiden-table-cell" />
                  </Dropdown>
                </Col>
              </Row>
            )
          })

          break
        case generateType.water:
          columns = columnsFeeWater({
            title: L('GEN_FEE_UNIT'),
            dataIndex: 'fullUnitCode',
            key: 'fullUnitCode',
            width: '14%',
            render: (fullUnitCode, item: any) => (
              <Row style={{ justifyContent: 'space-between' }}>
                <Col sm={{ span: 18, offset: 0 }} className="col-info">
                  <div className="full-name text-truncate text-link-to-detail">
                    <a className="link-text-table"> {fullUnitCode ?? '--'}</a>
                  </div>
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <Dropdown
                    trigger={['click']}
                    overlay={
                      <Menu>
                        {this.isGranted(appPermissions.feeGenerate.delete) && item.isActive === true && (
                          <Menu.Item key={2} onClick={() => this.activateOrDeactivate(item.id)}>
                            {L('BTN_DEACTIVATE_GEN_FEE')}
                          </Menu.Item>
                        )}
                      </Menu>
                    }
                    placement="bottomLeft">
                    <EllipsisOutlined className="button-action-hiden-table-cell" />
                  </Dropdown>
                </Col>
              </Row>
            )
          })

          break
        case generateType.rent:
          columns = columnsFeeRent({
            title: L('GEN_FEE_CODE_CONTRACT'),
            dataIndex: 'leaseAgreement',
            key: 'leaseAgreement',
            width: '14%',
            render: (leaseAgreement, item: any) => (
              <Row style={{ justifyContent: 'space-between' }}>
                <Col sm={{ span: 18, offset: 0 }} className="col-info">
                  <div className="full-name text-truncate text-link-to-detail">
                    <a className="link-text-table"> {leaseAgreement?.contractId ?? '--'}</a>
                  </div>
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <Dropdown
                    trigger={['click']}
                    overlay={
                      <Menu>
                        {this.isGranted(appPermissions.feeGenerate.delete) && item.isActive === true && (
                          <Menu.Item key={2} onClick={() => this.activateOrDeactivate(item.id)}>
                            {L('BTN_DEACTIVATE_GEN_FEE')}
                          </Menu.Item>
                        )}
                      </Menu>
                    }
                    placement="bottomLeft">
                    <EllipsisOutlined className="button-action-hiden-table-cell" />
                  </Dropdown>
                </Col>
              </Row>
            )
          })

          break
        case generateType.MotobikeParking12Hours:
        case generateType.MotobikeParking24Hours:
        case generateType.CarParking12Hours:
        case generateType.CarParking24Hours:
          columns = columnMotobikeParking12Hours({
            title: L('GEN_FEE_COMPANY'),
            dataIndex: 'company',
            key: 'company',
            width: '14%',
            render: (company, item: any) => (
              <Row style={{ justifyContent: 'space-between' }}>
                <Col sm={{ span: 18, offset: 0 }} className="col-info">
                  <div className="full-name text-truncate text-link-to-detail">
                    <a className="link-text-table"> {company?.companyName ?? '--'}</a>
                  </div>
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <Dropdown
                    trigger={['click']}
                    overlay={
                      <Menu>
                        {this.isGranted(appPermissions.feeGenerate.delete) && item.isActive === true && (
                          <Menu.Item key={2} onClick={() => this.activateOrDeactivate(item.id)}>
                            {L('BTN_DEACTIVATE_GEN_FEE')}
                          </Menu.Item>
                        )}
                      </Menu>
                    }
                    placement="bottomLeft">
                    <EllipsisOutlined className="button-action-hiden-table-cell" />
                  </Dropdown>
                </Col>
              </Row>
            )
          })
          break
        case generateType.OvertimeElectricity:
          columns = columnOverTimeElectric({
            title: L('GEN_FEE_COMPANY'),
            dataIndex: 'company',
            key: 'company',
            width: '13%',
            render: (company, item: any) => (
              <Row style={{ justifyContent: 'space-between' }}>
                <Col sm={{ span: 18, offset: 0 }} className="col-info">
                  <div className="full-name text-truncate text-link-to-detail">
                    <a className="link-text-table"> {company?.companyName ?? '--'}</a>
                  </div>
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <Dropdown
                    trigger={['click']}
                    overlay={
                      <Menu>
                        {this.isGranted(appPermissions.feeGenerate.delete) && item.isActive === true && (
                          <Menu.Item key={2} onClick={() => this.activateOrDeactivate(item.id)}>
                            {L('BTN_DEACTIVATE_GEN_FEE')}
                          </Menu.Item>
                        )}
                      </Menu>
                    }
                    placement="bottomLeft">
                    <EllipsisOutlined className="button-action-hiden-table-cell" />
                  </Dropdown>
                </Col>
              </Row>
            )
          })
          break
        default:
          columns = columnParking({
            title: L('GEN_FEE_UNIT'),
            dataIndex: 'fullUnitCode',
            key: 'fullUnitCode',
            width: '15%',
            render: (fullUnitCode, item: any) => (
              <Row style={{ justifyContent: 'space-between' }}>
                <Col sm={{ span: 18, offset: 0 }} className="col-info">
                  <div className="full-name text-truncate text-link-to-detail">
                    <a className="link-text-table"> {fullUnitCode ?? '--'}</a>
                  </div>
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <Dropdown
                    trigger={['click']}
                    overlay={
                      <Menu>
                        {this.isGranted(appPermissions.feeGenerate.delete) && item.isActive === true && (
                          <Menu.Item key={2} onClick={() => this.activateOrDeactivate(item.id)}>
                            {L('BTN_DEACTIVATE_GEN_FEE')}
                          </Menu.Item>
                        )}
                      </Menu>
                    }
                    placement="bottomLeft">
                    <EllipsisOutlined className="button-action-hiden-table-cell" />
                  </Dropdown>
                </Col>
              </Row>
            )
          })

          break
      }
    }

    return (
      <CustomDrawer
        fullWidth
        useBottomAction
        titlePro={
          <>
            <span style={{ fontWeight: 600 }}>
              {this.props.dataSend.title}
              <span className="ml-2">
                {statusGenerateFee.map(
                  (item) =>
                    item.value === this.props.dataSend?.statusId && (
                      <Tag
                        className="cell-round mr-0"
                        style={{ color: item.color, backgroundColor: item.backgroundColor, border: 'none' }}>
                        {item.label}
                      </Tag>
                    )
                )}
              </span>
            </span>
          </>
        }
        visible={this.props.visible}
        onClose={() => {
          this.props.onCancel()
          this.setState({ skipCount: 0 })
        }}
        extraBottomContent={
          <Row gutter={[4, 4]}>
            <Col span={8}>
              <Statistic
                valueStyle={{ fontSize: 12, fontWeight: 600 }}
                title={L('GEN_BATCH_AVALIABLE_TOTAL')}
                value={formatNumber(this.props.feeGenerateStore.feeGenOverview?.totalCountAvailable)}
                suffix={L('/') + formatNumber(this.props.feeGenerateStore.feeGenOverview?.totalUnitFee)}
              />
            </Col>

            <Col span={8}>
              <Statistic
                valueStyle={{ fontSize: 12, fontWeight: 600 }}
                title={L('GEN_BATCH_TOTAL_DEBT')}
                value={formatNumber(this.props.feeGenerateStore.feeGenOverview?.totalUnitFee)}
              />
            </Col>
          </Row>
        }>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('GEN_FEE_LIST')}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedBatchResult === undefined ? 0 : pagedBatchResult.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.feeGenerate.create}
          actionGroups={this.renderActionGroups}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            columns={columns}
            loading={this.props.feeGenerateStore.isLoading}
            rowKey={(record) => record.id}
            scroll={{ x: 1000, y: 800, scrollToFirstRowOnChange: true }}
            pagination={false}
            dataSource={pagedBatchResult.items || []}
          />
        </DataTable>

        <ExportFeeModal
          id={this.props.dataSend.id}
          generateType={this.props.dataSend.feeTypeId}
          listCompany={this.state.listCompany}
          filters={this.state.filters}
          visible={this.state.toggleModal}
          onCancel={() => this.setState({ toggleModal: !this.state.toggleModal })}
          feeGenerateStore={this.props.feeGenerateStore}
        />
      </CustomDrawer>
    )
  }
}

export default BatchManagementDetail
