import { L } from '@lib/abpUtility'
import { renderDotActive, renderStatusActive } from '@lib/helper'
import AppConsts from '@lib/appconst'
import SystemColumn2 from '@components/DataTableV2/columns'
const { align, listVehicleParkingType } = AppConsts

const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 50,
      align: align.center,
      ellipsis: true,
      render: renderDotActive
    },
    actionColumn,

    {
      title: L('BUILDING_CARD_COMPANY'),
      dataIndex: 'company',
      key: 'company',
      width: 200,
      render: (company) => <>{company?.companyName}</>
    },

    {
      title: L('BUILD_CARD_NAME_STAFF_IN_COMPANY'),
      dataIndex: 'tenantName',
      key: 'tenantName',
      ellipsis: true,
      width: 200,
      render: (tenantName) => tenantName
    },
    {
      title: L('BUILD_CARD_DEPARTMENT'),
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
      render: (departmentName) => <>{departmentName}</>
    },

    {
      title: L('BUILD_CARD_TYPE_VEHICLE'),
      dataIndex: 'vehicleAttachment',
      key: 'vehicleAttachment',
      width: 150,
      ellipsis: true,
      render: (vehicleAttachment) => (
        <label>
          {L(listVehicleParkingType.find((item) => item?.value === vehicleAttachment?.vehicleParkingType)?.name ?? '')}
        </label>
      )
    },
    {
      title: L('BUILD_CARD_NUMBER_PLATE'),
      dataIndex: 'vehicleAttachment',
      key: 'vehicleAttachment',
      width: 100,
      render: (vehicleAttachment) => vehicleAttachment?.numberPlate
    },

    {
      title: L('BUILD_CARD_STATUS'),
      dataIndex: 'isActive',
      key: 'isActive',
      ellipsis: true,
      width: 100,
      render: renderStatusActive
    },
    SystemColumn2
  ]

  return data
}

export default columns
