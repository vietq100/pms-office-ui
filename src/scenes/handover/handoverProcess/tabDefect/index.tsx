import DataTable from '@components/DataTable'
import { isGranted, L } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import Stores from '@stores/storeIdentifier'
import { Col, Row } from 'antd'
import Table from 'antd/lib/table'
import { inject, observer } from 'mobx-react'
import React from 'react'
import getColumns from './columns'
import NoRole from '@components/ComponentNoRole'
import withRouter from '@components/Layout/Router/withRouter'
import HandoverStore from '@stores/handover/handoverStore'
import { useParams } from 'react-router-dom'
import { portalLayouts } from '@components/Layout/Router/router.config'

type Props = {
  idDetail: number
  handoverStore: HandoverStore
}

const DefectTable = inject(Stores.HandoverStore)(
  observer((props: Props) => {
    const [filter, setFilter] = React.useState({
      maxResultCount: 10,
      skipCount: 0,
      isActive: 'true'
    })
    React.useEffect(() => {
      getAllResponse()
    }, [filter])

    const params: any = useParams()
    const getAllResponse = async () => {
      props.handoverStore.getAllDefect({
        maxResultCount: filter.maxResultCount,
        skipCount: filter.skipCount,
        workOrderParentId: params?.id
      })
    }

    const currentPage = () => Math.floor(filter.skipCount / filter.maxResultCount) + 1

    const handleTableChange = (pagination: any) => {
      const newFilter = {
        ...filter,
        skipCount: (pagination.current - 1) * filter.maxResultCount
      }
      setFilter(newFilter)
    }

    const gotoDetail = async (id?) => {
      window.open(portalLayouts.communicationWorkOrderDetail.path.replace(':id', id), '_blank')
    }
    const column = getColumns({
      title: L('HANDOVER_DEFECT_ITEM'),
      dataIndex: 'formName',
      key: 'formName',
      ellipsis: true,
      width: '15%',
      render: (formName, item: any) => {
        return (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 24, offset: 0 }} className="col-info">
              <a onClick={() => gotoDetail(item.id)} className="link-text-table">
                {item.workflow?.subject}
              </a>
            </Col>
            {/* <Col sm={{ span: 4, offset: 0 }}>
              {isGrantedAny(appPermissions.handoverReservation.update) && (
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu>
                      {isGranted(appPermissions.handoverReservation.update) && item.status?.code !== 'COMPLETED' && (
                        <Menu.Item onClick={() => console.log(item.id)}>{L('BTN_COMPLETED')}</Menu.Item>
                      )}
                    </Menu>
                  }
                  placement="bottomLeft">
                  <button className="button-action-hiden-table-cell">
                    <EllipsisOutlined />
                  </button>
                </Dropdown>
              )}
            </Col> */}
          </Row>
        )
      }
    })

    return isGranted(appPermissions.handoverReservation.page) ? (
      <>
        <DataTable
          onRefresh={getAllResponse}
          pagination={{
            pageSize: filter.maxResultCount,
            current: currentPage(),
            total: props.handoverStore.defectList.totalCount ?? 0,
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
            dataSource={props.handoverStore.defectList.items ?? []}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  })
)

export default withRouter(DefectTable)
