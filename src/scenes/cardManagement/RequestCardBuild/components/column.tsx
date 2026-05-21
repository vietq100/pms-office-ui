import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { TableColumnGroupType, TableColumnType } from 'antd'
import { ColumnsType } from 'antd/lib/table'

const { gendersVehicle, listTenantTypeUseVehicle, listCardType, listVehicleParkingType } = AppConsts

const columnStaff = (
  actionColumn: TableColumnGroupType<any> | TableColumnType<any>,
  isEditing: any,
  listVehicleType: any,
  listParking: any
) => {
  const data: ColumnsType<any> = [
    {
      title: L('BUILD_CARD_TENANT_NAME'),
      dataIndex: 'tenantName',
      key: 'tenantName',
      width: 200,
      fixed: 'left',
      ellipsis: true,
      render: (tenantName) => <div className="pl-2 text-truncate">{tenantName}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'tenantName', 'BUILD_CARD_TENANT_NAME', isEditing, '', true)
    },
    {
      title: L('STAFF_GENDER'),
      dataIndex: 'gender',
      key: 'gender',
      width: 200,
      ellipsis: true,
      render: (gender) => (
        <div className="pl-2 text-truncate">{gendersVehicle.find((item) => item?.value === gender)?.name}</div>
      ),
      onCell: (record) => buildEditableCell(record, 'select', 'gender', 'STAFF_GENDER', isEditing, gendersVehicle, true)
    },
    {
      title: L('BUILD_CARD_DEPARTMENT_NAME'),
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 200,
      ellipsis: true,
      render: (name) => <div className="pl-2 text-truncate">{name}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'text', 'departmentName', 'BUILD_CARD_DEPARTMENT_NAME', isEditing, '', true)
    },
    {
      title: L('BUILD_CARD_VEHICLE_TENANT_TYPE'),
      dataIndex: 'tenantType',
      key: 'tenantType',
      width: 200,
      ellipsis: true,
      render: (tenantType) => (
        <div className="pl-2 text-truncate">
          {listTenantTypeUseVehicle?.find((item) => item?.id === tenantType)?.name}
        </div>
      ),
      onCell: (record) =>
        buildEditableCell(
          record,
          'select',
          'tenantType',
          'BUILD_CARD_VEHICLE_TENANT_TYPE',
          isEditing,
          listTenantTypeUseVehicle,
          true
        )
    },
    {
      title: L('BUILD_CARD_ELEVATOR'),
      dataIndex: 'elevatorAccess',
      key: 'elevatorAccess',
      width: 200,
      ellipsis: true,
      render: (elevatorAccess) => <div className="pl-2 text-truncate">{elevatorAccess}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'text', 'elevatorAccess', 'BUILD_CARD_ELEVATOR', isEditing, '', true)
    },
    {
      title: L('BUILD_CARD_PARKING'),
      dataIndex: 'parkingId',
      key: 'parkingId',
      width: 200,
      ellipsis: true,
      render: (parkingId) => (
        <div className="pl-2 text-truncate">{listParking?.find((item) => item?.id === parkingId)?.name}</div>
      ),
      onCell: (record) =>
        buildEditableCell(record, 'select', 'parkingId', 'BUILD_CARD_PARKING', isEditing, listParking, false)
    },
    {
      title: L('BUILD_CARD_VEHICLE_NUMBER_PLATE'),
      dataIndex: 'numberPlate',
      key: 'numberPlate',
      width: 200,
      ellipsis: true,
      render: (numberPlate) => <div className="pl-2 text-truncate">{numberPlate}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'text', 'numberPlate', 'BUILD_CARD_VEHICLE_NUMBER_PLATE', isEditing, '', false)
    },
    {
      title: L('BUILD_CARD_VEHICLE_TYPE'),
      dataIndex: 'vehicleTypeId',
      key: 'vehicleTypeId',
      width: 200,
      ellipsis: true,
      render: (vehicleTypeId) => (
        <div className="pl-2 text-truncate">
          {listVehicleType && listVehicleType.find((item) => item?.id === vehicleTypeId)?.name}
        </div>
      ),
      onCell: (record) =>
        buildEditableCell(
          record,
          'select',
          'vehicleTypeId',
          'BUILD_CARD_VEHICLE_TYPE',
          isEditing,
          listVehicleType,
          false
        )
    },
    {
      title: L('BUILD_CARD_VEHICLE_FEE_CONFIGURATION'),
      dataIndex: 'vehicleParkingType',
      key: 'vehicleParkingType',
      width: 200,
      ellipsis: true,
      render: (vehicleParkingType) => (
        <div className="pl-2 text-truncate">
          {listVehicleParkingType.find((item) => item?.id === vehicleParkingType)?.name}
        </div>
      ),
      onCell: (record) =>
        buildEditableCell(
          record,
          'select',
          'vehicleParkingType',
          'BUILD_CARD_VEHICLE_FEE_CONFIGURATION',
          isEditing,
          listVehicleParkingType,
          false
        )
    },
    {
      title: L('BUILD_CARD_CARD_TYPE'),
      dataIndex: 'cardTypes',
      key: 'cardTypes',
      width: 200,
      ellipsis: true,
      render: (cardTypes) => (
        <div className="pl-2 text-truncate">
          {' '}
          {cardTypes
            ?.map((id) => listCardType.find((item) => item.id === id)?.name)
            .filter(Boolean)
            .join(', ')}
        </div>
      ),
      onCell: (record) =>
        buildEditableCell(record, 'multiSelect', 'cardTypes', 'BUILD_CARD_CARD_TYPE', isEditing, listCardType, true)
    },
    {
      title: L('BUILD_CARD_DESCRIPTION'),
      dataIndex: 'creatorDescription',
      key: 'creatorDescription',
      width: 200,
      ellipsis: true,
      render: (description) => <div className="pl-2 text-truncate">{description}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'text', 'creatorDescription', 'BUILD_CARD_DESCRIPTION', isEditing, '', false)
    }
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}

export default columnStaff
