import http from '@services/httpService'
import { notifySuccess } from '@lib/helper'
import { LNotification } from '@lib/abpUtility'
import { RowAmenityGroupModel, AmenityGroupDetailModel } from '@models/Booking/amenityModel'

class AmenityGroupService {
  public async create(body) {
    const result = await http.post('api/services/app/GroupAmenities/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body: AmenityGroupDetailModel) {
    if (!body) {
      return
    }

    const result = await http.put('api/services/app/GroupAmenities/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async activateOrDeactivate(id, isActive) {
    const result = await http.post('api/services/app/GroupAmenities/Active', { id }, { params: { isActive } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async delete(id) {
    const result = await http.delete('api/services/app/GroupAmenities/Delete', {
      params: { id }
    })
    return result.data
  }

  public async get(id): Promise<any> {
    const result = await http.get('api/services/app/GroupAmenities/Get', {
      params: { id }
    })
    return AmenityGroupDetailModel.assign(result.data.result || {})
  }

  public async getNotificationTypes(code): Promise<any> {
    const result = await http.post('api/services/app/GroupAmenities/GetNotificationTypes', null, { params: { code } })
    return result.data.result
  }

  public async getParameters(code): Promise<any> {
    const result = await http.post('api/services/app/GroupAmenities/GetParameters', null, { params: { code } })
    return result.data.result
  }

  public async getAll(params): Promise<any> {
    const res = await http.get('api/services/app/GroupAmenities/GetAll', {
      params: params
    })
    const { result } = res.data
    result.items = RowAmenityGroupModel.assigns(result.items)

    return result
  }

  public async getList(params): Promise<RowAmenityGroupModel[]> {
    const res = await http.get('api/services/app/GroupAmenities/GetAll', {
      params
    })
    return Promise.resolve(res.data.result?.items || [])
  }
}

export default new AmenityGroupService()
