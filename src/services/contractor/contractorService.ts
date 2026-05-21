import { LNotification } from '@lib/abpUtility'
import { notifySuccess, renderDateTime } from '@lib/helper'
import { downloadFile } from '@lib/helperFile'
import { ContractorActivityDetailModel, ContractorDetailModel } from '@models/contractor/contractorModel'

import http from '@services/httpService'
import dayjs from 'dayjs'

class ContractorService {
  public async getAll(params): Promise<any> {
    const res = await http.get('/api/services/app/Contractor/GetAll', {
      params: params
    })
    const { result } = res.data

    return result
  }
  public async create(body) {
    if (!body) {
      return
    }
    const result = await http.post('api/services/app/Contractor/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  public async createUserContractor(body) {
    if (!body) {
      return
    }
    const result = await http.post('api/services/app/UserContractor/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async update(body) {
    if (!body) {
      return
    }
    const result = await http.put('api/services/app/Contractor/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  public async get(id): Promise<any> {
    const result = await http.get('api/services/app/Contractor/Get', {
      params: { id }
    })

    return ContractorDetailModel.assign(result.data.result)
  }

  public async getListFirm(): Promise<any> {
    const result = await http.get('api/services/app/Contractor/GetListFirms')

    return result.data.result
  }

  public async getListStatus(): Promise<any> {
    const result = await http.get('api/services/app/ContractorActivity/GetListStatus')

    return result.data.result
  }

  public async createDocument(body) {
    const result = await http.post('api/services/app/Contractor/CreateDocument', body)
    return result.data.result
  }
  public async updateDocument(body) {
    const result = await http.put('api/services/app/Contractor/UpdateDocument', body)
    return result.data.result
  }

  public async uploadContractor(uniqueId, files: any) {
    const data = new FormData()

    ;(files || []).forEach((file, index) => {
      data.append('file' + index, file)
    })

    const result = await http.post(`api/Documents/UploadContractor`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    return result.data.result
  }

  public async getListDocumentType() {
    const result = await http.get('api/services/app/Contractor/GetListDocumentTypes')

    return result.data.result
  }

  public async activateOrDeactivate(id, isActive) {
    const result = await http.post('api/services/app/Contractor/Active', { id }, { params: { isActive } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async activateOrDeactivateContractorActivity(id, isActive) {
    const result = await http.post('api/services/app/ContractorActivity/Active', { id }, { params: { isActive } })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async deleteContractorContact(contractorContactId) {
    const result = await http.delete('api/services/app/Contractor/DeleteContractorContact', {
      params: { contractorContactId }
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async getAllContractorActivity(params: any) {
    const result = await http.get('api/services/app/ContractorActivity/GetAll', {
      params
    })

    return result.data.result
  }
  public async getContractorActivity(id): Promise<any> {
    const result = await http.get('api/services/app/ContractorActivity/Get', {
      params: { id }
    })

    return ContractorActivityDetailModel.assign(result.data.result)
  }

  public async createContractorActivity(body) {
    if (!body) {
      return
    }
    const result = await http.post('api/services/app/ContractorActivity/Create', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  public async updateContractorActivity(body) {
    if (!body) {
      return
    }
    const result = await http.put('api/services/app/ContractorActivity/Update', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }
  public async getContactByContractor(params): Promise<any> {
    const res = await http.get('api/services/app/Contractor/GetContactByContractor', {
      params: params
    })
    const { result } = res.data
    //result.items = ContractorModel.assign(result.items)

    return result
  }
  public async getContact(id): Promise<any> {
    const result = await http.get('api/services/app/Contractor/GetDetailContractorContact', {
      params: { id }
    })

    return result.data.result
  }

  public async updateContact(body) {
    if (!body) {
      return
    }
    const result = await http.post('api/services/app/Contractor/CreateOrUpdateContractorContact', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return result.data.result
  }

  public async uploadContractorActivity(uniqueId, files: any) {
    const data = new FormData()
    ;(files || []).forEach((file, index) => {
      data.append('file' + index, file)
    })

    const result = await http.post(`api/Documents/UploadContractorActivity`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    return result.data.result
  }
  public async GetStatusActivityByContractor(contractorActivityId): Promise<any> {
    const res = await http.get('api/services/app/ContractorActivity/GetStatusActivityByContractor', {
      params: { contractorActivityId }
    })
    const { result } = res.data

    return result
  }
  public async exportWorkOrder(params: any): Promise<any> {
    const res = await http.get('api/Export/Contractor', {
      params,
      responseType: 'blob'
    })
    downloadFile(res.data, `Contractors_${renderDateTime(dayjs())}.xlsx`)
  }
  public async importFromExcel(file) {
    const data = new FormData()
    data.append('file', file)
    return await http.post('/api/Imports/Contractor/ImportFromExcel', data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
  }

  public async downloadTemplate() {
    const response = await http.get('/api/Imports/Contractor/GetTemplateImport', {
      responseType: 'blob'
    })
    downloadFile(response.data, 'ContractorImportTemplate.xlsx')
  }
}

export default new ContractorService()
