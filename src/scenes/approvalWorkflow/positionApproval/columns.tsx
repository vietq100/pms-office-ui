import { columnCreate } from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderIsActiveBlue } from '@lib/helper'

const { listPositionType, align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: () => <> {L('POSITION_APPROVAL_OBJECT')}</>,
      dataIndex: 'typeId',
      key: 'typeId',
      ellipsis: true,
      width: '20%',
      align: align.center,
      render: (typeId) => (
        <>
          {listPositionType.map(
            (item) =>
              item.value === typeId && (
                <span
                  style={{
                    fontWeight: 600,
                    padding: '5px 10px',
                    backgroundColor: item.backgroundColor,
                    color: item.color,
                    borderRadius: 8
                  }}>
                  {L(item.label)}
                </span>
              )
          )}
        </>
      )
    },
    {
      title: L('POSITION_APPROVAL_COMPANY'),
      dataIndex: 'company',
      key: 'company',
      ellipsis: true,
      render: (company) => <div className="custom-text">{company?.companyName}</div>
    },
    {
      title: L('POSITION_APPROVAL_USER'),
      dataIndex: 'users',
      key: 'users',
      render: (users) => (
        <>
          {users.map((item) => (
            <span key={item?.id} className="mr-1 custom-text-column-blue">
              {item?.displayName}
            </span>
          ))}
        </>
      )
    },
    {
      title: L('IS_ACTIVE'),
      dataIndex: 'isActive',
      key: 'isActive',
      align: align.center,
      render: renderIsActiveBlue
    },
    columnCreate
  ]

  return data
}

export default columns
