import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess, renderDateTime } from '../../lib/helper'
import { RowWorkOrderModel, WorkOrderModel } from '../../models/communication/WorkOrder/WorkOrderModel'
import { downloadFile } from '@lib/helperFile'
import dayjs from 'dayjs'

class workOrderService {
  public async create(body: any) {
    const res = await http.post('api/services/app/WorkOrder/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return WorkOrderModel.assign(res.data.result)
  }

  public async update(body: any) {
    const res = await http.put('api/services/app/WorkOrder/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return WorkOrderModel.assign(res.data.result)
  }

  public async delete(id: number) {
    const res = await http.delete('api/services/app/WorkOrder/Delete', {
      params: { id }
    })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/WorkOrder/Active', {}, { params: { id, isActive } })
    return res.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/WorkOrder/Get', {
      params: { id }
    })
    const result = WorkOrderModel.assign(res.data.result)
    return result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }

    const res = await http.get('api/services/app/WorkOrder/GetAll', { params })
    const { result } = res.data
    result.items = RowWorkOrderModel.assigns(result.items)
    return result
  }

  public async getAllMyWorkOrder(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('api/services/app/WorkOrder/GetAllMyWorkOrder', {
      params
    })
    const { result } = res.data
    result.items = RowWorkOrderModel.assigns(result.items)
    return result
  }

  public async exportWorkOrder(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportWorkOrder', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `JobRequest_${renderDateTime(dayjs())}.xlsx`)
  }

  public async exportWorkOrdersWithImage(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportWorkOrderV1', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `JobRequest_Image_${renderDateTime(dayjs())}.xlsx`)
  }

  public async reportByProject(params: any) {
    // let [fromDate, toDate] = params.dateFromTo || []
    // params.fromDate =  moment(fromDate).toISOString()
    // params.toDate =  moment(toDate).toISOString()
    // delete params.dateFromTo
    const res = await http.get('api/services/app/WorkOrder/GetDashboardStatusByProject', { params })

    return res.data.result.map((item) => {
      return {
        category: item.project?.name,
        status: item.status.map((statusData) => {
          return { name: statusData.status?.name, value: statusData.count }
        })
      }
    })
  }

  public async reportByType(params: any) {
    // let [fromDate, toDate] = params.dateFromTo || []
    // params.fromDate = fromDate ? moment(fromDate).startOf('day').toJSON() : null
    // params.toDate = toDate ? moment(toDate).endOf('day').toJSON() : null
    // delete params.dateFromTo

    const res = await http.get('api/services/app/WorkOrder/GetDashboardStatusByTracker', { params })

    return res.data.result.map((item) => {
      return {
        category: item.tracker?.name,
        status: item.status.map((statusData) => {
          return { name: statusData.status?.name, value: statusData.count }
        })
      }
    })
  }

  public async reportByEmployee(params: any) {
    // let [fromDate, toDate] = params.dateFromTo || []
    // params.fromDate = fromDate ? moment(fromDate).startOf('day').toJSON() : null
    // params.toDate = toDate ? moment(toDate).endOf('day').toJSON() : null
    // delete params.dateFromTo

    const res = await http.get('api/services/app/WorkOrder/GetDashboardStatusByAssigned', { params })

    return res.data.result.map((item, index) => {
      const total = (item.status || []).reduce((sum, status) => {
        return (sum += status.count || 0)
      }, 0)

      return {
        id: index,
        category: item.user?.displayName || L('NOT_ASSIGNED_YET'),
        total,
        status: item.status.map((statusData) => {
          return {
            name: statusData.status?.name,
            value: statusData.count,
            percent: total ? ((statusData.count / total) * 100).toFixed(2) : 0
          }
        })
      }
    })
  }

  public async reportRatingByProject(params: any) {
    // let [fromDate, toDate] = params.dateFromTo || []
    // params.fromDate = fromDate ? moment(fromDate).startOf('day').toJSON() : null
    // params.toDate = toDate ? moment(toDate).endOf('day').toJSON() : null
    // delete params.dateFromTo

    const res = await http.get('api/services/app/WorkOrder/GetDashboardRatingProject', { params })
    const listRating = [0, 1, 2, 3, 4, 5]

    return res.data.result.map((item, index) => {
      const total = (item.ratings || []).reduce((sum, item) => {
        return (sum += item.count || 0)
      }, 0)

      return {
        id: index,
        category: item.project?.name || L('NOT_ASSIGNED_YET'),
        total,
        ratings: listRating.map((rating) => {
          const existRating = (item.ratings || []).find((r) => r.rating === rating)
          return {
            name: rating + '',
            value: existRating?.count || 0,
            percent: total ? (((existRating?.count || 0) / total) * 100).toFixed(2) : 0
          }
        })
      }
    })
  }

  public async reportRatingByEmployee(params: any) {
    // let [fromDate, toDate] = params.dateFromTo || []
    // params.fromDate = fromDate ? moment(fromDate).startOf('day').toJSON() : null
    // params.toDate = toDate ? moment(toDate).endOf('day').toJSON() : null
    // delete params.dateFromTo

    const res = await http.get('api/services/app/WorkOrder/GetDashboardRatingAssigned', { params })
    const listRating = [0, 1, 2, 3, 4, 5]

    return res.data.result.map((item, index) => {
      const total = (item.ratings || []).reduce((sum, item) => {
        return (sum += item.count || 0)
      }, 0)
      const result = {
        id: index,
        category: item.assigned?.displayName || L('NOT_ASSIGNED_YET'),
        total,
        ratings: listRating.map((rating) => {
          const existRating = (item.ratings || []).find((r) => r.rating === rating)
          return {
            name: rating + '',
            value: existRating?.count || 0,
            percent: total ? (((existRating?.count || 0) / total) * 100).toFixed(2) : 0
          }
        })
      }
      result.ratings.forEach((rating) => {
        result[rating.name] = rating.value
        result[rating.name + 'percent'] = rating.percent
      })
      return result
    })
  }

  public async reportByStatus(params: any) {
    // let [fromDate, toDate] = params.dateFromTo || []
    // params.fromDate = fromDate ? moment(fromDate).startOf('day').toJSON() : null
    // params.toDate = toDate ? moment(toDate).endOf('day').toJSON() : null
    // delete params.dateFromTo

    const res = await http.get('api/services/app/WorkOrder/GetDashboardStatus', { params })

    return res.data.result.map((item) => {
      return {
        category: item.status?.name,
        value: item.count
      }
    })
  }

  public async getOverview(params: any): Promise<any> {
    const result = await http.get('api/services/app/Workorder/GetOverviewWorkOrder', {
      params
    })
    return result.data.result
  }
}

export default new workOrderService()
