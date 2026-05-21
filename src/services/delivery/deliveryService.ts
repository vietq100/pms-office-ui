import http from '@services/httpService'
import { notifySuccess } from '@lib/helper'
import { LNotification } from '@lib/abpUtility'
import type { PagedResultDto } from '../dto/pagedResultDto'
import { DeliveryDetailModel, DeliveryModel, ReceiveModel } from '@models/delivery'

class DeliveryService {
  public async create(body, files?) {
    const formData = new FormData()
    ;(files || []).forEach((file, index) => {
      const partName = `part${index}`
      formData.append(partName, file, file.name)
    })
    formData.append(`model`, JSON.stringify(body))

    const result = await http.post('api/services/app/Delivery/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return DeliveryModel.assign(result.data.result)
  }

  public async update(body: any) {
    const result = await http.put('api/services/app/Delivery/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))

    return result.data.result
  }
  public async activateOrDeactivate(id, isActive) {
    const result = await http.post('api/services/app/Delivery/Active', { id }, { params: { isActive } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async delete(id) {
    const result = await http.delete('api/services/app/Delivery/Delete', {
      params: { id }
    })
    return result.data
  }

  public async get(id): Promise<any> {
    const result = await http.get('api/services/app/Delivery/Get', {
      params: { id }
    })
    return DeliveryDetailModel.assign(result.data.result)
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    // if (params.keyword) {
    //   params.keyword = encodeURIComponent(params.keyword)
    // }

    const res = await http.get('api/services/app/Delivery/GetAll', { params })
    const { result } = res.data
    result.items = DeliveryModel.assigns(result.items)
    return result
  }

  public async getListStatus(params): Promise<any> {
    const res = await http.get('api/services/app/Delivery/GetListStatus', {
      params
    })

    return res.data.result
  }
  public async getListTypes(params): Promise<any> {
    const res = await http.get('api/services/app/Delivery/GetListTypes', {
      params
    })
    return res.data.result
  }
  public async getResidentInUnitDelivery(params, returnWithoutModel?: boolean) {
    params.isActive = true
    const response = await http.get('api/services/app/Units/GetUnitUsers', {
      params
    })

    return returnWithoutModel
      ? response.data?.result?.items
      : (response.data?.result?.items || []).map((item) => {
          return new ReceiveModel(
            item.user?.id,
            item.user?.displayName,
            item.user?.phoneNumber ? item.user?.phoneNumber : '',
            item.user?.emailAddress
          )
        })
  }
}

export default new DeliveryService()
