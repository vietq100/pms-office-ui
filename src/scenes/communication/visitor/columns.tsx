import { L } from '@lib/abpUtility'
import { renderDateTime, renderDotActive } from '@lib/helper'
import { ExportOutlined, IdcardOutlined, ImportOutlined, PhoneOutlined } from '@ant-design/icons/lib'
import AppConsts from '@lib/appconst'

const { align } = AppConsts

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
    {
      title: L('VISITOR_ID'),
      dataIndex: 'id',
      key: 'id',
      width: '4%',
      align: align.center,
      render: (id) => <>{id}</>
    },
    actionColumn,
    {
      title: L('VISITOR_NAME'),
      dataIndex: 'visitorName',
      key: 'visitorName',
      ellipsis: true,
      width: '20%',
      render: (visitorName, row) => (
        <>
          {visitorName}
          <div className="text-muted small">
            <IdcardOutlined /> {row.identityCardNumber}
          </div>
        </>
      )
    },
    {
      title: L('VISITOR_PHONE_NUMBER'),
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: '12%',
      render: (phoneNumber) => (
        <>
          <PhoneOutlined />
          {L(' ')}
          {phoneNumber ? phoneNumber : L('---')}
        </>
      )
    },
    {
      title: L('VISITOR_CHECK_IN_DATE') + '/' + L('VISITOR_CHECK_OUT_DATE'),
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      ellipsis: true,
      render: (checkInTime, row) => {
        return (
          <div>
            <ImportOutlined /> {renderDateTime(checkInTime)}
            <div>
              <ExportOutlined />
              {renderDateTime(row.checkOutTime)}
            </div>
          </div>
        )
      }
    }
  ]

  return data
}

export default columns
