import { EventModel } from '@models/communication/Event'
import withRouter from '@components/Layout/Router/withRouter'
import { Col, Dropdown, Menu, Modal, Row, Spin, Table } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'

import { portalLayouts } from '@components/Layout/Router/router.config'
import { isGranted, L, LNotification } from '@lib/abpUtility'

import orderBy from 'lodash/orderBy'
import { appPermissions } from '@lib/appconst'
import getColumns from './columns'
interface EventProps {
  navigate: any
  events: EventModel[]
  loading?: boolean
  onDelete: (id: number, isActive: boolean) => void
  onNotify: (item: number) => void
}
const confirm = Modal.confirm
function EventListView(props: EventProps) {
  const onDelete = (item: EventModel) => () => {
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: () => {
        props.onDelete(item.id, !item.isActive)
      }
    })
  }
  const gotoEdit = (id: number) => () => {
    props.navigate(portalLayouts.eventEdit.path.replace(':id', id))
  }

  if (props.loading) {
    return (
      <div className="flex auto center-content">
        <Spin size="large" />
      </div>
    )
  }

  if (!props.events.length) {
    return <div className="event-list flex center-content event-empty">{L('NEWS_EMPTY_DATA')}</div>
  }

  const sortedEventList = orderBy(props.events, ['sortOrder', 'creationTime'], ['desc', 'desc'])
  const columns = getColumns({
    title: L('NEW_SUBJECT'),
    dataIndex: 'subject',
    key: 'subject',
    ellipsis: true,
    width: '20%',
    render: (subject: string, item: any) => (
      <Row>
        <Col sm={{ span: 21, offset: 0 }}>
          <a
            onClick={() => props.navigate(portalLayouts.eventDetail.path.replace(':id', item.id))}
            className="link-text-table">
            {subject}
          </a>
        </Col>
        <Col sm={{ span: 3, offset: 0 }}>
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu>
                {isGranted(appPermissions.project.update) && (
                  <Menu.Item onClick={gotoEdit(item.id)}>{L('NEW_GO_TO_EDIT')}</Menu.Item>
                )}

                {isGranted(appPermissions.project.delete) && (
                  <Menu.Item onClick={onDelete(item)}>{L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}</Menu.Item>
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
    <Table
      size="middle"
      className="custom-ant-table custom-ant-row"
      columns={columns}
      scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
      pagination={false}
      //loading={this.props.deliveryStore.isLoading}
      dataSource={sortedEventList}
    />
  )
}

export default withRouter(EventListView)
