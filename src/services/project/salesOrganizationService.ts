import http from '../httpService'
import { LNotification } from '../../lib/abpUtility'
import { notifySuccess } from '../../lib/helper'
import type { SalesOrganizationDto } from '../../models/Project/Company/CompanyModel'

class SalesOrganizationService {
  public async getAll(isActive?: boolean): Promise<SalesOrganizationDto[]> {
    const res = await http.get('api/services/app/SalesOrganization/GetAll', {
      params: isActive !== undefined ? { isActive } : {}
    })
    return res.data.result
  }

  public async create(body: { salesOrg: string; companyCode: string; name?: string; isActive?: boolean }) {
    const res = await http.post('api/services/app/SalesOrganization/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async update(body: { id: number; name?: string; isActive: boolean }) {
    const res = await http.put('api/services/app/SalesOrganization/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }

  public async delete(id: number) {
    const res = await http.delete('api/services/app/SalesOrganization/Delete', { params: { id } })
    return res.data
  }
}

export default new SalesOrganizationService()
