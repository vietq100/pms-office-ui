import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import http from '../httpService'
import { L, LCategory, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess, renderDateTime } from '../../lib/helper'
import AppConsts from '../../lib/appconst'
import { downloadFile } from '@lib/helperFile'
import dayjs from 'dayjs'

const { projectCategoryTarget } = AppConsts

class UnitService {
  public async create(body: any) {
    if (body.handOverDate) {
      body.handOverDate = dayjs(body.handOverDate).format('YYYY/MM/DD')
    }

    const response = await http.post('api/services/app/Units/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return response.data.result
  }

  public async update(body: any) {
    if (body.handOverDate) {
      body.handOverDate = dayjs(body.handOverDate).format('YYYY/MM/DD')
    }

    const response = await http.put('api/services/app/Units/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return response.data.result
  }

  public async updateUnitUser(body: any) {
    const response = await http.put('api/services/app/Units/UpdateUnitUser', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return response.data.result
  }

  public async delete(id: number) {
    const response = await http.delete('api/services/app/Units/Delete', {
      params: { id }
    })
    return response.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const response = await http.post('api/services/app/Units/Active', { id }, { params: { isActive } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return response.data
  }

  public async get(id: number): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/Units/Get', { params: { id } })

    return {
      ...res.data.result,
      handOverDate: res.data.result.handOverDate ? dayjs(res.data.result.handOverDate) : null,
      size: res.data.result.size ? res.data.result.size : 0,
      numOfRoom: res.data.result.numOfRoom ? res.data.result.numOfRoom : 0,
      zoneIds: res.data.result.zones.map((item) => item?.id)
    }
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const response = await http.get('api/services/app/Units/GetAll', { params })
    const result = response.data.result || {}

    return result
  }

  public async filterOptions(params: any): Promise<any> {
    if (!params.maxResultCount) {
      params.maxResultCount = 20
    }
    if (!params.skipCount) {
      params.skipCount = 0
    }

    const result = await http.get('api/services/app/Units/GetAll', { params })
    return (result.data?.result?.items || []).map((item) => ({
      id: item.id,
      fullUnitCode: item.fullUnitCode,
      value: item.id,
      label: item.fullUnitCode,
      projectName: item.project?.name
    }))
  }

  public async getListUnits(params: any): Promise<any> {
    if (!params.maxResultCount) {
      params.maxResultCount = 20
    }
    if (!params.skipCount) {
      params.skipCount = 0
    }

    const result = await http.get('api/services/app/Units/getListUnits', { params })
    return (result.data?.result || []).map((item) => ({
      id: item.id,
      fullUnitCode: item.fullUnitCode,
      value: item.id,
      label: item.fullUnitCode,
      projectName: item.project?.name
    }))
  }

  public async filterAllOptions(params: any): Promise<any> {
    if (!params.maxResultCount) {
      params.maxResultCount = 20
    }
    if (!params.skipCount) {
      params.skipCount = 0
    }

    const result = await http.get('api/services/app/Units/GetLists', { params })
    return (result.data?.result || []).map((item) => ({
      id: item.id,
      fullUnitCode: item.fullUnitCode,
      value: item.id,
      label: item.fullUnitCode,
      projectName: item.project?.name
    }))
  }

  public async getUnitResidents(params: any): Promise<PagedResultDto<any>> {
    const response = await http.get('api/services/app/Units/GetUsers', {
      params
    })
    const { result } = response.data
    ;(result.items || []).map((item) => {
      if (item.type) {
        item.type.displayName = LCategory(`${item.type.target}-${item.type.code}`)
      }
      if (item.role) {
        item.role.displayName = LCategory(`${item.role.target}-${item.role.code}`)
      }
      return item
    })
    return result
  }

  public async moveIn(body: any) {
    const response = await http.post('/api/services/app/Units/MoveIn', body)
    return response.data.result
  }

  public async moveOut(body: any) {
    const response = await http.post('api/services/app/Units/MoveOut', body)
    return response.data.result
  }

  public async getUnitTypes() {
    const response = await http.get('api/services/app/ProjectCategory/GetByTargets', {
      params: { target: projectCategoryTarget.unitType }
    })
    return (response.data.result || []).map((item) => {
      return { ...item, value: item.id, label: item.name }
    })
  }

  public async getUnitUseStatus() {
    const response = await http.get('api/services/app/ProjectCategory/GetByTargets', {
      params: { target: projectCategoryTarget.unitStatus }
    })
    return (response.data.result || []).map((item) => {
      return { ...item, value: item.id, label: item.name }
    })
  }

  public async downloadTemplateImport() {
    const response = await http.get('api/Imports/Units/GetTemplateImport', {
      responseType: 'blob'
    })
    downloadFile(response.data, 'ImportUnitTemplate.xlsx')
  }

  public async importTemplateImport(file) {
    const formData = new FormData()
    formData.append('file', file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    const response = await http.post('api/Imports/Units/ImportFromExcel', formData, config)
    return response.data
  }

  public async uploadEditedUnit(file) {
    const formData = new FormData()
    formData.append('file', file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    const response = await http.post('api/Imports/Units/UpdateFromExcel', formData, config)
    return response.data
  }

  public async getUnits(params) {
    if (!params.skipCount) {
      params.skipCount = 0
    }
    if (!params.maxResultCount) {
      params.maxResultCount = 20
    }
    const response = await http.get('api/services/app/Units/GetUnits', {
      params
    })
    return response.data.result.items
  }

  public async getUnitByProjectIds(projectIds: number[] | number, params = {}) {
    if (projectIds instanceof Array && !projectIds.length) {
      return []
    }

    if (projectIds === -1) {
      return this.getUnits(params)
    }

    return this.getUnits({ ...params, projectIds })
  }

  public async exportUnits(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportUnits', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `Units_${renderDateTime(dayjs())}.xlsx`)
  }

  public async exportUnitUsers(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportUnitUsers', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `Units_User${renderDateTime(dayjs())}.xlsx`)
  }

  public async exportUnitForEdit(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportUnitForEdits', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `UnitDetail_${renderDateTime(dayjs())}.xlsx`)
  }
  public async getOverview(params) {
    const res = await http.get('api/services/app/Units/GetOverviewUnit', {
      params
    })
    return res.data.result
  }

  public async getListUnit(): Promise<any> {
    const res = await http.get('api/services/app/Units/GetAllUnit')
    return res.data.result
  }

  public async getAllUnitByCompanyId(companyId: number): Promise<any> {
    const res = await http.get('api/services/app/Units/GetAllUnitByCompanyId', {
      params: { companyId }
    })
    return res.data.result
  }
}

export default new UnitService()
