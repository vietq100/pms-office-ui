import type { PagedResultDto } from '../../dto/pagedResultDto'
import http from '../../httpService'
import { L, LNotification } from '../../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../../lib/helper'
import { AppConfiguration } from '../../../lib/appconst' //, moduleIds
import dayjs from 'dayjs'

class ShopProductService {
  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('api/services/app/Product/GetAll', { params })
    const result = res.data.result
    if (result.items) {
      ;(result.items || []).forEach((item) => {
        item.profilePictureUrl = item.profilePictureId
          ? `${AppConfiguration.remoteServiceBaseUrl}api/services/app/Profile/GetProfilePictureById?profilePictureId=${item.profilePictureId}`
          : null
      })
    }
    return res.data.result
  }
  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('/api/services/app/Product/Get', {
      params: { id }
    })
    if (res.data.result && res.data.result.birthDate) {
      res.data.result.birthDate = dayjs(res.data.result.birthDate)
    }
    return res.data.result
  }

  public async create(body: any) {
    if (body.birthDate) {
      body.birthDate = dayjs(body.birthDate).format('YYYY/MM/DD')
    }

    const res = await http.post('/api/services/app/Product/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    if (res.data.result && res.data.result.birthDate) {
      res.data.result.birthDate = dayjs(res.data.result.birthDate)
    }
    return res.data.result
  }

  public async update(body: any) {
    if (body.birthDate) {
      body.birthDate = dayjs(body.birthDate).format('YYYY/MM/DD')
    }

    const res = await http.put('/api/services/app/Product/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async delete(id: number) {
    const res = await http.delete('/api/services/app/Product/Delete', {
      params: { id }
    })
    return res.data
  }

  public async getProductCategory() {
    const res = await http.get('api/services/app/Product/GetProductCategory')
    return res.data
  }
}

export default new ShopProductService()
