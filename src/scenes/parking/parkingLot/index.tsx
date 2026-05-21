import { EllipsisOutlined } from '@ant-design/icons'
import { AppComponentListBase } from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import withRouter from '@components/Layout/Router/withRouter'
import { L, LNotification } from '@lib/abpUtility'
import ParkingStore from '@stores/parking/parkingStore'
import Stores from '@stores/storeIdentifier'
import { Card, Col, Dropdown, Menu, Modal, Row, Table } from 'antd'
import { inject, observer } from 'mobx-react'
import React from 'react'
import getParkingLotColumns from './columns'
import { PakingLotModal } from './components/pakingLotModal'
import { appPermissions } from '@lib/appconst'

export interface IParkingProps {
  navigate: any
  params: any
  parkingStore: ParkingStore
}
export interface IparkingState {
  currentPage: number
  maxResultCount: number
  skipCount: number
  filters: any
  modalVisible: boolean
  selectedItem: any
}
@inject(Stores.ParkingStore)
@observer
class ParkingLotManagement extends AppComponentListBase<IParkingProps, IparkingState> {
  formRef: any = React.createRef()
  constructor(props) {
    super(props)
    this.state = {
      currentPage: 1,
      maxResultCount: 10,
      skipCount: 0,
      selectedItem: {},
      modalVisible: false,
      filters: {
        keyword: ''
      }
    }
  }
  async componentDidMount() {
    await this.getAll()
  }

  getAll = async () => {
    await this.props.parkingStore.getAllParking({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }
  goDetail = async (id?) => {
    if (!id) {
      {
        await this.props.parkingStore.addParkingLot()
      }
    } else {
      {
        await this.props.parkingStore.getParking(id)
      }
    }
    this.Modal()
  }
  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }
  activateOrDeactivate = (id, isActive: boolean) => {
    Modal.confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: this.L('BTN_YES'),
      cancelText: this.L('BTN_NO'),
      onOk: async () => {
        await this.props.parkingStore.activateOrDeactivateParkingLot(id, isActive)
        await this.handleTableChange({ current: 1 })
      }
    })
  }

  Modal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }
  onCreateOrUpdate = async (formValues) => {
    if (!this.props.parkingStore.editParkingLot?.id) {
      {
        this.isGranted(appPermissions.parking.create) && (await this.props.parkingStore.createParking(formValues))
      }
    } else {
      {
        this.isGranted(appPermissions.parking.update) &&
          (await this.props.parkingStore.updateParking({
            ...this.props.parkingStore.editParkingLot,
            ...formValues
          }))
      }
    }

    await this.getAll()
    this.setState({ modalVisible: false })
  }

  public render() {
    const {
      parkingStore: { parkingLot }
    } = this.props

    const columns = getParkingLotColumns({
      title: L('NAME'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '15%',
      render: (name: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={() => {
                this.isGranted(appPermissions.parking.detail) && this.goDetail(item?.id)
              }}>
              <a className="link-text-table ml-1"> {name}</a>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.parking.delete) && (
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

    return (
      <>
        <DataTable
          onRefresh={this.getAll}
          title={this.L('PARKING_LIST')}
          onCreate={() => {
            this.goDetail()
          }}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.state.currentPage,
            total: parkingLot === undefined ? 0 : parkingLot.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.parking.create}>
          <Card bordered={false} style={{ minHeight: 500 }}>
            <Table
              size="middle"
              className="custom-ant-table custom-ant-row"
              rowKey={(record) => record.id}
              columns={columns}
              pagination={false}
              loading={this.props.parkingStore.isLoading}
              dataSource={parkingLot === undefined ? [] : parkingLot.items}
              scroll={{ x: 1000, y: 450, scrollToFirstRowOnChange: true }}
            />
          </Card>
        </DataTable>
        <PakingLotModal
          data={this.props.parkingStore}
          visible={this.state.modalVisible}
          onCreate={this.onCreateOrUpdate}
          onCancel={() => {
            this.setState({
              modalVisible: false
            })
          }}
          id={this.props.parkingStore.editParkingLot?.id}
        />
      </>
    )
  }
}

export default withRouter(ParkingLotManagement)
