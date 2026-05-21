import * as React from 'react'

import { Button, Col, Dropdown, Input, Menu, Modal, Row, Select, Table } from 'antd'
import { EllipsisOutlined, SortAscendingOutlined } from '@ant-design/icons'
import { inject, observer } from 'mobx-react'

import { AppComponentListBase } from '../../../components/AppComponentBase'
import WfTrackerFormModal from './components/wfTrackerFormModal'
import { L, LNotification } from '../../../lib/abpUtility'
import Stores from '../../../stores/storeIdentifier'
import WfTrackerStore from '../../../stores/workflow/wfTrackerStore'
import DataTable from '../../../components/DataTable'
import Filter from '../../../components/Filter'
import AppConsts, { appPermissions } from '../../../lib/appconst'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import SortList from '@components/SortDrawer'

const { activeStatus } = AppConsts

export interface IWfTrackerProps {
  wfTrackerStore: WfTrackerStore
  moduleId?: number
}

export interface IWfTrackerState {
  modalVisible: boolean
  maxResultCount: number
  skipCount: number
  wfTrackerId: number
  filters: any
  showSort: boolean
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.WfTrackerStore)
@observer
class WfTracker extends AppComponentListBase<IWfTrackerProps, IWfTrackerState> {
  formRef: any = React.createRef()

  state = {
    modalVisible: false,
    maxResultCount: 10,
    skipCount: 0,
    wfTrackerId: 0,
    filters: { isActive: 'true' },
    showSort: false
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    await this.getAll()
  }

  async getAll() {
    await this.props.wfTrackerStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      moduleId: this.props.moduleId,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  Modal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }
  openOrCloseDrawer = () => {
    const showSort = !this.state.showSort
    this.setState({ showSort }, async () => {
      if (showSort) {
        await this.props.wfTrackerStore.getAll({
          maxResultCount: this.state.maxResultCount,
          skipCount: this.state.skipCount,
          moduleId: this.props.moduleId,
          ...this.state.filters
        })
      }
    })
  }

  updateOrder = async (ids) => {
    const { wfTrackerStore } = this.props
    return await wfTrackerStore.updateSortList(ids)
  }
  createOrUpdateModalOpen = async (id?) => {
    if (!id) {
      await this.props.wfTrackerStore.createWfTracker()
    } else {
      await this.props.wfTrackerStore.get(id)
    }

    this.setState({ wfTrackerId: id })
    this.Modal()

    this.formRef.current.setFieldsValue({
      ...this.props.wfTrackerStore.editWfTracker
    })
  }

  delete(id, isActive) {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.wfTrackerStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  handleCreate = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.moduleId) {
        values.moduleIds = [this.props.moduleId]
      }
      if (!this.props.wfTrackerStore.editWfTracker?.id) {
        await this.props.wfTrackerStore.create(values)
      } else {
        await this.props.wfTrackerStore.update({
          id: this.props.wfTrackerStore.editWfTracker?.id,
          ...values
        })
      }

      await this.getAll()
      this.setState({ modalVisible: false })
      form.resetFields()
    })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = (name, value) => {
    this.setState({ filters: { ...this.state.filters, [name]: value }, skipCount: 0 }, async () => await this.getAll())
  }
  renderActionGroups = () => {
    return (
      <span>
        <Button
          shape="circle"
          type="primary"
          className="mr-1"
          onClick={this.openOrCloseDrawer}
          icon={<SortAscendingOutlined />}
        />
      </span>
    )
  }
  public render() {
    const { wfTracker } = this.props.wfTrackerStore
    const { filters } = this.state
    let columns = getColumns({
      title: L('WF_TRACKER_NAME'),
      width: '15%',
      dataIndex: 'name',
      render: (name: string, item: any) => (
        <Row>
          <Col sm={{ span: 21, offset: 0 }}>
            <a
              onClick={
                this.isGranted(appPermissions.workflow.update) ? () => this.createOrUpdateModalOpen(item.id) : undefined
              }
              className="link-text-table">
              {name}
            </a>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.workflow.delete) && (
                    <Menu.Item onClick={() => this.delete(item.id, !item.isActive)}>
                      {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
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

    if (this.props.moduleId) {
      columns = columns.filter((item) => item.key !== 'modules')
    }

    return (
      <>
        <Filter title={this.L('FILTER')}>
          <Row gutter={[16, 8]}>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_KEYWORD')}</label>
              <Search
                maxLength={200}
                placeholder={this.L('WF_TRACKER_NAME')}
                onChange={(value) => this.updateSearch('keyword', value.target?.value)}
                onSearch={(value) => this.handleSearch('keyword', value)}
              />
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
              <Select
                value={filters.isActive}
                onChange={(value) => this.handleSearch('isActive', value)}
                style={{ width: '100%' }}>
                {this.renderOptions(activeStatus)}
              </Select>
            </Col>
          </Row>
        </Filter>
        <DataTable
          title={this.L('WF_TRACKER_LIST')}
          onCreate={() => this.createOrUpdateModalOpen()}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: wfTracker === undefined ? 0 : wfTracker.totalCount,
            onChange: this.handleTableChange
          }}
          actionGroups={this.renderActionGroups}
          createPermission={appPermissions.workflow.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id.toString()}
            columns={columns}
            pagination={false}
            loading={this.props.wfTrackerStore.isLoading}
            dataSource={wfTracker === undefined ? [] : wfTracker.items}
          />
        </DataTable>
        <WfTrackerFormModal
          formRef={this.formRef}
          visible={this.state.modalVisible}
          onCancel={() =>
            this.setState({
              modalVisible: false
            })
          }
          modalType={this.state.wfTrackerId === 0 ? 'EDIT' : 'CREATE'}
          onCreate={this.handleCreate}
          isLoading={this.props.wfTrackerStore.isLoading}
          moduleId={this.props.moduleId}
        />

        <SortList
          visible={this.state.showSort}
          setVisibleDrawer={this.openOrCloseDrawer}
          data={this.props.wfTrackerStore.wfTracker?.items}
          handleSave={this.updateOrder}
        />
      </>
    )
  }
}

export default WfTracker
