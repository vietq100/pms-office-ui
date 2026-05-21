import DataTable from '@components/DataTable'
import { isGranted, isGrantedAny, L } from '@lib/abpUtility'
import SaleAndLeaseStore from '@stores/saleAndLease/saleAndLeaseStore'
import Stores from '@stores/storeIdentifier'
import { Button, Col, DatePicker, Dropdown, Menu, Row, Select, Table } from 'antd'
import { inject, observer } from 'mobx-react'
import React from 'react'
import getColumns from './column'
import { appPermissions, dateFormat } from '@lib/appconst'
import { useNavigate } from 'react-router-dom'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { EllipsisOutlined, SettingOutlined } from '@ant-design/icons'
import saleAndLeaseService from '@services/saleAndLease/saleAndLeaseService'
import { convertFilterDate, notifySuccess } from '@lib/helper'
import Search from 'antd/lib/input/Search'
import SaleAndLeaseConfig from '../SaleAndLeaseConfig'
import { bathroomStatus, bedroomStatus } from '../sale/FilterSale'
import OverViewBar from '@components/DataTable/OverViewBar'
import NoRole from '@components/ComponentNoRole'
export const enquiryType = {
  sale: 'Sales',
  lease: 'Leases'
}
type Props = {
  saleAndLeaseStore: SaleAndLeaseStore
}
const LeaseManagement = inject(Stores.SaleAndLeaseStore)(
  observer((props: Props) => {
    const [filter, setFilter] = React.useState<any>({
      maxResultCount: 10,
      skipCount: 0,
      keyword: ''
    })
    const currentPage = () => Math.floor(filter.skipCount / filter.maxResultCount) + 1
    const handleSearch = async (name, value) => {
      if (name === 'date') {
        setFilter(convertFilterDate(filter, value))
        getAll(convertFilterDate(filter, value))
      } else {
        const newFilter = { ...filter, [name]: value }
        getAll(newFilter)
        setFilter(newFilter)
      }
    }

    React.useEffect(() => {
      isGranted(appPermissions.enquiry.page) && props.saleAndLeaseStore.getListStatus()
      isGranted(appPermissions.enquiry.page) && getAll(filter)
      // props.saleAndLeaseStore.getAllLease(filter)
      // props.saleAndLeaseStore.getLeaseOverview({ ...filter, enquiryTypeId: enquiryType.lease })
    }, [])

    const updateKeyword = (name, value) => {
      const newFilter = { ...filter, [name]: value }
      setFilter(newFilter)
    }
    const getAll = (filter) => {
      props.saleAndLeaseStore.getAllLease(filter)
      props.saleAndLeaseStore.getLeaseOverview({ ...filter, enquiryTypeId: enquiryType.lease })
    }

    const navigate = useNavigate()
    const gotoDetail = async (id?) => {
      id ? navigate(portalLayouts.leaseDetail.path.replace(':id', id)) : navigate(portalLayouts.leaseCreate.path)
    }
    const handleTableChange = (pagination: any) => {
      const newFilter = {
        ...filter,
        skipCount: (pagination.current - 1) * filter.maxResultCount
      }
      setFilter(newFilter)
    }
    const handleComplete = async (id) => {
      await saleAndLeaseService.completeEnquiry(id)
      notifySuccess(L('SUCCESSFULLY'), L('CHANGE_SUCCESSFULLY'))
      setFilter({ ...filter })
    }
    const column = getColumns({
      title: L('LEASE_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: '20%',
      render: (description, item: any) => {
        const statusId = item.status?.id || 0
        return (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 21, offset: 0 }} className="col-info">
              <a
                onClick={() => isGranted(appPermissions.enquiry.detail) && gotoDetail(item.id)}
                className="link-text-table">
                {description}
              </a>
            </Col>
            <Col sm={{ span: 3, offset: 0 }}>
              {isGrantedAny(appPermissions.enquiry.update) && (
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu>
                      {isGranted(appPermissions.enquiry.update) && statusId !== 4 && statusId !== 5 && (
                        <Menu.Item onClick={() => handleComplete(item.id)}>{L('COMPLETED')}</Menu.Item>
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
    const [settingVisible, setSettingVisible] = React.useState(false)
    const openSettingModal = () => {
      setSettingVisible(!settingVisible)
    }
    const keywordPlaceholder = L('SALE_LEASE_LIST_KEYWORD_SEARCH')
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 8, offset: 0 }}>
          <label>{L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceholder}
            onSearch={(value) => handleSearch('keyword', value)}
            onChange={(value) => updateKeyword('keyword', value.target.value)}
          />
        </Col>
        <Col sm={{ span: 8, offset: 0 }}>
          <label>{L('FILTER_BEDROOM')}</label>
          <Select
            mode="multiple"
            className="full-width"
            filterOption={false}
            allowClear
            onChange={(value) => handleSearch('numOfBedroom', value)}>
            {bedroomStatus.map((item: any, index) => (
              <Select.Option key={index} value={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 8, offset: 0 }}>
          <label>{L('FILTER_BATHROOM')}</label>
          <Select
            mode="multiple"
            className="full-width"
            filterOption={false}
            allowClear
            onChange={(value) => handleSearch('numOfBathroom', value)}>
            {bathroomStatus.map((item: any, index) => (
              <Select.Option key={index} value={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col sm={{ span: 8, offset: 0 }}>
          <label>{L('STATUS')}</label>
          <Select
            allowClear
            className="w-100"
            showSearch
            placeholder={L('SELECT_STATUS')}
            optionFilterProp="children"
            onChange={(value) => handleSearch('StatusIds', value)}
            mode="multiple">
            {props.saleAndLeaseStore.statusList.map((status) => {
              return (
                <Select.Option value={status.id} key={status.id}>
                  {L(status.code)}
                </Select.Option>
              )
            })}
          </Select>
        </Col>
        <Col sm={{ span: 16, offset: 0 }}>
          <label>{L('FILTER_CREATE_TIME')}</label>
          <DatePicker.RangePicker
            className="w-100"
            format={dateFormat}
            onChange={(dates) => handleSearch('date', dates)}
          />
        </Col>
      </Row>
    )
    return isGranted(appPermissions.enquiry.page) ? (
      <>
        <OverViewBar
          data={props.saleAndLeaseStore.LeaseOverview}
          handleClickItem={() => {
            throw new Error('Not implement')
          }}
        />
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={() => props.saleAndLeaseStore.getAllLease(filter)}
          title={L('LEASE_LIST')}
          onCreate={() => gotoDetail(null)}
          pagination={{
            pageSize: filter.maxResultCount,
            current: currentPage(),
            total: props.saleAndLeaseStore.leaseList.totalCount ?? 0,
            onChange: handleTableChange
          }}
          createPermission={appPermissions.enquiry.create}
          actionGroups={() =>
            isGranted(appPermissions.enquiry.update) && (
              <Button
                onClick={openSettingModal}
                icon={<SettingOutlined />}
                type="primary"
                size={'middle'}
                shape="circle"
                className="mr-1"
              />
            )
          }>
          <Table
            size="middle"
            scroll={{ x: 1000, y: 500 }}
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={column}
            pagination={false}
            loading={props.saleAndLeaseStore.isLoading}
            dataSource={props.saleAndLeaseStore.leaseList.items}
          />
        </DataTable>
        <SaleAndLeaseConfig
          enquiryType={2}
          visible={settingVisible}
          saleAndLeaseStore={props.saleAndLeaseStore}
          closeModal={openSettingModal}
        />
      </>
    ) : (
      <NoRole />
    )
  })
)

export default LeaseManagement
