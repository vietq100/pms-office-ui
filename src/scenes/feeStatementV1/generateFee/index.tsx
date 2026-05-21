import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu, Button } from 'antd'

import { AppComponentListBase } from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { L, LNotification, isGrantedAny } from '@lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst, { appPermissions } from '@lib/appconst'
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons/lib'
import getColumns from './columns'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'
import BatchManagementDetail from './components/BatchManagementDetail'
import GenFeeCreateModal from './components/GenFeeCreateModal'

import FeeImportModal from '../fee-import/components/FeeImportModal'
import FeeGenerateStore from '@stores/fee/feeGenerateStore'
import FeeStore from '@stores/fee/feeStore'
import packageFeeService from '@services/fee/packageFeeService'
import feeTypeService from '@services/fee/feeTypeService'
import NoRole from '@components/ComponentNoRole'
import ViewFeeGenModal from './components/ViewFeeGenModal'
import ConfirmPopup from '@components/Modals/ConfirmPopup'
import { filterOptions } from '@lib/helper'

const { targetSource, statusGenerateFee, pageSize, statusGenFeeKeys } = AppConst
export interface IFeeGenerateProps {
  navigate: any
  feeGenerateStore: FeeGenerateStore
  feeStore: FeeStore
}

export interface IFeeGenerateState {
  maxResultCount: number
  skipCount: number
  visibleBatch: boolean
  filters: any
  showPopupCreate: boolean
  visibleModelExport: boolean
  createFeeModalVisible: boolean
  packages: any
  listFeeTypeGen: any
  visibleView: boolean
  dataSend: any
  dataView: any
  visiblePopupConfirm: any
  idNeedConfirm: any
}

const Search = Input.Search

