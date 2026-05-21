import { EventType, NewsModel } from '@models/communication/News'
import withRouter from '@components/Layout/Router/withRouter'
import { Col, Dropdown, Menu, Modal, Row, Spin, Table } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'

import { portalLayouts } from '@components/Layout/Router/router.config'
import { isGranted, L, LNotification } from '@lib/abpUtility'
import orderBy from 'lodash/orderBy'
import { appPermissions } from '@lib/appconst'
import getColumns from './columns'

const confirm = Modal.confirm
interface NewsProps {
  navigate: any
  news: NewsModel[]
  loading?: boolean
  onDelete: (id: number, isActive: boolean) => void
  onNotify: (item: number) => void
}

function NewsListView(props: NewsProps) {
  const onDelete = (item: NewsModel) => () => {
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
    props.navigate(portalLayouts.newsEdit.path.replace(':id', id))
  }

  const onNotify = (item: NewsModel) => () => {
    confirm({
      title: LNotification(L(`DO_YOU_WANT_TO_NOTIFY_${item.eventType === EventType.PROJECT ? 'PROJECT' : 'UNIT'}`)),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: () => {
        props.onNotify(item.id)
      }
    })
  }

  if (props.loading) {
    return (
      <div className="flex auto center-content">
        <Spin size="large" />
      </div>
    )
  }

  if (!props.news.length) {
    return <div className="news-list flex center-content news-empty">{L('NEWS_EMPTY_DATA')}</div>
  }

  const sortedNewsList = orderBy(props.news, ['sortOrder', 'creationTime'], ['desc', 'desc'])

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
            onClick={() => props.navigate(portalLayouts.newsDetail.path.replace(':id', item.id))}
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
                {isGranted(appPermissions.project.update) && (
                  <Menu.Item onClick={onNotify(item)}>
                    {item.eventType === EventType.PROJECT ? L('NEWS_SEND_TO_PROJECT') : L('NEWS_SEND_TO_UNIT')}
                  </Menu.Item>
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
      dataSource={sortedNewsList}
    />
  )
}

export default withRouter(NewsListView)
