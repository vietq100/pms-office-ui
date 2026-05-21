import { isGranted, L } from '@lib/abpUtility'
import AmenityStore from '@stores/booking/amenityStore'
import Stores from '@stores/storeIdentifier'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { appPermissions, moduleAvatar } from '@lib/appconst'
import DataTable from '@components/DataTable'
import Table from 'antd/lib/table'
import getColumns from './column'
import FilterMonthlyPackage from './FilterMonthlyPackage'
import { MonthlyPackageDetailModal } from './MonthlyPackageDetailModal'
import Modal from 'antd/lib/modal'
import amenityService from '@services/booking/amenityService'
import { convertFilterDate, getFirstLetterAndUpperCase } from '@lib/helper'
import { Avatar, Col, Dropdown, Menu, Row } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'

const { confirm } = Modal
const { colorByLetter } = moduleAvatar

type Props = {
  amenityStore: AmenityStore
}

const MonthlyPackage = inject(Stores.AmenityStore)(
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
      } else {
        const newFilter = { ...filter, [name]: value }
        setFilter(newFilter)
      }
    }
    isGranted(appPermissions.amenityMonthlyPackage.page) &&
      React.useEffect(() => {
        props.amenityStore.getAllMonthlyPackageList(filter)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [filter])
    const gotoDetail = async (id?) => {
      if (id) {
        await props.amenityStore.getMonthlyPackageDetail(id)
      } else {
        props.amenityStore.monthlyPackageDetail = undefined
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
    const column = getColumns({
      title: L('RESIDENT'),
      dataIndex: 'displayName',
      key: 'displayName',
      ellipsis: true,
      width: '20%',
      render: (text: string, item: any) => {
        return (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 20, offset: 0 }} className="col-info">
              <div className="table-cell-profile">
                <div>
                  <Avatar
                    src={item.profilePictureUrl}
                    style={{
                      background: colorByLetter(getFirstLetterAndUpperCase(text || 'G'))
                    }}>
                    {getFirstLetterAndUpperCase(text || 'G')}
                  </Avatar>
                </div>
                <div className="info ml-2">
                  <div
                    className="full-name text-truncate text-link-to-detail"
                    onClick={() => isGranted(appPermissions.amenityMonthlyPackage.detail) && gotoDetail(item.id)}>
                    <a className="link-text-table"> {item.user?.displayName}</a>
                  </div>

                  <div className="phone text-truncate text-muted">{item.user?.emailAddress}</div>
                </div>
              </div>
            </Col>
            <Col sm={{ span: 3, offset: 0 }}>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {isGranted(appPermissions.amenityMonthlyPackage.delete) && (
                      <Menu.Item onClick={() => changeActiveStatus(item.id, item.isActive)}>
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
      }
    })
    const changeActiveStatus = async (id, currentStatus) => {
      confirm({
        title: L('ARE_YOU_SURE'),
        content: L('ARE_YOU_SURE_DESCRIPTION'),
        async onOk() {
          await amenityService.changeActiveStatusMonthlyPackage(id, currentStatus)
          setFilter({ ...filter })
        }
      })
    }
    const [modalVisible, setModalVisible] = React.useState(false)
    const filterComponent = <FilterMonthlyPackage handleSearch={handleSearch} amenityStore={props.amenityStore} />
    return isGranted(appPermissions.amenityMonthlyPackage.page) ? (
      <>
        <DataTable
          onRefresh={() => handleSearch('', '')}
          extraFilterComponent={filterComponent}
          title={L('MONTHLY_PACKAGE_LIST')}
          onCreate={() => gotoDetail(null)}
          pagination={{
            pageSize: filter.maxResultCount,
            current: currentPage(),
            total: props.amenityStore.monthlyPackageList.totalCount ?? 0,
            onChange: handleTableChange
          }}
          createPermission={appPermissions.amenityMonthlyPackage.create}>
          <Table
            size="middle"
            scroll={{ x: 1000, y: 500 }}
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={column}
            pagination={false}
            loading={props.amenityStore.isLoading}
            dataSource={props.amenityStore.monthlyPackageList.items ?? []}
          />
        </DataTable>
        <MonthlyPackageDetailModal
          dataDetail={props.amenityStore?.monthlyPackageDetail}
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

export default MonthlyPackage
