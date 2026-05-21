import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess } from '../../lib/helper'
import { PositionApprovalModel, RowPositionApprovalModel } from '@models/approvalWorkflow/position/positionModel'

class approvalWorkflowService {
  public async create(body: any) {
    await http.post('api/services/app/Position/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  public async update(body: any) {
    await http.put('api/services/app/Position/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  public async delete(id: number) {
    const res = await http.delete('api/services/app/Contracts/Delete', {
      params: { id }
    })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/Position/Active', { id, isActive })
    return res.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/Position/Get', {
      params: { id }
    })
    const result = PositionApprovalModel.assign(res.data.result)
    return result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/Position/GetAll', {
      params
    })
    const { result } = res.data
    result.items = RowPositionApprovalModel.assigns(result.items)
    return result
  }
}

export default new approvalWorkflowService()
