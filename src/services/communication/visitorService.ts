import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess, renderDateTime } from '../../lib/helper'
import { RowVisitorModel, VisitorModel, VisitorReasonModel } from '../../models/communication/Visitor/VisitorModel'
import { downloadFile } from '@lib/helperFile'
import dayjs from 'dayjs'

class visitorService {
  public async create(body: any) {
    const res = await http.post('api/services/app/Visitors/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return VisitorModel.assign(res.data.result)
  }

  public async update(body: any) {
    const res = await http.put('api/services/app/Visitors/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return VisitorModel.assign(res.data.result)
  }

  public async delete(id: number) {
    const res = await http.delete('api/services/app/Visitors/Delete', {
      params: { id }
    })
    return res.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const res = await http.post('api/services/app/Visitors/Active', { id }, { params: { isActive } })
    return res.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/Visitors/Get', {
      params: { id }
    })
    const result = VisitorModel.assign(res.data.result)
    return result
  }

  public async getVisitReasons(): Promise<any> {
    const params = { isActive: true, type: 'VISITOR' }
    const res = await http.get('api/services/app/Categories/GetLists', {
      params
    })
    const result = VisitorReasonModel.assigns(res.data.result)
    return result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }
    const res = await http.get('api/services/app/Visitors/GetAll', { params })
    const { result } = res.data
    result.items = RowVisitorModel.assigns(result.items)
    return result
  }

  public async getAllMyVisitor(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('api/services/app/Visitors/GetAllMyVisitor', {
      params
    })
    return res.data.result
  }

  public async exportVisitor(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportVisitor', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `Visitor_${renderDateTime(dayjs())}.xlsx`)
  }

  public async importFromExcel(file) {
    const data = new FormData()
    data.append('file', file)
    return await http.post('/api/Imports/Visitor/ImportFromExcel', data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
  }

  public async downloadTemplate() {
    const response = await http.get('/api/Imports/Visitor/GetTemplateImport', {
      responseType: 'blob'
    })
    downloadFile(response.data, 'VisitorImportTemplate.xlsx')
  }
}

export default new visitorService()
