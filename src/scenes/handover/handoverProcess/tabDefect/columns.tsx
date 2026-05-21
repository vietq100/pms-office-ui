import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDate } from '@lib/helper'
import { Tag } from 'antd'
const { align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    {
      title: L('HANDOVER_DEFECT_ID'),
      dataIndex: 'id',
      key: 'id',
      width: '8%',
      align: align.center,
      ellipsis: true,
      render: (id) => <>{id}</>
    },
    actionColumn,
    {
      title: L('HANDOVER_DEFECT_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '25%',
      ellipsis: true,
      render: (id, data) => <>{data?.workflow?.description}</>
    },

    {
      title: L('HANDOVER_DEFECT_ASSIGNED_TO'),
      dataIndex: 'description',
      key: 'description',
      width: '12%',
      ellipsis: true,
      render: (id, data) => <>{data?.workflow?.assignedUsers?.map((item) => item.displayName)}</>
    },
    {
      title: L('HANDOVER_DEFECT_STATUS'),
      dataIndex: 'status',
      align: align.center,
      key: 'status',
      width: '12%',
      ellipsis: true,
      render: (status, data) => (
        <Tag
          className="cell-round mr-0"
          style={{
            color: data.workflow.status.colorCode,
            backgroundColor: data.workflow.status.borderColorCode,
            border: 'none',
            fontSize: 11
          }}>
          {data.workflow.status.name}
        </Tag>
      )
    },
    {
      title: L('HANDOVER_DEFECT_START_DATE'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: '10%',
      align: align.center,
      ellipsis: true,
      render: (id, data) => <>{renderDate(data?.workflow?.startDate)}</>
    },
    {
      title: L('HANDOVER_DEFECT_DUE_DATE'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: '10%',
      align: align.center,
      ellipsis: true,
      render: (id, data) => <>{renderDate(data?.workflow?.dueDate)}</>
    }
  ]

  return data
}

export default columns
