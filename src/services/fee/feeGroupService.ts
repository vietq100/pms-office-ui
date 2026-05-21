import type { PagedResultDto } from '@services/dto/pagedResultDto'
import { FeeDetailModel, IFeeGroup, SummaryFee } from '@models/fee'
import http from '@services/httpService'
import { notifySuccess, renderDateTime } from '@lib/helper'
import { L, LNotification } from '@lib/abpUtility'
import dayjs from 'dayjs'

class FeeGroupService {
  async getAll(params): Promise<PagedResultDto<IFeeGroup>> {
    const res = await http.get('/api/services/app/FeeStatement/GetFeePackageCompanies', { params })
    return res.data.result
  }
  async getGroupFee(params): Promise<any> {
    const res = await http.get('/api/services/app/FeeStatement/GetGroupPackageDetail', { params })
    const result = res.data.result
    return FeeDetailModel.assigns(result || [])
  }

  public markGroupStatus(data) {
    return http.post('/api/services/app/FeeStatement/MarkGroupActive', data)
  }

  public markGroupShowToResidents(data) {
    return http.post('/api/services/app/FeeStatement/MarkGroupShowToResident', data)
  }

  public async summary(params) {
    const res = await http.get('/api/services/app/FeeStatement/GetGroupPackageSummary', { params })

    return res.data?.result || []
  }

  public async summaryReservationByFeeTypes(params): Promise<SummaryFee[]> {
    const res = await http.get('/api/services/app/FeeStatement/GetDashboardDeposit', { params })
    const result = res.data?.result || []
    return SummaryFee.assigns(result)
  }

  public async getGroupDetails(params): Promise<PagedResultDto<IFeeGroup>> {
    const res = await http.get('/api/services/app/FeeStatement/GetGroupPackageDetail', { params })
    const result = res.data.result
    return { totalCount: result.length, items: result }
  }

  public async download(params) {
    const response = await http.get('/api/FeeStatements/ExportFeeStatement', {
      params,
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `FeeGroup_${renderDateTime(dayjs())}.xlsx`)
    document.body.appendChild(link)
    link.click()
  }

  public notify(data) {
    return http
      .post('/api/services/app/FeeStatement/SendFeeNotification', data)
      .then(() => notifySuccess(LNotification('SUCCESS'), LNotification(L('FEE_NOTIFICATION_SENT'))))
  }

  public async changeStatusFeeGroup(body) {
    await http.post('/api/services/app/FeeStatement/MarkGroupCompanyPaymentstatus', body)
  }
}

export default new FeeGroupService()
