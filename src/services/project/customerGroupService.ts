import http from '../httpService'
import { LNotification } from '../../lib/abpUtility'
import { notifySuccess } from '../../lib/helper'

export interface CustomerGroupDto {
  id: number
  code: string
  name: string
  isActive: boolean
}

class CustomerGroupService {
  public async getAll(isActive?: boolean): Promise<CustomerGroupDto[]> {
    const res = await http.get('api/services/app/CustomerGroup/GetAll', {
      params: isActive !== undefined ? { isActive } : {}
    })
    return res.data.result
  }

  public async create(body: { code: string; name: string; isActive?: boolean }) {
    const res = await http.post('api/services/app/CustomerGroup/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async update(body: { id: number; name: string; isActive: boolean }) {
    const res = await http.put('api/services/app/CustomerGroup/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async delete(id: number) {
    const res = await http.delete('api/services/app/CustomerGroup/Delete', { params: { id } })
    return res.data
  }
}

export default new CustomerGroupService()
