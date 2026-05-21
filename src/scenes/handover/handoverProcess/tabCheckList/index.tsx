import { EllipsisOutlined, PlusCircleFilled, ReloadOutlined } from '@ant-design/icons'
import DataTable from '@components/DataTable'
import { isGranted, isGrantedAny, L, LNotification } from '@lib/abpUtility'
import { appPermissions, efromStatusPublic, moduleIds } from '@lib/appconst'
import { renderOptions } from '@lib/helper'
import HandoverStore from '@stores/handover/handoverStore'
import Stores from '@stores/storeIdentifier'
import { Button, Col, Dropdown, Menu, Modal, Row, Select, message } from 'antd'
import Table from 'antd/lib/table'
import { inject, observer } from 'mobx-react'
import React from 'react'
import getColumns from './columns'
import NoRole from '@components/ComponentNoRole'
import CheckListDetail from './components/CheckListDetail'
import getMenuItem from '@components/MenuItem'
import eFormStore from '@stores/eForm/eFormStore'
const confirm = Modal.confirm
type Props = {
  idDetail: number
  handoverStore: HandoverStore
  eFormStore: eFormStore
}

const ChecklistTable = inject(
  Stores.HandoverStore,
  Stores?.EFormStore
)(
  observer((props: Props) => {
    const [filter, setFilter] = React.useState({
      maxResultCount: 10,
      skipCount: 0,
      status: undefined,
      moduleId: moduleIds.handoverReservation,
      targetParentId: props.idDetail
    })
    const [idAnswer, setIdAnswer] = React.useState<any>(undefined)
    const [showDetail, setShowDetail] = React.useState(false)
    const [idFormQuestion, setIdFormQuestion] = React.useState<any>(undefined)
    React.useEffect(() => {
      getAllResponse()
    }, [filter])

    React.useEffect(() => {
      getListTemplateForm()
      getHandOverCheckListStatus()
    }, [])

    const getAllResponse = async () => {
      await props.handoverStore.getAllResponse({
        maxResultCount: filter.maxResultCount,
        skipCount: filter.skipCount,
        status: filter.status,
        moduleId: filter.moduleId,
        targetParentId: props.idDetail
      })
    }

    const getListTemplateForm = async () => {
      await props.handoverStore.getFormListQuesion({
        maxResultCount: 100,
        skipCount: 0,
        isActive: 'true',
        status: efromStatusPublic.PUBLISHED,
        moduleId: moduleIds.handoverReservation
      })
    }

    const getHandOverCheckListStatus = async () => {
      await props.handoverStore.getHandOverCheckListStatus({ moduleId: moduleIds.handover })
    }

    const currentPage = () => Math.floor(filter.skipCount / filter.maxResultCount) + 1

    const handleSearch = (key, value) => {
      if (key === 'status') {
        const newFilter = {
          ...filter,
          status: value
        }

        setFilter(newFilter)
      }
    }

    const updateResponseStatus = async (id, status) => {
      confirm({
        title: LNotification('DO_YOU_WANT_TO_UPPDATE_THIS_ITEM_TO_{0}', status.name),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: async () => {
          await props.eFormStore.updateResponseStatus(id, status.code)
          await getAllResponse()
        }
      })
    }

    const activateOrDeactivate = async (id: number, isActive) => {
      confirm({
        title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: async () => {
          await props.eFormStore.activateOrDeactivate(id, isActive)
          await getAllResponse()
        }
      })
    }

    const getMenuItems = (id, responseStatus) => {
      // Keep component is cause of error message from development mode
      const label = (status) => (
        <span key={status.id} onClick={() => updateResponseStatus(id, status)}>
          <span>{status.name}</span>
        </span>
      )
      return (responseStatus || []).map((item) => getMenuItem(label(item), item.id))
    }

    const handleTableChange = (pagination: any) => {
      const newFilter = {
        ...filter,
        skipCount: (pagination.current - 1) * filter.maxResultCount
      }
      setFilter(newFilter)
    }

    const gotoDetail = (id) => {
      if (id) {
        setIdAnswer(id)
      } else {
        setIdAnswer(null)
      }
      setShowDetail(true)
    }

    const gotoCreate = (formQuestionId) => {
      if (formQuestionId) {
        setIdAnswer(null)
        setIdFormQuestion(formQuestionId)
        setShowDetail(true)
      } else {
        message.error(L('NOT_EXIST_FROM_QUESION_ID'))
      }
    }

    const onCanncelShowDetail = (isReaload) => {
      setShowDetail(false)
      setIdFormQuestion(undefined)
      setIdAnswer(undefined)
      if (isReaload) {
        getAllResponse()
      }
    }

    const column = getColumns({
      title: L('HANDOVER_CHECKLIST_NAME'),
      dataIndex: 'formName',
      key: 'formName',
      ellipsis: true,
      width: '25%',
      render: (formName, item: any) => {
        return (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 20, offset: 0 }} className="col-info">
              <a onClick={() => gotoDetail(item.id)} className="link-text-table ml-1">
                {formName}
              </a>
            </Col>
            <Col sm={{ span: 4, offset: 0 }}>
              {isGrantedAny(appPermissions.handoverReservation.update) && (
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu
                      items={
                        item.submitStatus?.isIssueClosed
                          ? []
                          : getMenuItems(item.id, props.handoverStore.handOverCheckListStatus)
                      }>
                      <Menu.Item onClick={() => activateOrDeactivate(item.id, !item.isActive)}>
                        {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
                      </Menu.Item>
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

    const filterComponent = (
      <Col span={4}>
        <Select
          allowClear
          onChange={(value) => handleSearch('status', value)}
          placeholder={L('FILTER_ACTIVE_STATUS')}
          style={{ width: '100%' }}>
          {renderOptions(props.handoverStore.handOverCheckListStatus)}
        </Select>
      </Col>
    )

    return isGranted(appPermissions.handoverReservation.page) ? (
      <>
        {!showDetail && (
          <>
            <Row className={'table-header'}>
              <Col flex="auto">{filterComponent}</Col>
              <Col
                className="text-right d-flex align-items-end justify-content-end"
                flex={filterComponent ? '100px' : 'auto'}>
                <Button
                  type="primary"
                  shape="circle"
                  className="mr-1"
                  icon={<ReloadOutlined />}
                  onClick={getAllResponse}
                />
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu>
                      {props.handoverStore.formListQuesion?.map((item, index) => {
                        return (
                          <Menu.Item key={index} onClick={() => gotoCreate(item?.id)}>
                            {item?.formName}
                          </Menu.Item>
                        )
                      })}
                    </Menu>
                  }
                  placement="bottomLeft">
                  <Button type="primary" className="mr-1" icon={<PlusCircleFilled />}>
                    {L('NEW_CHECK_LIST')}
                  </Button>
                </Dropdown>
              </Col>
            </Row>
            <DataTable
              pagination={{
                pageSize: filter.maxResultCount,
                current: currentPage(),
                total: props.handoverStore.handoverCheckList.totalCount ?? 0,
                onChange: handleTableChange
              }}>
              <Table
                size="middle"
                scroll={{ x: 1000, y: 500 }}
                className="custom-ant-table custom-ant-row"
                rowKey={(record) => record.id}
                columns={column}
                pagination={false}
                loading={props.handoverStore.isLoading}
                dataSource={props.handoverStore.handoverCheckList.items ?? []}
              />
            </DataTable>
          </>
        )}
        <div style={{ display: showDetail ? 'block' : 'none' }}>
          <CheckListDetail
            handoverStore={props.handoverStore}
            idAnswer={idAnswer}
            idFormQuestion={idFormQuestion}
            showDetail={showDetail}
            onCancel={onCanncelShowDetail}
          />
        </div>
      </>
    ) : (
      <NoRole />
    )
  })
)

export default ChecklistTable
