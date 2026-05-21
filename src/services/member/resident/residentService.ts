import type { PagedResultDto } from '../../dto/pagedResultDto'
import http from '../../httpService'
import { L, LNotification } from '../../../lib/abpUtility'
import { notifyError, notifySuccess, renderDateTime } from '../../../lib/helper'
import AppConsts, { AppConfiguration } from '../../../lib/appconst'
import { downloadFile } from '@lib/helperFile'
import { v4 as uuid } from 'uuid'
import { OptionModel } from '@models/global'
import { UserBalanceModel } from '@models/User/IUserModel'
import dayjs from 'dayjs'
const { projectCategoryTarget } = AppConsts

class ResidentService {
  public async create(body: any) {
    if (body.birthDate) {
      body.birthDate = dayjs(body.birthDate).format('YYYY/MM/DD')
    }

    const result = await http.post('api/services/app/Residents/CreateOrUpdate', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body: any) {
    if (body.birthDate) {
      body.birthDate = dayjs(body.birthDate).format('YYYY/MM/DD')
    }

    const result = await http.post('api/services/app/Residents/CreateOrUpdate', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async delete(id: number) {
    const result = await http.delete('api/services/app/Residents/Delete', {
      params: { id }
    })
    return result.data
  }

  public async activateOrDeactivate(id: number, isActive) {
    const result = await http.post('api/services/app/Residents/Active', { id }, { params: { isActive } })
    return result.data
  }

  public async activateOrDeactivateListResident(userIds, isActive) {
    const result = await http.post('api/services/app/Residents/MultipleActive', { userIds, isActive })
    return result.data
  }

  public async deleteListResident(userIds) {
    const result = await http.post('api/services/app/Residents/MultipleDeletes', { userIds })
    return result.data
  }

  public async get(id: number, isShowPhoneEmail: boolean): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const result = await http.get('api/services/app/Residents/GetById', {
      params: { id, isShowPhoneEmail }
    })
    if (result.data.result && result.data.result.birthDate) {
      result.data.result.birthDate = dayjs(result.data.result.birthDate)
    }

    if (result.data.result && result.data.result.identityIssuedOn) {
      result.data.result.identityIssuedOn = dayjs(result.data.result.identityIssuedOn)
    }
    return result.data.result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('api/services/app/Residents/GetAll', { params })
    const { result } = res.data
    ;(result.items || []).forEach((item) => {
      item.profilePictureUrl = item.profilePictureId
        ? `${AppConfiguration.remoteServiceBaseUrl}api/services/app/Profile/GetProfilePictureById?profilePictureId=${item.profilePictureId}`
        : null
      ;(item.units || []).forEach((unit) => {
        unit.fullUnitCode = unit.unit?.fullUnitCode
        unit.projectName = unit.unit?.project?.name
      })
    })
    return result
  }

  public async findByUserName(params: any): Promise<any> {
    const result = await http.get('api/services/app/Residents/GetUserByUsername', { params })
    if (result.data.result && result.data.result.birthDate) {
      result.data.result.birthDate = dayjs(result.data.result.birthDate)
    }
    return result.data.result
  }

  public async getMemberRoles() {
    const result = await http.get('api/services/app/ProjectCategory/GetByTargets', {
      params: { target: projectCategoryTarget.memberRole }
    })
    return (result.data.result || []).map((item) => {
      return { ...item, value: item.id, label: item.name }
    })
  }

  public async getMemberTypes() {
    const result = await http.get('api/services/app/ProjectCategory/GetByTargets', {
      params: { target: projectCategoryTarget.memberType }
    })
    return (result.data.result || []).map((item) => {
      return { ...item, value: item.id, label: item.name }
    })
  }

  public async getResidentUnits(params) {
    const response = await http.get('api/services/app/Units/GetUnitOwner', {
      params
    })
    const { result } = response.data
    ;(result.items || []).map((item) => {
      item.key = uuid()
      return item
    })
    return result
  }

  public async getResidentInUnit(params, returnWithoutModel?: boolean) {
    params.isActive = true
    const response = await http.get('api/services/app/Units/GetUnitUsers', {
      params
    })
    return returnWithoutModel
      ? response.data?.result?.items
      : (response.data?.result?.items || []).map((item) => {
          return new OptionModel(item.userId, item.user?.displayName)
        })
  }

  public async filterOptions(params: any): Promise<any> {
    const result = await http.get('api/services/app/Residents/GetAll', {
      params
    })
    return (result.data?.result?.items || []).map((item) => ({
      value: item.id,
      label: item.displayName,
      emailAddress: item.emailAddress
    }))
  }

  public async exportResidents(params: any): Promise<any> {
    const res = await http.get('api/Export/ExportResident', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `Residents_${renderDateTime(dayjs())}.xlsx`)
  }

  public async sendEmailInstallApp(id): Promise<any> {
    return await http.post('api/services/app/Account/SendResetPassword', { id })
  }
  public async getOverview(params) {
    const res = await http.get('api/services/app/Residents/GetOverviewTenant', {
      params
    })
    return res.data.result
  }

  public async reportResident(params) {
    const res = await http.get('api/services/app/Residents/GetResidentGenderAgeProject', { params })
    return res.data.result
  }

  public async getUserBalance(params): Promise<UserBalanceModel> {
    const result = await http.get('api/services/app/User/GetUserBalanceAmount', { params })
    return UserBalanceModel.assign(result.data.result)
  }

  public async importFromExcel(file, params) {
    const data = new FormData()
    data.append('file', file)
    return await http.post('/api/Imports/Users/ImportFromExcel', data, {
      params,
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
  }

  public async downloadTemplate() {
    const response = await http.get('/api/Imports/Users/GetTemplateImport', {
      responseType: 'blob'
    })
    downloadFile(response.data, 'ResourcesImportTemplate.xlsx')
  }

  public async getNoteResident(id: number): Promise<any> {
    const result = await http.get('api/services/app/Residents/GetNote', {
      params: { id }
    })
    return result.data.result
  }

  public async updateNoteResident(body: any) {
    const result = await http.put('api/services/app/Residents/UpdateNote', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
}

export default new ResidentService()
