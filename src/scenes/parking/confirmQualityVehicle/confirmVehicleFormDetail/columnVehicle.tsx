import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
const { listTenantTypeUseVehicle, listVehicleParkingType } = AppConsts
const columns = (isShowFull = false) => {
  const data = [
    {
      title: L('BUILD_CARD_NAME_STAFF_IN_COMPANY'),
      dataIndex: 'tenantName',
      key: 'tenantName',
      width: '13%',
      ellipsis: isShowFull,
      render: (tenantName) => <div className="pl-2">{tenantName}</div>
    },
    {
      title: L('BUILD_CARD_DEPARTMENT'),
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: '13%',
      ellipsis: isShowFull,
      render: (departmentName) => departmentName
    },

    {
      title: L('VEHICLE_BKS'),
      dataIndex: 'numberPlate',
      key: 'numberPlate',
      width: '13%',
      ellipsis: isShowFull,
      render: (numberPlate) => numberPlate
    },
    {
      title: L('PARKING_CARD_CODE'),
      dataIndex: 'card',
      key: 'card',
      width: '13%',
      ellipsis: isShowFull,
      render: (card) => card?.serialNumber
    },
    {
      title: L('PARKING_CARD_DETAIL_PARKING_LOT'),
      dataIndex: 'parking',
      key: 'parking',
      width: '13%',
      ellipsis: isShowFull,
      render: (parking) => parking?.name
    },
    {
      title: L('BRAND'),
      dataIndex: 'model',
      key: 'model',
      width: '13%',
      ellipsis: isShowFull,
      render: (model) => model
    },
    {
      title: L('PARKING_VEHICLE_TYPE'),
      dataIndex: 'type',
      key: 'type',
      width: '13%',
      ellipsis: isShowFull,
      render: (type) => L(type?.code)
    },
    {
      title: L('BUILD_CARD_VEHICLE_FEE_CONFIGURATION'),
      dataIndex: 'vehicleParkingType',
      key: 'vehicleParkingType',
      width: '13%',
      ellipsis: isShowFull,
      render: (vehicleParkingType) =>
        L(listVehicleParkingType.find((item) => item.value === vehicleParkingType)?.name ?? '')
    },
    {
      title: L('BUILD_CARD_VEHICLE_TENANT_TYPE'),
      dataIndex: 'tenantType',
      key: 'tenantType',
      width: '13%',
      ellipsis: isShowFull,
      render: (tenantType) => listTenantTypeUseVehicle.find((item) => item.value === tenantType)?.name ?? ''
    },
    {
      title: L('REQUEST_CARD_DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '13%',
      ellipsis: isShowFull,
      render: (description) => <div className="text-truncate-1">{description}</div>
    }
  ]

  return data
}

export default columns
