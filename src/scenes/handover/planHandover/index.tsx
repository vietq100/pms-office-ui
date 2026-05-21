import DataTable from '@components/DataTable'
import { isGranted, isGrantedAny, L, LNotification } from '@lib/abpUtility'
import AppConsts, { appPermissions, dateFormat, rangePickerPlaceholder } from '@lib/appconst'
import HandoverStore from '@stores/handover/handoverStore'
import Stores from '@stores/storeIdentifier'
import { inject, observer } from 'mobx-react'
import React from 'react'
import getColumns from './column'
import Button from 'antd/es/button'
import Table from 'antd/lib/table'
import { useNavigate } from 'react-router-dom'
import { portalLayouts } from '@components/Layout/Router/router.config'

import handoverService from '@services/handover/handoverService'
import { convertFilterDate, notifySuccess, renderOptions } from '@lib/helper'
import HandoverPlanOverView from './HandoverPlanOverView'
import HandoverPlanSetting from './components/HandoverPlanSetting'
import { EllipsisOutlined, SettingOutlined } from '@ant-design/icons'
import { Col, DatePicker, Dropdown, Menu, Modal, Row } from 'antd'
import Search from 'antd/lib/input/Search'
import Select from 'antd/lib/select'
import NoRole from '@components/ComponentNoRole'
const { activeStatus } = AppConsts
type Props = {
  handoverStore: HandoverStore
}
const confirm = Modal.confirm

const Index = inject(Stores.HandoverStore)(
  observer((props: Props) => {
    const [filter, setFilter] = React.useState({
      maxResultCount: 10,
      skipCount: 0,
      keyword: ''
    })
    isGranted(appPermissions.handoverPlan.page) &&
      React.useEffect(() => {
        props.handoverStore.getStatusOption()
        getAll(filter)
      }, [])

    const getAll = (filter) => {
      props.handoverStore.getAllPlanHandover(filter)
    }
    const updateKeyword = (name, value) => {
      const newFilter = { ...filter, [name]: value }
      setFilter(newFilter)
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
        ? navigate(portalLayouts.handoverPlanDetail.path.replace(':id', id))
        : navigate(portalLayouts.handoverPlanCreate.path)
    }
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
    const handlePublish = async (id) => {
      confirm({
        title: LNotification('PUBLISH_CONFIRM_DESCRIPTION'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: async () => {
          await handoverService.publishHandover({ id })
          notifySuccess(L('SUCCESSFULLY'), L('ITEM_PUBLISH_SUCCESSFULLY'))
          setFilter({ ...filter, skipCount: 0 })
        }
      })
    }
    const column = getColumns({
      title: L('TITLE'),
      dataIndex: 'title',
      key: 'title',
      width: '25%',
      render: (title: string, item: any) => {
        return (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 21, offset: 0 }} className="col-info">
              <a
                onClick={() => isGranted(appPermissions.handoverPlan.detail) && gotoDetail(item.id)}
                className="link-text-table">
                {title}
              </a>
            </Col>
            <Col sm={{ span: 3, offset: 0 }}>
              {isGrantedAny(appPermissions.handoverPlan.update) && (
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu>
                      {isGranted(appPermissions.handoverPlan.update) && item.status.id === 6 && !item.handOverDate && (
                        <Menu.Item onClick={() => handlePublish(item.id)}>{L('PUBLIC_PLAN_HOVER')}</Menu.Item>
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
    const keywordPlaceholder = L('NAME')
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceholder}
            onSearch={(value) => handleSearch('keyword', value)}
            onChange={(value) => updateKeyword('keyword', value.target.value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_HANDOVER_TIME')}</label>
          <DatePicker.RangePicker
            className="w-100"
            format={dateFormat}
            onChange={(dates) => handleSearch('date', dates)}
            placeholder={rangePickerPlaceholder()}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_SENDING_STATUS')}</label>
          <Select
            allowClear
            showArrow
            className="w-100"
            showSearch
            placeholder={L('SELECT_SENDING_STATUS')}
            onChange={(value) => handleSearch('statusIds', value)}
            mode="multiple">
            {renderOptions(props.handoverStore.statusOptions)}
          </Select>
        </Col>

        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('STATUS')}</label>
          <Select
            allowClear
            showArrow
            className="w-100"
            showSearch
            placeholder={L('SELECT_STATUS')}
            optionFilterProp="children"
            onChange={(value) => handleSearch('isActive', value)}>
            {renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return isGranted(appPermissions.handoverPlan.page) ? (
      <>
        <HandoverPlanOverView
          handoverStore={props.handoverStore}
          handoverPlanOverview={props.handoverStore.handoverPlanOverview}
        />
        <HandoverPlanSetting
          visible={settingVisible}
          handoverStore={props.handoverStore}
          closeModal={openSettingModal}
        />
        {/* <FilterHandover
          handleSearch={handleSearch}
          handoverStore={props.handoverStore}
        /> */}
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={() => props.handoverStore.getAllPlanHandover(filter)}
          title={L('HANDOVER_LIST')}
          onCreate={() => gotoDetail(null)}
          pagination={{
            pageSize: filter.maxResultCount,
            current: currentPage(),
            total: props.handoverStore.planHandoverList.totalCount ?? 0,
            onChange: handleTableChange
          }}
          actionGroups={() =>
            isGranted(appPermissions.handoverPlan.update) && (
              <Button
                onClick={openSettingModal}
                icon={<SettingOutlined />}
                type="primary"
                size={'middle'}
                shape="circle"
                className="mr-1"
              />
            )
          }
          createPermission={appPermissions.handoverPlan.create}>
          <Table
            size="middle"
            scroll={{ x: 1000, y: 500 }}
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={column}
            pagination={false}
            loading={props.handoverStore.isLoading}
            dataSource={props.handoverStore.planHandoverList.items ?? []}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  })
)

export default Index
