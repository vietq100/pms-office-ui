import { isGranted, isGrantedAny, L, LNotification } from '@lib/abpUtility'
import AmenityStore from '@stores/booking/amenityStore'
import Stores from '@stores/storeIdentifier'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { appPermissions } from '@lib/appconst'
import DataTable from '@components/DataTable'
import Table from 'antd/lib/table'
import getColumns from './column'
import FilterBlacklist from './FilterBlacklist'
import { BlackListDetailModal } from './BlackListDetailModal'
import { convertFilterDate } from '@lib/helper'
import { Col, Dropdown, Menu, Modal, Row } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'
const confirm = Modal.confirm
type Props = {
  amenityStore: AmenityStore
}

const BlackList = inject(Stores.AmenityStore)(
  observer((props: Props) => {
    const [filter, setFilter] = React.useState<any>({
      maxResultCount: 10,
      skipCount: 0,
      keyword: '',
      isActive: true
    })
    const currentPage = () => Math.floor(filter.skipCount / filter.maxResultCount) + 1
    const handleSearch = async (name, value) => {
      if (name === 'date') {
        setFilter(convertFilterDate(filter, value))
        getAll(convertFilterDate(filter, value))
      } else {
        const newFilter = { ...filter, [name]: value }
        setFilter(newFilter)
        getAll(newFilter)
      }
    }
    isGranted(appPermissions.amenityBlacklist.page) &&
      React.useEffect(() => {
        // props.amenityStore.getAllBlackList(filter)
        // eslint-disable-next-line react-hooks/exhaustive-deps
        getAll(filter)
      }, [])

    const getAll = (filter) => {
      props.amenityStore.getAllBlackList(filter)
    }
    const gotoDetail = async (id?) => {
      if (id) {
        await props.amenityStore.getBlackListDetail(id)
      } else {
        props.amenityStore.blackListDetail = undefined
      }
      setModalVisible(true)
    }
    const handleTableChange = (pagination: any) => {
      const newFilter = {
        ...filter,
        skipCount: (pagination.current - 1) * filter.maxResultCount
      }
      setFilter(newFilter)
    }
    const activateOrDeactivate = async (id: number, isActive) => {
      confirm({
        title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: async () => {
          await props.amenityStore.activateOrDeactivateBlackList({ id, isActive })
          handleTableChange({ current: 1 })
        }
      })
    }
    const column = getColumns({
      title: L('UNIT'),
      dataIndex: 'fullUnitCode',
      key: 'fullUnitCode',
      width: '15%',
      ellipsis: true,
      render: (fullUnitCode: string, item: any) => {
        return (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 21, offset: 0 }} className="col-info">
              <a
                onClick={() => isGranted(appPermissions.amenityBlacklist.detail) && gotoDetail(item.id)}
                className="link-text-table">
                {fullUnitCode}
              </a>
            </Col>
            <Col sm={{ span: 3, offset: 0 }}>
              {isGrantedAny(appPermissions.amenityBlacklist.delete) && (
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu>
                      {isGranted(appPermissions.amenityBlacklist.delete) && (
                        <Menu.Item onClick={() => activateOrDeactivate(item.id, !item.isActive)}>
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
              )}
            </Col>
          </Row>
        )
      }
    })
    const [modalVisible, setModalVisible] = React.useState(false)
    const filterComponent = <FilterBlacklist handleSearch={handleSearch} amenityStore={props.amenityStore} />
    return isGranted(appPermissions.amenityBlacklist.page) ? (
      <>
        <DataTable
          onRefresh={() => handleSearch('', '')}
          extraFilterComponent={filterComponent}
          title={L('BLACK_LIST')}
          onCreate={() => gotoDetail(null)}
          pagination={{
            pageSize: filter.maxResultCount,
            current: currentPage(),
            total: props.amenityStore.blackList.totalCount ?? 0,
            onChange: handleTableChange
          }}
          createPermission={appPermissions.amenityBlacklist.create}>
          <Table
            size="middle"
            scroll={{ x: 1000, y: 500 }}
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={column}
            pagination={false}
            loading={props.amenityStore.isLoading}
            dataSource={props.amenityStore.blackList.items ?? []}
          />
        </DataTable>
        <BlackListDetailModal
          id={props.amenityStore?.blackListDetail?.id}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false)
            setFilter({ ...filter })
          }}
          amenityStore={props.amenityStore}
        />
      </>
    ) : (
      <NoRole />
    )
  })
)

export default BlackList
