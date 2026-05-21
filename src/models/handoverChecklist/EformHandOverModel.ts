import { moduleIds, QUESTION_TYPES } from '@lib/appconst'

import { OptionModel, StatusModel } from '@models/global'
import { UserModel } from '@models/User/IUserModel'
import dayjs from 'dayjs'

export interface IEFormModel {
  id: number
  formName: string
  description: string
  projectId?: number
  statusCode?: string
}

export class EFormModel implements IEFormModel {
  id: number
  formName: string
  description: string
  projectId?: number
  isActive: boolean
  statusCode?: string

  constructor() {
    this.id = 0
    this.formName = ''
    this.description = ''
    this.isActive = true
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new EFormModel(), obj)
    newObj.statusCode = obj.status?.code
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export interface IFormQuestionTypeModel {
  id: number
  name: string
  description?: string
  hasOption?: boolean
}

export class FormQuestionTypeModel implements IFormQuestionTypeModel {
  id: number
  name: string
  description: string
  projectId?: number
  isActive: boolean

  constructor() {
    this.id = 0
    this.name = ''
    this.description = ''
    this.isActive = true
  }

  public static assign(obj) {
    if (!obj) return undefined

    return Object.assign(new FormQuestionTypeModel(), obj)
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export interface IFormSectionModel {
  id: number
  formId?: number
  name: string
  formQuestions: IFormQuestionModel[]
  isActive?: boolean
}

export class FormSectionModel implements IFormSectionModel {
  id: number
  formId: number
  name: string
  formQuestions: IFormQuestionModel[]
  isActive?: boolean
  constructor(formId?, formSectionIndex?) {
    this.id = 0
    this.formId = formId || 0
    this.name = `Section ${formSectionIndex}`
    this.formQuestions = []
  }

  public static assign(obj, responseAnswers?) {
    if (!obj) return undefined

    const newObj = Object.assign(new FormSectionModel(), obj)
    newObj.formQuestions = FormQuestionModel.assigns(obj.formQuestions, responseAnswers)
    return newObj
  }

  public static assigns(objs, responseAnswers?) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item, responseAnswers)))
    return results
  }
}

export interface IFormQuestionModel {
  id: number
  formPageId: number
  isMandatory?: boolean
  isAllowComment?: boolean
  isImage?: boolean
  label?: string
  labelFrom?: string
  labelTo?: string
  questionTypeId: number
  questionType?: IFormQuestionTypeModel
  hasOptions?: boolean
  description: string
  answers?: any[]
  responseAnswer?: IEFormResponseAnswerModel
}

export class FormQuestionModel implements IFormQuestionModel {
  id: number
  formPageId: number
  isMandatory?: boolean
  isAllowComment?: boolean
  isImage?: boolean
  label?: string
  labelFrom?: string
  labelTo?: string
  questionTypeId: number
  questionType?: IFormQuestionTypeModel
  hasOptions?: boolean
  description: string
  answers?: any[]
  responseAnswer?: EFormResponseAnswerModel

  constructor(_formPageId?, _question?) {
    this.id = 0
    this.formPageId = _formPageId || 0
    this.isMandatory = false
    this.isAllowComment = false
    this.isImage = false
    this.description = _question || 'Please input new question'
    this.questionTypeId = QUESTION_TYPES[3].id
    this.questionType = QUESTION_TYPES[3]
  }

  public static assign(obj, responseAnswers?) {
    if (!obj) return undefined

    const newObj = Object.assign(new FormQuestionModel(), obj)
    newObj.questionTypeId = obj.questionType?.id
    newObj.answers = OptionModel.assigns(obj.answers)
    newObj.responseAnswer = responseAnswers ? EFormResponseAnswerModel.assign(responseAnswers[obj.id]) : undefined
    return newObj
  }

  public static assigns(objs, responseAnswers?) {
    const results: any[] = []
    ;(objs || []).forEach((item) => results.push(this.assign(item, responseAnswers)))
    return results
  }
}

export interface IFormTemplateModel {
  id: number
  formName: string
  description: string
  formPages: IFormSectionModel[]
}

