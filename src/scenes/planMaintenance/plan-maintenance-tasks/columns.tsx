import { Dropdown, Menu, Button } from 'antd'
import { L } from '@lib/abpUtility'
import { EditOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons/lib'
import { MoreOutlined } from '@ant-design/icons'
import { renderDate } from '@lib/helper'
import AppConst, { appPermissions } from '@lib/appconst'

const { align } = AppConst

const columns = (self: any) => {
  return [
    {
      title: `${L('PLAN_MAINTENANCE_TEAM_MANAGEMENT')} / ${L('PLAN_MAINTENANCE_ASSIGNED_TO')}`,
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name, row) => (
        <div>
          <strong>{name}</strong>
          <div>
            {row.assets.map((item, index) => (
              <div key={index}>{item.assetName}</div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: `${L('PLANED_MAINTENANCE_STATUS')}/${L('PLANED_MAINTENANCE_PRIORITY')}`,
      dataIndex: 'status',
      key: 'status',
      width: 200,
      ellipsis: true,
      render: (status, row) => (
        <div>
          {self.renderTag(status?.name, status?.colorCode || 'black')} /{' '}
          {self.renderTag(row.priority?.name, row.priority?.colorCode || 'black')}
        </div>
      )
    },
    {
      title: L('PLAN_MAINTENANCE_COST'),
      dataIndex: 'description',
      key: 'description',
      width: 150,
      ellipsis: true,
      render: (description) => description
    },
    {
      title: L('PLAN_MAINTENANCE_TASK_NOTE'),
      dataIndex: 'description',
      key: 'description',
      width: 150,
      ellipsis: true,
      render: (description) => description
    },
    {
      title: L('DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: 150,
      ellipsis: true,
      render: (description) => description
    },
    {
      title: L('CREATED_AT'),
      dataIndex: 'creationTime',
      key: 'creationTime',
      width: 150,
      ellipsis: true,
      render: (text, row) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDate(text)}
          <div>
            <UserOutlined className="mr-1" /> {row.creatorUser?.displayName}
          </div>
        </div>
      )
    },
    {
      title: L('ACTIONS'),
      dataIndex: 'operation',
      key: 'operation',
      fixed: align.right,
      align: align.right,
      width: 90,
      render: (_text: string, item: any) => (
        <div>
          {self.isGranted(appPermissions.planMaintenance.update) && (
            <Button
              size="small"
              className="ml-1"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => self.gotoDetail(item.id)}
            />
          )}
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu>
                {self.isGranted(appPermissions.planMaintenance.update) && (
                  <Menu.Item onClick={() => self.gotoDetail(item.id)}>{L('BTN_EDIT')}</Menu.Item>
                )}
                {self.isGranted(appPermissions.planMaintenance.delete) && (
                  <Menu.Item onClick={() => self.activateOrDeactivate(item.id, !item.isActive)}>
                    {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
                  </Menu.Item>
                )}
              </Menu>
            }
            placement="bottomLeft">
            <MoreOutlined />
          </Dropdown>
        </div>
      )
    }
  ]
}

export default columns
