import { L } from '@lib/abpUtility'
import AppConsts, { dateTimeFormat } from '@lib/appconst'
import { formatCurrency, renderDotActive } from '@lib/helper'
import moment from 'moment'
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
    actionColumn,
    {
      title: L('AMENITY_GROUP'),
      dataIndex: 'amenityGroup',
      key: 'amenityGroup',
      width: '12%',
      render: (amenityGroup) => <>{amenityGroup?.name || ''}</>
    },
    {
      title: L('AMENITY_MAINTAINANCE_TIME'),
      dataIndex: 'maintenanceStartDate',
      key: 'maintenanceStartDate',
      width: '18%',
      render: (maintenanceStartDate, row) => (
        <>
          {moment(maintenanceStartDate).isValid() && moment(maintenanceStartDate).format(dateTimeFormat)} -{' '}
          {moment(row.maintenanceEndDate).isValid() && moment(row.maintenanceEndDate).format(dateTimeFormat)}
        </>
      )
    },
    {
      title: L('AMENITY_MAINTAINANCE_DEPOSIT'),
      dataIndex: 'depositAmount',
      key: 'isUseDeposited',

      render: (depositAmount) => <>{depositAmount <= 0 ? '-' : formatCurrency(depositAmount)}</>
    }
    // SystemColumn
  ]

  return data
}

export default columns