export class FormTemplateModel implements IFormTemplateModel {
  id: number
  formName: string
  description: string
  formPages: IFormSectionModel[]
  moduleId: number

  constructor() {
    this.id = 0
    this.formName = ''
    this.description = ''
    this.formPages = []
    this.moduleId = moduleIds.eform
  }
  public static assign(obj, responseAnswers?) {
    if (!obj) return undefined

    const newObj = Object.assign(new FormTemplateModel(), obj)
    newObj.formPages = FormSectionModel.assigns(obj.formPages, responseAnswers)
    return newObj
  }

  public static assigns(objs, responseAnswers?) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item, responseAnswers)))
    return results
  }
}

export interface IEFormResponseAnswerModel {
  id: number
  questionId: number
  answerContent?: string
  answerDate?: string
  answerNumeric?: number
  comment?: string
  images?: any[]
  options?: any[]
  optionIds?: number[]
}

export class EFormResponseAnswerModel implements IEFormResponseAnswerModel {
  id: number
  questionId: number
  answerContent?: string
  answerDate?: string
  answerNumeric?: number
  comment?: string
  images?: any[]
  imageNames?: any[]
  options?: any[]
  optionIds?: number[]

  constructor() {
    this.id = 0
    this.questionId = 0
    this.answerContent = ''
    this.comment = ''
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new EFormModel(), obj)
    newObj.statusCode = obj.status?.code
    newObj.answerDate = obj.answerDate ? dayjs(new Date(obj.answerDate)) : null
    newObj.imageNames = obj.images.map((item) => item?.imageGuid) ?? []
    newObj.options = OptionModel.assigns(obj.options)
    newObj.optionIds = (obj.options || []).map((item) => item.answerId)
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export interface IEFormResponseModel {
  id: number
  name: string
  description: string
  projectId?: number
  statusCode?: string
}

export class EFormResponseModel implements IEFormResponseModel {
  id: number
  name: string
  description: string
  projectId?: number
  isActive: boolean
  statusCode?: string
  fullUnitCode: string

  constructor() {
    this.id = 0
    this.name = ''
    this.description = ''
    this.fullUnitCode = ''
    this.isActive = true
  }

  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new EFormModel(), obj)
    newObj.statusCode = obj.status?.code
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export interface IEFormResponseDetailModel {
  id: number
  uniqueId: string
  name: string
  description: string
  projectId?: number
  isActive: boolean
  statusCode?: string
  fullUnitCode?: string
  unitId?: number
  moduleId?: number
  parentId?: number
  form?: FormTemplateModel
  status?: StatusModel
  answers?: EFormResponseAnswerModel[]
  responseAnswer?: any
  userAnswer?: UserModel
}

export class EFormHandOverlModel implements IEFormResponseDetailModel {
  id: number
  uniqueId: string
  name: string
  description: string
  projectId?: number
  isActive: boolean
  statusCode?: string
  statusId?: number
  fullUnitCode?: string
  unitId?: number
  moduleId?: number
  parentId?: number
  form?: FormTemplateModel
  status?: StatusModel
  answers?: EFormResponseAnswerModel[]
  responseAnswer?: any
  userAnswer?: UserModel
  formPrinting?: any
  constructor() {
    this.id = 0
    this.uniqueId = ''
    this.name = ''
    this.description = ''
    this.fullUnitCode = ''
    this.isActive = true
  }

  public static assign(obj) {
    if (!obj) return undefined
    const newObj = Object.assign(new EFormModel(), obj)
    newObj.status = StatusModel.assign(obj.status)
    newObj.statusId = obj.status?.id ?? null
    newObj.statusCode = obj.status?.code ?? null
    newObj.answers = EFormResponseAnswerModel.assigns(obj.answers) || []
    newObj.responseAnswer = newObj.answers.reduce((data, item) => {
      data[item.questionId] = { ...item }
      return data
    }, {})
    newObj.form = FormTemplateModel.assign(obj.form, newObj.responseAnswer)
    newObj.formPrinting = obj.form.formPages
    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}
