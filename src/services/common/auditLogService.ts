import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L } from '../../lib/abpUtility'
import { notifyError } from '../../lib/helper'
import { moduleIds } from '../../lib/appconst'

class AuditLogService {
  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const result = await http.get('api/services/app/Residents/Get', {
      params: { id }
    })
    return result.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    let url = ''
    switch (params.moduleId) {
      case moduleIds.workOrder: {
        url = 'api/services/app/WorkOrder/GetAuditLogs'
        break
      }
      case moduleIds.reservation: {
        url = 'api/services/app/Reservation/GetAuditLog'
        break
      }
      case moduleIds.feedback: {
        url = 'api/services/app/Feedback/GetAuditLogs'
        break
      }
      case moduleIds.staff: {
        url = '/api/services/app/Employees/GetAuditLog'
        break
      }
      case moduleIds.resident: {
        url = '/api/services/app/Residents/GetAuditLog'
        break
      }
      default: {
        url = 'api/services/app/Workflow/GetAuditLogs'
      }
    }
    if (params.moduleId === moduleIds.staff || params.moduleId === moduleIds.resident) {
      const res = await http.get(url, { params: { id: params.id } })
      const result = (res.data.result || []).map((row) => {
        ;(row.items || []).forEach((item) => {
          item.propertyName = L(item.propertyName)
          return item
        })
        return row
      })
      return { items: result, totalCount: result.length }
    } else {
      const res = await http.get(url, { params })
      const result = (res.data.result || []).map((row) => {
        ;(row.items || []).forEach((item) => {
          item.propertyName = L(item.propertyName)
          return item
        })
        return row
      })
      return { items: result, totalCount: result.length }
    }
  }
}

export default new AuditLogService()
