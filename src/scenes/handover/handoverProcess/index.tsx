import { EllipsisOutlined } from '@ant-design/icons'

import DataTable from '@components/DataTable'
import OverViewBar from '@components/DataTable/OverViewBar'
import { ExcelIcon } from '@components/Icon'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { isGranted, isGrantedAny, L } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import { convertFilterDate } from '@lib/helper'
import HandoverStore from '@stores/handover/handoverStore'
import Stores from '@stores/storeIdentifier'
import { Col, Dropdown, Menu, Row } from 'antd'
import Button from 'antd/lib/button'
import Table from 'antd/lib/table'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import getColumns from './column'
import FilterHandoverProcess from './FilterHandoverProcess'
import NoRole from '@components/ComponentNoRole'

type Props = {
  handoverStore: HandoverStore
}

const Index = inject(Stores.HandoverStore)(
  observer((props: Props) => {
    const [filter, setFilter] = React.useState({
      maxResultCount: 10,
      skipCount: 0,
      keyword: ''
    })
    isGranted(appPermissions.handoverReservation.page) &&
      React.useEffect(() => {
        props.handoverStore.getRevervationHandoverStatus()
        getAll(filter)
      }, [])

    // isGranted(appPermissions.handoverReservation.page) &&
    //   React.useEffect(() => {
    //     props.handoverStore.getAllReservationHandover(filter)
    //     props.handoverStore.getReservationHandoverOverview(filter)
    //   }, [filter])

    const updateKeyword = (name, value) => {
      const newFilter = { ...filter, [name]: value }
      setFilter(newFilter)
    }
    const getAll = (filter) => {
      props.handoverStore.getAllReservationHandover(filter)
      props.handoverStore.getReservationHandoverOverview(filter)
    }

    const currentPage = () => Math.floor(filter.skipCount / filter.maxResultCount) + 1
    const handleTableChange = (pagination: any) => {
      const newFilter = {
        ...filter,
        skipCount: (pagination.current - 1) * filter.maxResultCount
      }
      setFilter(newFilter)
    }
    const navigate = useNavigate()
    const gotoDetail = (id) => {
      id
        ? navigate(portalLayouts.handoverReservationDetail.path.replace(':id', id))
        : navigate(portalLayouts.handoverReservationCreate.path)
    }
    const handleSearch = async (name, value) => {
      if (name === 'date') {
        setFilter(convertFilterDate(filter, value, 'fromDate', 'toDate'))
        getAll(convertFilterDate(filter, value, 'fromDate', 'toDate'))
      } else if (name === 'reservationDate') {
        setFilter(convertFilterDate(filter, value, 'fromReservationDate', 'toReservationDate'))
        getAll(convertFilterDate(filter, value, 'fromReservationDate', 'toReservationDate'))
      } else {
        const newFilter = { ...filter, [name]: value }
        setFilter(newFilter)
        getAll(newFilter)
      }
    }
    const handleComplete = async (id) => {
      props.handoverStore.handleComplete(id, filter)
    }
    const column = getColumns({
      title: L('UNIT'),
      dataIndex: 'unit',
      key: 'unit',
      ellipsis: true,
      width: '14%',
      render: (unit, item: any) => {
        return (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 20, offset: 0 }} className="col-info">
              <a
                onClick={() => isGranted(appPermissions.handoverReservation.detail) && gotoDetail(item.id)}
                className="link-text-table">
                {unit?.name}
              </a>
            </Col>
            <Col sm={{ span: 4, offset: 0 }}>
              {isGrantedAny(appPermissions.handoverReservation.update) && (
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu>
                      {isGranted(appPermissions.handoverReservation.update) && item.status?.code !== 'COMPLETED' && (
                        <Menu.Item onClick={() => handleComplete(item.id)}>{L('BTN_COMPLETED')}</Menu.Item>
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
    const handleExport = async () => {
      await props.handoverStore.export(filter)
    }
    const renderActionGroup = () => (
      <>
        {isGranted(appPermissions.handoverReservation.export) && (
          <Button shape="circle" type="primary" className="mr-1" onClick={handleExport} icon={<ExcelIcon />} />
        )}
      </>
    )
    const filterComponent = (
      <FilterHandoverProcess
        handleSearch={handleSearch}
        onChange={updateKeyword}
        handoverStore={props.handoverStore}
        filter={filter}
      />
    )
    return isGranted(appPermissions.handoverReservation.page) ? (
      <>
        <OverViewBar
          data={props.handoverStore.reservationHandoverOverview}
          // handleClickItem={() => {}}
        />

        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={() => props.handoverStore.getAllReservationHandover(filter)}
          title={L('HANDOVER_PROCESS_LIST')}
          onCreate={() => gotoDetail(null)}
          actionGroups={renderActionGroup}
          pagination={{
            pageSize: filter.maxResultCount,
            current: currentPage(),
            total: props.handoverStore.reservationHandoverList.totalCount ?? 0,
            onChange: handleTableChange
          }}
          createPermission={appPermissions.handoverReservation.create}>
          <Table
            size="middle"
            scroll={{ x: 1000, y: 500 }}
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={column}
            pagination={false}
            loading={props.handoverStore.isLoading}
            dataSource={props.handoverStore.reservationHandoverList.items ?? []}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  })
)

export default Index
