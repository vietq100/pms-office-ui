import {
  EFormModel,
  EFormResponseDetailModel,
  EFormResponseModel,
  FormQuestionModel,
  FormQuestionTypeModel,
  FormTemplateModel
} from '@models/eForm/EFormModel'
import { StatusModel } from '@models/global'
import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import eFormService from '../../services/eForm/eFormService'

class EFormStore {
  @observable isLoading!: boolean
  @observable pagedData!: PagedResultDto<EFormModel>
  @observable pagedResponseData!: PagedResultDto<EFormResponseModel>
  @observable editEForm!: FormTemplateModel
  @observable editEFormResponse!: EFormResponseDetailModel
  @observable questionTypes!: FormQuestionTypeModel[]
  @observable responseStatus!: StatusModel[]
  @observable filters: any

  constructor() {
    makeObservable(this)
    this.pagedData = { items: [], totalCount: 0 }
    this.editEForm = new FormTemplateModel()
    this.filters = {
      unitId: undefined,
      formId: undefined,
      Status: undefined
    }
  }

  @action setFilers = (params) => {
    this.filters = params
  }
  @action resetFilers = () => {
    this.filters = {
      keyword: '',
      isActive: 'true',
      skipCount: 0
    }
  }

  @action
  async create(body: any) {
    this.isLoading = true
    this.editEForm = await eFormService.create(body).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async update(updateeFormInput: any) {
    this.isLoading = true
    await eFormService.update(updateeFormInput).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async delete(id: number) {
    await eFormService.delete(id)
    this.pagedData.items = this.pagedData.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await eFormService.activateOrDeactivate(id, isActive)
  }

  @action
  async publishOrUnPublish(id: number, isPublish) {
    await eFormService.publishOrUnPublish(id, isPublish)
  }

  @action
  async get(id: number) {
    const result = await eFormService.get(id)
    this.editEForm = result
  }

  @action
  async createEForm() {
    this.editEForm = new FormTemplateModel()
  }

  @action
  async setEForm(editForm) {
    if (!editForm) {
      this.editEForm = new FormTemplateModel()
      return
    }
    this.editEForm = { ...editForm }
  }

  @action
  async addSection(formSection) {
    if (!this.editEForm.formPages) {
      this.editEForm.formPages = []
    }
    const section = await eFormService.addSection(formSection)
    this.editEForm.formPages.push(section)
    this.setEForm(this.editEForm)
  }

  @action
  async updateSection(sectionIndex, formSection) {
    if (!formSection.id) {
      return
    }
    if (!this.editEForm.formPages[sectionIndex]) {
      return
    }
    const section = await eFormService.updateSection(formSection)
    this.editEForm.formPages[sectionIndex].name = section.name
    this.setEForm(this.editEForm)
  }

  @action
  async deleteSection(sectionId) {
    if (!this.editEForm.formPages || this.editEForm.formPages.findIndex((item) => item.id === sectionId) === -1) {
      return
    }
    await eFormService.deleteSection(sectionId)
    this.editEForm.formPages = this.editEForm.formPages.filter((item) => item.id !== sectionId)
    this.setEForm(this.editEForm)
  }

  @action
  async editQuestion(sectionIndex, questionIndex, formQuestion) {
    if (!this.editEForm.formPages || this.editEForm.formPages.length < sectionIndex) {
      return
    }
    if (
      !this.editEForm.formPages[sectionIndex] ||
      !this.editEForm.formPages[sectionIndex].formQuestions ||
      this.editEForm.formPages[sectionIndex].formQuestions.length < questionIndex
    ) {
      return
    }
    const question = await eFormService.editQuestion(formQuestion)
    this.editEForm.formPages[sectionIndex].formQuestions[questionIndex] = question
    this.setEForm(this.editEForm)
  }

  @action
  async addQuestion(formSectionIndex, questionData) {
    if (!this.editEForm.formPages || this.editEForm.formPages.length < formSectionIndex) {
      return
    }
    // Init if there is no question
    if (!this.editEForm.formPages[formSectionIndex].formQuestions) {
      this.editEForm.formPages[formSectionIndex].formQuestions = []
    }
    // Call API to add default question
    const body = new FormQuestionModel(this.editEForm.formPages[formSectionIndex].id, questionData.description)
    const question = await eFormService.addQuestion(body)

    this.editEForm.formPages[formSectionIndex].formQuestions = [
      question,
      ...this.editEForm.formPages[formSectionIndex].formQuestions
    ]

    this.setEForm(this.editEForm)
  }

  @action
  async deleteQuestion(formSectionIndex, questionId) {
    if (
      !this.editEForm.formPages ||
      this.editEForm.formPages[formSectionIndex].formQuestions.findIndex((item) => item.id === questionId) === -1
    ) {
      return
    }
    await eFormService.deleteQuestion(questionId)
    this.editEForm.formPages[formSectionIndex].formQuestions = this.editEForm.formPages[
      formSectionIndex
    ].formQuestions.filter((item) => item.id !== questionId)
    this.setEForm(this.editEForm)
  }

  @action
  async updateQuestionOrder(data) {
    this.isLoading = true
    const formSection = await eFormService.updateQuestionOrder(data).finally(() => (this.isLoading = false))
    const formSectionIndex = this.editEForm.formPages.findIndex((item) => item.id === data.formPageId)
    if (formSectionIndex === -1) {
      return
    }
    this.editEForm.formPages[formSectionIndex] = formSection
    this.setEForm(this.editEForm)
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await eFormService.getAll(params).finally(() => (this.isLoading = false))
    this.pagedData = result
  }

  @action
  async getQuestionTypes() {
    this.isLoading = true
    this.questionTypes = await eFormService.getQuestionTypes().finally(() => (this.isLoading = false))
  }

  @action
  async filterFromResponse(params: any) {
    this.isLoading = true
    const result = await eFormService.getAllResponse(params).finally(() => (this.isLoading = false))
    this.pagedResponseData = result
  }

  @action
  async getResponseDetail(id) {
    const result = await eFormService.getResponseDetail(id)
    this.editEFormResponse = result
  }

  @action
  async getResponseStatus(moduleId) {
    this.isLoading = true
    this.responseStatus = await eFormService.getResponseStatus(moduleId).finally(() => (this.isLoading = false))
  }

  @action
  async updateResponseStatus(id, statusCode) {
    this.isLoading = true
    await eFormService.updateResponseStatus({ id, statusCode }).finally(async () => {
      this.isLoading = false
    })
  }
}

export default EFormStore
