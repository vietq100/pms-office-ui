import { L } from '@lib/abpUtility'
import AppConst from '@lib/appconst'
import { Tag } from 'antd'
import { renderDotActive } from '@lib/helper'
const { align } = AppConst

const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      render: renderDotActive
    },
    actionColumn,

    {
      title: L('WF_MODULE'),
      dataIndex: 'modules',
      key: 'modules',
      width: 150,
      render: (modules) => (
        <div>
          {(modules || []).map((module, index) => (
            <Tag key={index}>{module.name}</Tag>
          ))}
        </div>
      )
    },
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',

      align: align.center,
      render: () => <></>
    }
  ]

  return data
}

export default columns
