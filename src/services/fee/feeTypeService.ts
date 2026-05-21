import http from '@services/httpService'
import { FeeTypeModel, IFeeType } from '@models/fee'
import { notifySuccess } from '@lib/helper'
import { LNotification } from '@lib/abpUtility'

class FeeTypeService {
  public async create(body) {
    const result = await http.post('api/services/app/FeeType/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body) {
    const result = await http.put('api/services/app/FeeType/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async activateOrDeactivate(id, isActive) {
    const result = await http.post('api/services/app/FeeType/Active', { id }, { params: { isActive } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async delete(id) {
    const result = await http.delete('api/services/app/FeeType/Delete', {
      params: { id }
    })
    return result.data
  }

  public async get(id): Promise<any> {
    const result = await http.get('api/services/app/FeeType/GetFeeTypeForEdit', { params: { id } })
    return FeeTypeModel.assign(result.data.result || {})
  }

  public async checkExist(code): Promise<any> {
    const result = await http.post('api/services/app/FeeType/CheckExistCode', null, { params: { code } })
    return result.data.result
  }

  public async getAll(params): Promise<any> {
    const result = await http.get('api/services/app/FeeType/GetAll', {
      params: params
    })
    return result.data.result
  }

  public async getList(params): Promise<IFeeType[]> {
    const res = await http.get('api/services/app/FeeType/GetLists', { params })
    return Promise.resolve(res.data.result)
  }
  public async getListDetail(): Promise<any[]> {
    const res = await http.get('api/services/app/FeeType/GetListFeeTypeDetail')
    return Promise.resolve(res.data.result)
  }
  public async createConfig(body) {
    const result = await http.post('api/services/app/FeeGenerateConfiguration/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async updateConfig(body) {
    const result = await http.put('api/services/app/FeeGenerateConfiguration/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  public async getFeeConfigByFeeType(generateType): Promise<any> {
    const result = await http.get('api/services/app/FeeGenerateConfiguration/GetFeeConfigByGenerateType', {
      params: { generateType }
    })
    return result.data.result
  }
  public async GetListVehicelType(): Promise<any> {
    const result = await http.get('api/services/app/Parking/GetListType')
    return result.data.result
  }
  public async GetListFeeTypeGen(params): Promise<any> {
    const result = await http.get('api/services/app/FeeType/GetListFeeTypeGen', { params })
    return result.data.result
  }

  public async createOrUpdateFeeUnitUser(body) {
    const result = await http.post('api/services/app/FeeType/CreateOrUpdateFeeUnitUser', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async getListsFeeUnitUserByUnit(params: any): Promise<any> {
    const result = await http.get('api/services/app/FeeType/GetListsFeeUnitUserByUnit', { params })
    return result.data.result
  }

  public async getCurrent(): Promise<any> {
    const result = await http.get('api/services/app/FeePackage/GetCurrent')
    return result.data.result
  }
}

export default new FeeTypeService()
