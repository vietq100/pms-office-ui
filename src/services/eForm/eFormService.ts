import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { L, LNotification } from '@lib/abpUtility'
import { notifyError, notifySuccess } from '@lib/helper'
import {
  EFormModel,
  EFormResponseDetailModel,
  EFormResponseModel,
  FormQuestionModel,
  FormQuestionTypeModel,
  FormSectionModel,
  FormTemplateModel
} from '@models/eForm/EFormModel'
import { StatusModel } from '@models/global'

class EFormService {
  public async create(body: FormTemplateModel) {
    const res = await http.post('/api/services/app/Form/AddForm', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return FormTemplateModel.assign(res.data.result)
  }

  public async update(body: any) {
    const res = await http.put('/api/services/app/Form/UpdateTitle', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return FormTemplateModel.assign(res.data.result)
  }

  public async activateOrDeactivate(id: number, isActive) {
    const body = { id, isActive }
    const res = await http.post('/api/services/app/Form/Active', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data
  }

  public async publishOrUnPublish(id: number, isPublish) {
    const body = { id }
    const url = isPublish ? '/api/services/app/Form/UnPublic' : '/api/services/app/Form/Public'
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    const res = await http.post(url, body)
    return res.data
  }

  public async delete(id: number) {
    const res = await http.delete('/api/services/app/Contacts/Active', {
      params: { id }
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data
  }

  public async get(formId): Promise<any> {
    if (!formId) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }
    const result = await http.get('/api/services/app/Form/GetFormDetail', {
      params: { formId }
    })
    return FormTemplateModel.assign(result.data.result)
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('/api/services/app/Form/FilterForm', { params })
    const result = EFormModel.assign(res.data.result)
    return result
  }

  public async filterOptions(params: any): Promise<any> {
    const res = await http.get('/api/services/app/Contacts/GetAll', { params })
    const result = EFormModel.assign(res.data.result)
    return result.items
  }

  public async getQuestionTypes(): Promise<FormQuestionTypeModel[]> {
    const res = await http.get('/api/services/app/FormQuestion/GetQuestionTypes')
    const result = FormQuestionTypeModel.assigns(res.data.result)
    return result
  }

  public async addSection(body: FormSectionModel): Promise<FormSectionModel> {
    const res = await http.post('/api/services/app/FormPage/AddFormPage', body)

    return FormSectionModel.assign(res.data.result)
  }

  public async updateSection(body: FormSectionModel): Promise<FormSectionModel> {
    const res = await http.put('/api/services/app/FormPage/UpdateTitle', body)

    return FormSectionModel.assign(res.data.result)
  }

  public async deleteSection(id: number) {
    const res = await http.delete('/api/services/app/FormPage/Delete', {
      params: { id }
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('DELETE_SUCCESSFULLY'))
    return res.data
  }

  public async addQuestion(body: FormQuestionModel): Promise<FormQuestionModel> {
    const res = await http.post('/api/services/app/FormQuestion/AddQuestion', body)

    return FormQuestionModel.assign(res.data.result)
  }

  public async editQuestion(body: FormQuestionModel): Promise<FormQuestionModel> {
    const res = await http.put('/api/services/app/FormQuestion/UpdateQuestion', body)

    return FormQuestionModel.assign(res.data.result)
  }

  public async deleteQuestion(questionId: number) {
    const res = await http.delete('/api/services/app/FormQuestion/Delete', {
      params: { questionId }
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('DELETE_SUCCESSFULLY'))
    return res.data
  }

  public async updateQuestionOrder(body: any) {
    const res = await http.post('/api/services/app/FormQuestion/Move', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return FormSectionModel.assign(res.data.result)
  }

  public async sortQuestionOrder(body: any) {
    const res = await http.post('/api/services/app/FormQuestion/Sort', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }
  public async getAllResponse(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('/api/services/app/Form/FilterFormManagementResponse4Admin', { params })
    const result = EFormResponseModel.assign(res.data.result)
    return result
  }

  public async getResponseDetail(id): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }
    const result = await http.get('/api/services/app/FormUserAnswer/GetUserAnswer', {
      params: { id }
    })
    return EFormResponseDetailModel.assign(result.data.result)
  }
  public async getResponseStatus(params): Promise<StatusModel[]> {
    const res = await http.get('/api/services/app/Form/GetFormStatus', { params })
    const result = StatusModel.assigns(res.data.result)
    return result
  }

  public async updateResponseStatus(body: any) {
    const res = await http.put('/api/services/app/FormUserAnswer/UpdateUserAnswerStatus', body)
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    return res.data.result
  }
}

export default new EFormService()
