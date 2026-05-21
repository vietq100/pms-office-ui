import SystemColumn from '@components/DataTable/columns'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'

const { listVehicleParkingType, listTenantTypeUseVehicle } = AppConsts

export const getVehicleColumns = (actionColumn?) => {
  const data = [
    actionColumn,

    {
      title: L('PARKING_DEPARTMENT'),
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 130,
      render: (departmentName) => <>{departmentName}</>
    },
    {
      title: L('VEHICLE_BKS'),
      dataIndex: 'vehicle',
      key: 'vehicle',
      width: 130,
      render: (vehicle) => <>{vehicle?.numberPlate}</>
    },
    {
      title: L('PARKING_LOT'),
      dataIndex: 'parking',
      key: 'parking',
      width: 130,
      render: (parking) => <>{parking?.name}</>
    },

    {
      title: L('VEHICLE_COMPANAY'),
      dataIndex: 'company',
      key: 'company',
      width: 100,
      render: (company) => <>{company?.companyName}</>
    },
    {
      title: L('PARKING_VEHICLE_TYPE'),
      dataIndex: 'vehicle',
      key: 'vehicle',
      width: 130,

      render: (vehicle) => <>{vehicle?.type?.name}</>
    },
    {
      title: L('PARKING_CARD_PARKING_TIME'),
      dataIndex: 'vehicle',
      key: 'vehicle',
      width: 130,
      render: (vehicle) =>
        L(listVehicleParkingType.find((item) => item.value === vehicle?.vehicleParkingType)?.name ?? '')
    },
    {
      title: L('PARKING_CARD_TYPE_MEMBER'),
      dataIndex: 'vehicle',
      key: 'vehicle',
      width: 130,
      render: (vehicle) => listTenantTypeUseVehicle.find((item) => item.value === vehicle?.tenantType)?.name ?? ''
    },
    {
      title: L('PARKING_CARD_STATUS'),
      dataIndex: 'vehicleStatus',
      key: 'vehicleStatus',
      width: 130,
      render: (vehicleStatus) => (
        <div className="d-flex justify-content-center ">
          <p
            style={{
              color: !vehicleStatus?.isCancel ? '#096DD9' : '#EB7077',
              backgroundColor: !vehicleStatus?.isCancel ? '#E6F7FF' : '#f7c5c8',
              border: `1px solid ${!vehicleStatus?.isCancel ? '#91D5FF' : '#EB7077'}`,
              borderRadius: '4px',
              padding: '4px 8px',
              width: 'fit-content',
              fontWeight: 600,
              textAlign: 'center'
            }}>
            {vehicleStatus?.name}
          </p>
        </div>
      )
    },
    SystemColumn
  ]

  return data
}

export default getVehicleColumns