@inject(Stores.FeeGenerateStore, Stores.FeeStore)
@observer
class FeeGenerate extends AppComponentListBase<IFeeGenerateProps, IFeeGenerateState> {
  state = {
    maxResultCount: pageSize.pageSize_20,
    skipCount: 0,
    visibleBatch: false,
    idBatch: undefined,
    title: '',
    filters: {
      isActive: 'true'
    },
    packages: [],
    listFeeTypeGen: [],
    showPopupCreate: false,
    visibleModelExport: false,
    createFeeModalVisible: false,
    targetSource: undefined,
    dataSend: {} as any,
    visibleView: false,
    dataView: {} as any,
    visiblePopupConfirm: false,
    idNeedConfirm: undefined
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.feeGenerate.page) &&
      (await Promise.all([this.getAll(), this.handlePackageSearch(''), this.handleFeeTypeGen()]))
  }

  getAll = async () => {
    await this.props.feeGenerateStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  activateOrDeactivate = async (id: number) => {
    const self = this
    Modal.confirm({
      title: LNotification('DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      content: LNotification('FEESTATEMENT_GENERATE_CONTENT_DEACTIVE_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.feeGenerateStore.deative(id)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  cofirmFeeGenerate = async (id: number) => {
    this.setState({ idNeedConfirm: id })
    this.setState({ visiblePopupConfirm: true })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handlePackageSearch = debounce(async (value) => {
    const packages = await packageFeeService.filter({
      keyword: value
    })
    this.setState({ packages })
  }, 300)

  handleFeeTypeGen = async () => {
    const listFeeTypeGen = await feeTypeService.GetListFeeTypeGen({ isActive: true })
    this.setState({ listFeeTypeGen })
  }

  handleSearch = (name, value) => {
    const { filters } = this.state

    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      await this.getAll()
    })
  }

  gotoDetail = (item) => {
    if (item) {
      this.setState({ visibleBatch: true })
      this.setState({
        dataSend: {
          id: item.id,
          title: item.description,
          targetSource: item.targetSource,
          feeTypeId: item.feeGenerateConfiguration?.generateType,
          statusId: item?.statusId
        }
      })
    } else {
      this.setState({ visibleBatch: true })
    }
  }
  handleImportFee = async (file, packageId, description) => {
    await this.props.feeStore?.importFee(file, packageId, description)
    await this.getAll()
    this.toggleModal()
  }
  toggleModal = () =>
    this.setState((prevState) => ({
      visibleModelExport: !prevState.visibleModelExport
    }))

  toggleViewModal = (record) => {
    this.setState({ dataView: record })
    this.setState((prevState) => ({
      visibleView: !prevState.visibleView
    }))
  }

  handleConfirm = async (isAllowConfirm) => {
    const self = this
    if (isAllowConfirm) {
      await this.props.feeGenerateStore.cofirm(this.state.idNeedConfirm)
      this.setState({ visiblePopupConfirm: false, idNeedConfirm: undefined })
      self.handleTableChange({ current: 1 })
    }
  }

  public renderActions = () => {
    return (
      <span>
        {this.isGranted(appPermissions.feeGenerate.create) && (
          <React.Fragment>
            <Button type="primary" shape="round" onClick={this.toggleModal} className="mr-1">
              <PlusOutlined />
              {this.L('BTN_IMPORT')}
            </Button>
          </React.Fragment>
        )}
      </span>
    )
  }
  public render() {
    const {
      feeGenerateStore: { pagedResult }
    } = this.props

    const columns = getColumns({
      title: L('Id'),
      dataIndex: 'id',
      key: 'id',
      width: '6%',
      ellipsis: true,
      render: (id: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 19, offset: 0 }} className="col-info">
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={() => this.isGranted(appPermissions.feeGenerate.detail) && this.gotoDetail(item)}>
              <a className="link-text-table"> {id}</a>
            </div>
          </Col>
          <Col sm={{ span: 5, offset: 0 }}>
            {isGrantedAny(
              appPermissions.feeGenerate.update,
              appPermissions.feeGenerate.delete,
              appPermissions.feeGenerate.confirm
            ) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {isGrantedAny(appPermissions.feeGenerate.create, appPermissions.feeGenerate.update) && (
                      <Menu.Item key={1} onClick={() => this.toggleViewModal(item)}>
                        {L('BTN_VIEW_FEE_GEN')}
                      </Menu.Item>
                    )}
                    {this.isGranted(appPermissions.feeGenerate.delete) && item.isActive === true && (
                      <Menu.Item key={3} onClick={() => this.activateOrDeactivate(item.id)}>
                        {L('BTN_DEACTIVATE_GEN_FEE')}
                      </Menu.Item>
                    )}
                    {this.isGranted(appPermissions.feeGenerate.confirm) &&
                      item.statusId === statusGenFeeKeys.readyForConfirm &&
                      item.isActive === true && (
                        <Menu.Item key={4} onClick={() => this.cofirmFeeGenerate(item.id)}>
                          {L('GEN_FEE_CONFIRM')}
                        </Menu.Item>
                      )}
                  </Menu>
                }
                placement="bottomLeft">
                <EllipsisOutlined className="button-action-hiden-table-cell" />
              </Dropdown>
            )}
          </Col>
        </Row>
      )
    })
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>

        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FEE_GENERATE__PACKAGE')}</label>
          <Select
            showSearch
            showArrow
            allowClear
            filterOption={false}
            onChange={(value) => this.handleSearch('feePackageId', value)}
            style={{ width: '100%' }}
            onSearch={this.handlePackageSearch}>
            {this.renderOptions(this.state.packages)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FEE_GENERATE_TARGET_SOURCE')}</label>
          <Select
            allowClear
            showArrow
            onChange={(value) => this.handleSearch('TargetSource', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(targetSource)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FEE_GENERATE_FEE_TYPE')}</label>
          <Select
            allowClear
            showArrow
            showSearch
            filterOption={filterOptions}
            onChange={(value) => this.handleSearch('FeeTypeId', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(this.state.listFeeTypeGen)}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FEE_GENERATE_STATUS')}</label>
          <Select
            allowClear
            showArrow
            showSearch
            filterOption={filterOptions}
            onChange={(value) => this.handleSearch('StatusId', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(statusGenerateFee)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.feeGenerate.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          actionGroups={this.renderActions}
          onRefresh={this.getAll}
          title={this.L('GEN_FEE_LIST')}
          onCreate={() => this.isGranted(appPermissions.feeGenerate.create) && this.setState({ showPopupCreate: true })}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: pagedResult === undefined ? 0 : pagedResult.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.feeGenerate.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            columns={columns}
            rowKey={(record) => record.id}
            scroll={{ x: 1000, y: 800, scrollToFirstRowOnChange: true }}
            pagination={false}
            loading={this.props.feeGenerateStore.isLoading}
            dataSource={pagedResult.items || []}
          />
        </DataTable>

        <BatchManagementDetail
          dataSend={this.state.dataSend}
          visible={this.state.visibleBatch}
          feeGenerateStore={this.props.feeGenerateStore}
          onCancel={() => {
            this.setState({ visibleBatch: false }), this.getAll()
          }}
        />

        <GenFeeCreateModal
          visible={this.state.showPopupCreate}
          onCancel={() => {
            this.setState({ showPopupCreate: false }), this.getAll()
          }}
          feeGenerateStore={this.props.feeGenerateStore}
          feeStore={this.props.feeStore}
        />

        <FeeImportModal
          visible={this.state.visibleModelExport}
          onOk={this.handleImportFee}
          onClose={this.toggleModal}
          feeStore={this.props.feeStore}
        />

        <ViewFeeGenModal
          visible={this.state.visibleView}
          onCancel={() => this.toggleViewModal(undefined)}
          dataView={this.state.dataView}
        />
        <ConfirmPopup
          title="DO_YOU_WANT_TO_CONFIRM_THIS_ITEM"
          confirmMessage="FEESTATEMENT_GENERATE_CONFIRM_ITEM_TO_DO"
          hintConfirm="PLEASE_INPUT_CONFIRM"
          onCancel={() => this.setState({ visiblePopupConfirm: false })}
          onOk={(value) => this.handleConfirm(value)}
          idNeedConfirm={this.state.idNeedConfirm}
          visible={this.state.visiblePopupConfirm}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(FeeGenerate)
