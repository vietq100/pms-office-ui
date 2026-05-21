import * as React from 'react'
import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu, Button } from 'antd'
import { AppComponentListBase } from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { L, LNotification } from '@lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConst, { appPermissions } from '@lib/appconst'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons/lib'
import getColumns from './columns'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'
import UnitStore from '@stores/project/unitStore'
import AppConsts from '@lib/appconst'
import CardbuidingStore from '@stores/cardBuilding/cardbuidingStore'
import CardImportModal from './components/CardImportModal'

const { pageSize } = AppConsts
export interface IProps {
  navigate: any
  unitStore: UnitStore
  cardbuidingStore: CardbuidingStore
}

export interface IState {
  maxResultCount: number
  skipCount: number
  filters: any
  visibleModelExport: boolean
}

const confirm = Modal.confirm
const Search = Input.Search
const { activeStatus } = AppConst

@inject(Stores.CardbuidingStore, Stores.UnitStore)
@observer
class BuildingCardManagement extends AppComponentListBase<IProps, IState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: pageSize.pageSize_10,
    skipCount: 0,
    filters: {
      isActive: 'true'
    },
    visibleModelExport: false
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await Promise.all([this.getAll()])
  }

  getAll = async () => {
    await this.props.cardbuidingStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.cardbuidingStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = (name, value) => {
    const { filters } = this.state

    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      await this.getAll()
    })
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.buildingCardManagementDetail.path.replace(':id', id))
      : navigate(portalLayouts.buildingCardManagementCreate.path)
  }

  handleImportCard = async (file) => {
    await this.props.cardbuidingStore?.importCard(file)
    await this.getAll()
    this.toggleModal()
  }

  toggleModal = () =>
    this.setState((prevState) => ({
      visibleModelExport: !prevState.visibleModelExport
    }))

  renderAction = () => {
    return (
      <span>
        {/* {this.isGranted(appPermissions.cardBuilding.import) && ( */}
        <Button type="primary" shape="round" onClick={this.toggleModal} className="mr-1">
          <PlusOutlined />
          {L('BTN_IMPORT')}
        </Button>
        {/* )} */}
      </span>
    )
  }

  public render() {
    const {
      cardbuidingStore: { cardBuildings, isLoading }
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('BUILD_CARD_CODE'),
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      ellipsis: true,
      width: 170,
      render: (serialNumber, item: any) => (
        <Row>
          <Col sm={{ span: 21, offset: 0 }}>
            <a onClick={() => this.gotoDetail(item.id)} className="link-text-table">
              {serialNumber}
            </a>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.cardBuilding.delete) && (
                    <Menu.Item onClick={() => this.activateOrDeactivate(item.id, !item.isActive)}>
                      {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
                    </Menu.Item>
                  )}
                </Menu>
              }
              placement="bottomLeft">
              <button className="button-action-hiden-table-cell">
                <EllipsisOutlined />
              </button>
            </Dropdown>
          </Col>
        </Row>
      )
    })
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            placeholder={L('PLACEHOLDER_BUILDING_CARD')}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>

        <Col sm={{ span: 4, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            value={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          actionGroups={this.renderAction}
          onRefresh={this.getAll}
          title={this.L('DELIVERY_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: cardBuildings === undefined ? 0 : cardBuildings.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.cardBuilding.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            columns={columns}
            scroll={{ x: 1000, y: 550, scrollToFirstRowOnChange: true }}
            pagination={false}
            loading={isLoading}
            dataSource={cardBuildings === undefined ? [] : cardBuildings.items}
          />
        </DataTable>
        <CardImportModal
          visible={this.state.visibleModelExport}
          onOk={this.handleImportCard}
          onClose={this.toggleModal}
          cardbuidingStore={this.props.cardbuidingStore}
        />
      </>
    )
  }
}

export default withRouter(BuildingCardManagement)
