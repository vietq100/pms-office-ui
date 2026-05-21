import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'

const { align } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    {
      title: L('METER_ELLECTRIC_PERIOD'),
      dataIndex: 'feePackage',
      key: 'feePackage',
      width: '8%',
      align: align.center,
      render: (feePackage) => <div>{feePackage?.name}</div>
    },
    actionColumn,

    {
      title: L('METER_UNITS'),
      dataIndex: 'units',
      key: 'units',
      width: '20%',
      ellipsis: true,
      render: (units) => <div className="pl-1">{units.map((item) => item)}</div>
    },
    // {
    //   title: L('METER_INDEX_FROM'),
    //   dataIndex: 'code',
    //   key: 'code',
    //   width: '10%',
    //   ellipsis: true,
    //   render: (code) => <>{code}</>
    // },
    // {
    //   title: L('METER_INDEX_TO'),
    //   dataIndex: 'code',
    //   key: 'code',
    //   width: '10%',
    //   ellipsis: true,
    //   render: (code) => <>{code}</>
    // },
    {
      title: L('METER_QUANLITY'),
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: '13%',
      ellipsis: true,
      render: (totalQuantity) => <div>{totalQuantity}</div>
    },
    SystemColumn
  ]

  return data
}

export default columns
