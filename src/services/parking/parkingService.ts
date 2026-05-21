import { LNotification } from '@lib/abpUtility'
import { notifySuccess, renderDateTime } from '@lib/helper'
import { downloadFile } from '@lib/helperFile'
import { parkingCardModel, parkingLotModel } from '@models/parking/parkingModels'

import http from '@services/httpService'
import dayjs from 'dayjs'

class ParkingService {
  //PARKING LOT
  public async getAllParking(params): Promise<any> {
    const res = await http.get('api/services/app/Parking/GetAll', {
      params: params
    })
    const { result } = res.data

    return result
  }
  public async getParking(id): Promise<any> {
    const result = await http.get('api/services/app/Parking/Get', {
      params: { id }
    })

    return parkingLotModel.assign(result.data.result)
  }
  public async createParking(body) {
    if (!body) {
      return
    }
    const result = await http.post('api/services/app/Parking/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async updateParking(body) {
    if (!body) {
      return
    }
    const result = await http.put('api/services/app/Parking/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async activateOrDeactivateParkingLot(id, isActive) {
    const result = await http.post('api/services/app/Parking/Active', { id }, { params: { isActive } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  //PARKING MANAGEMENT
  public async getAllVehicleResident(params): Promise<any> {
    const res = await http.get('api/services/app/VehicleDetail/GetAllRegistedVehicles', {
      params: params
    })
    const { result } = res.data
    return result
  }
  public async getAllRegistedVehicles(params): Promise<any> {
    const res = await http.get('api/services/app/VehicleDetail/GetAllRegistedVehiclesByResident', {
      params: params
    })
    const { result } = res.data

    return result
  }

  public async getByAdmin(id): Promise<any> {
    const result = await http.get('api/services/app/VehicleDetail/GetDetailByVehicleId', {
      params: { id }
    })

    return parkingCardModel.assign(result.data.result)
  }
  public async getByResident(id): Promise<any> {
    const result = await http.get('api/services/app/VehicleDetail/GetDetailByVehicleIdByResident', {
      params: { id }
    })

    return parkingCardModel.assign(result.data.result)
  }

  public async create(body) {
    if (!body) {
      return
    }
    const result = await http.post('api/services/app/VehicleDetail/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body) {
    if (!body) {
      return
    }
    const result = await http.put('api/services/app/VehicleDetail/UpdateVehicleDetailByCardId', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async activateOrDeactivate(id, isActive) {
    const result = await http.post('api/services/app/VehicleDetail/Active', { id }, { params: { isActive } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  public async exportParkingCard(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportVehicleDetails', {
      params,
      responseType: 'blob'
    })

    downloadFile(res.data, `Vehicles_${renderDateTime(dayjs())}.xlsx`)
  }
  public async importParkingCard(file) {
    const data = new FormData()
    data.append('file', file)
    return await http.post('', data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
  }
  public async getType(): Promise<any> {
    const result = await http.get('api/services/app/Parking/GetListType')

    return result.data.result
  }
  public async getStatus(): Promise<any> {
    const result = await http.get('api/services/app/Parking/GetListStatus')

    return result.data.result
  }
  public async downloadTemplate() {
    const response = await http.get('/api/Imports/Parking/GetTemplateImport', {
      responseType: 'blob'
    })
    downloadFile(response.data, 'TemplateVehicle.xlsx')
  }

  public async importVehicleExcel(file, param) {
    const data = new FormData()
    data.append('file', file)
    return await http.post('/api/Imports/Parking/ImportFromExcel', data, {
      params: { feePackageId: param },
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
  }
  public async getOverview(params) {
    const res = await http.get('api/services/app/VehicleDetail/GetOverviewVehicle', { params })
    return res.data.result
  }

  public async deActiveVehicle(body) {
    if (!body) {
      return
    }
    await http.put('api/services/app/VehicleDetail/UpdateCancelStatus', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  // CARD PARKING Request
  public async getAllCardRequest(params): Promise<any> {
    const res = await http.get('api/services/app/VehicleRegistration/GetAll', {
      params: params
    })
    const { result } = res.data

    return result
  }

  public async getAllCardRequest4Staff(params): Promise<any> {
    const res = await http.get('api/services/app/VehicleRegistration/GetAllForStaff', {
      params: params
    })
    const { result } = res.data

    return result
  }

  public async getcardParkingRequest(id): Promise<any> {
    const result = await http.get('api/services/app/VehicleRegistration/Get', {
      params: { id }
    })

    return parkingCardModel.assign(result.data.result)
  }

  public async getcardParkingRequest4Staff(id): Promise<any> {
    const result = await http.get('api/services/app/VehicleRegistration/GetForStaff', {
      params: { id }
    })

    return parkingCardModel.assign(result.data.result)
  }

  public async createCardParkingRequest(body) {
    if (!body) {
      return
    }
    const result = await http.post('api/services/app/VehicleRegistration/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async updateCardParkingRequest(body) {
    if (!body) {
      return
    }
    const result = await http.put('api/services/app/VehicleRegistration/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async getListFeeParking(vehicleTypeId: number): Promise<any> {
    const result = await http.get('api/services/app/VehicleRegistration/GetListFeeParking', {
      params: {
        vehicleTypeId
      }
    })

    return result.data.result
  }

  public async updateStatusCardRequest(body) {
    const result = await http.post('api/services/app/VehicleRegistration/UpdateStatus', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
}

export default new ParkingService()
