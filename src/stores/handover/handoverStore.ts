import { L } from '@lib/abpUtility'
import { notifySuccess } from '@lib/helper'
import { StatusModel } from '@models/global'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import eFormService from '@services/eForm/eFormService'
import handoverService from '@services/handover/handoverService'
import dayjs from 'dayjs'
import { action, makeObservable, observable } from 'mobx'

class HandoverStore {
  @observable isLoading = false
  @observable planHandoverList: PagedResultDto<any> = {
    items: [],
    totalCount: 0
  }
  @observable notificationProcess: any = {
    items: [],
    totalCount: 0,
    totalSentViaEmailCount: 0,
    totalSentViaDeviceCount: 0
  }
  @observable handoverPublicBookingList: any[] = []
  @observable planHandoverDetail?: any
  @observable statusOptions: any[] = []
  @observable handoverPlanStatus!: any
  @observable reservationHandoverList: PagedResultDto<any> = {
    items: [],
    totalCount: 0
  }
  @observable reservationHandoverDetail?: any
  @observable reservationHandoverStatus: any[] = []
  @observable reservationHandoverOverview: any[] = []
  @observable handoverPublicUser: any
  @observable timeSlots: any[] = []
  @observable handoverPlanOverview: any[] = []
  @observable handOverReservationBindingData: any = ''
  @observable handoverPlanSetting: any[] = []

  @observable handoverCheckList: PagedResultDto<any> = {
    items: [],
    totalCount: 0
  }
  @observable defectList: PagedResultDto<any> = {
    items: [],
    totalCount: 0
  }
  @observable defectDetail: any

  @observable formListQuesion: any

  @observable formAnswerInfo: any

  @observable listQuestionByForm: any

  @observable handOverCheckListStatus!: StatusModel[]

  constructor() {
    makeObservable(this)
  }

  @action public getHandoverPlanSetting = async () => {
    this.isLoading = true
    this.handoverPlanSetting = await handoverService.getHandoverPlanSetting().finally(() => (this.isLoading = false))
  }
  @action public updateHandoverPlanSetting = async (body) => {
    this.isLoading = true
    await handoverService.updateHandoverPlanSetting(body).finally(() => (this.isLoading = false))
  }

  @action public getTimeSlots = async (handoverId, handoverDate) => {
    this.isLoading = true
    this.timeSlots = await handoverService
      .getPublicTimeSlot(handoverId, handoverDate)
      .finally(() => (this.isLoading = false))
  }
  @action public getHandoverPublicUser = async (id) => {
    this.isLoading = true
    this.handoverPublicUser = await handoverService.getHandoverPublicUser(id).finally(() => (this.isLoading = false))
  }
  @action public getHandoverPublicBookingList = async (token) => {
    this.isLoading = true
    this.handoverPublicBookingList = await handoverService
      .getHandoverPublicBookingList(token)
      .finally(() => (this.isLoading = false))
  }
  @action public getRevervationHandoverStatus = async () => {
    this.reservationHandoverStatus = await handoverService.getReservationStatus({})
  }

  @action public getAllResponse = async (params) => {
    this.isLoading = true
    const result = await eFormService.getAllResponse(params).finally(() => (this.isLoading = false))
    this.handoverCheckList = result
  }

  @action public GetInfoFormUserAnswer = async (id) => {
    this.isLoading = true

    const result = await handoverService.getResponseDetail(id).finally(() => (this.isLoading = false))

    this.formAnswerInfo = result
  }

  @action public getFormListQuesion = async (params) => {
    this.isLoading = true
    const result = await eFormService.getAll(params).finally(() => (this.isLoading = false))

    this.formListQuesion = result.items
  }

  @action public getListQuesionByIdForm = async (id) => {
    this.isLoading = true
    const result = await eFormService.get(id).finally(() => (this.isLoading = false))

    this.listQuestionByForm = result
  }

  @action public updateUserAnswerForm = async (body) => {
    await handoverService.updateUserAnswer(body).finally(() => (this.isLoading = false))
    return notifySuccess(L('SUCCESSFULLY'), L('CREATE_SUCCESSFULLY'))
  }

  @action public createUserAnswerForm = async (body) => {
    await handoverService.createUserAnswerForm(body).finally(() => (this.isLoading = false))
    return notifySuccess(L('SUCCESSFULLY'), L('CREATE_SUCCESSFULLY'))
  }

  @action
  public getStatusOption = async () => {
    this.isLoading = true
    this.statusOptions = await handoverService.getListStatus().finally(() => (this.isLoading = false))
  }

  async getHandOverCheckListStatus(moduleId) {
    this.isLoading = true
    this.handOverCheckListStatus = await eFormService
      .getResponseStatus(moduleId)
      .finally(() => (this.isLoading = false))
  }

  @action
  public getAllPlanHandover = async (params) => {
    this.isLoading = true
    const res = await handoverService.getAllHandoverPlans(params).finally(() => (this.isLoading = false))
    this.planHandoverList = res
  }
  @action
  public getNotificationProcess = async (params) => {
    this.isLoading = true
    const res = await handoverService.getNotificationProcess(params).finally(() => (this.isLoading = false))
    this.notificationProcess = res
  }

  @action public getPlanHandoverDetail = async (id) => {
    this.isLoading = true
    this.planHandoverDetail = await handoverService.getHandoverPlanDetail(id).finally(() => (this.isLoading = false))
    const returnData = {
      ...this.planHandoverDetail,
      assignUserIds: (this.planHandoverDetail.assignUsers || []).map((user) => user.id),
      unitIds: (this.planHandoverDetail.units || []).map((unit) => unit.id),
      handOverDate: dayjs(this.planHandoverDetail.handOverDate),
      handoverTime: [dayjs(this.planHandoverDetail.fromDate), dayjs(this.planHandoverDetail.toDate)]
    }
    return returnData
  }

  @action
  public createPlanHandover = async (body) => {
    this.isLoading = true
    body.fromDate = body.handoverTime[0] ?? null
    body.toDate = body.handoverTime[1] ?? null
    await handoverService.createHandoverPlan(body).finally(() => (this.isLoading = false))
    return notifySuccess(L('SUCCESSFULLY'), L('CREATE_SUCCESSFULLY'))
  }
  @action
  public updatePlanHandover = async (body) => {
    // this.isLoading = true
    const currentIds = this.planHandoverDetail.units.map((i) => i.id)
    const unitIncludeIds = body.unitIds.filter((id) => !currentIds.includes(id))
    const unitExcludeIds = currentIds.filter((id) => !body.unitIds.includes(id))
    await handoverService
      .updateHandoverPlan({
        ...this.planHandoverDetail,
        ...body,
        unitIncludeIds,
        unitExcludeIds
      })
      .finally(() => (this.isLoading = false))
    return notifySuccess(L('SUCCESSFULLY'), L('UPDATE_SUCCESSFULLY'))
  }

  @action
  public checkUnitStatus = async (body) => {
    this.isLoading = true
    this.handoverPlanStatus = await handoverService.checkUnitStatus(body).finally(() => (this.isLoading = false))
  }

  @action
  public getAllReservationHandover = async (params) => {
    this.isLoading = true
    const res = await handoverService.getAllReservationHandover(params).finally(() => (this.isLoading = false))
    this.reservationHandoverList = res
  }
  @action public getReservationHandoverDetail = async (id) => {
    this.isLoading = true
    this.reservationHandoverDetail = await handoverService
      .getReservationHandoverDetail(id)
      .finally(() => (this.isLoading = false))
    return this.reservationHandoverDetail
  }
  @action public getReservationHandoverOverview = async (params) => {
    this.isLoading = true
    this.reservationHandoverOverview = await handoverService
      .getReservationHandoverOverview(params)
      .finally(() => (this.isLoading = false))
    return
  }

  @action public checkHandoverPlanByUnit = async (unitId) => {
    const res = await handoverService.checkHandoverPlanByUnit(unitId)
    return res
  }
  @action
  public createHandoverReservation = async (body, files?) => {
    this.isLoading = true
    await handoverService.createHandoverReservation(body, files).finally(() => (this.isLoading = false))
    return notifySuccess(L('SUCCESSFULLY'), L('CREATE_SUCCESSFULLY'))
  }

  @action
  public updateHandoverReservation = async (body, files?) => {
    this.isLoading = true
    await handoverService
      .updateHandoverReservation(
        {
          assignUserId: body.assignUserId,
          statusId: body.statusId,
          id: this.reservationHandoverDetail.id,
          description: body.description
        },
        files
      )
      .finally(() => (this.isLoading = false))
    return notifySuccess(L('SUCCESSFULLY'), L('UPDATE_SUCCESSFULLY'))
  }
  @action
  public handleComplete = async (id, params) => {
    this.isLoading = true
    await handoverService.handleComplete({ id }).finally(() => (this.isLoading = false))
    notifySuccess(L('SUCCESSFULLY'), L('UPDATE_SUCCESSFULLY'))
    this.getAllReservationHandover(params)
  }
  @action
  public createReservation = async (body) => {
    this.isLoading = true
    await handoverService.createReservation(body).finally(() => (this.isLoading = false))
    notifySuccess(L('SUCCESSFULLY'), L('UPDATE_SUCCESSFULLY'))
  }
  @action
  public export = async (body) => {
    this.isLoading = true
    await handoverService.export(body).finally(() => (this.isLoading = false))
    notifySuccess(L('SUCCESSFULLY'), L('EXPORT_SUCCESSFULLY'))
  }
  @action
  public getHandoverPlanOverview = async (params) => {
    this.isLoading = true
    const res = await handoverService.getHandoverPlanOverview(params).finally(() => (this.isLoading = false))
    this.handoverPlanOverview = res
  }

  @action
  public getHandOverReservationBindingData = async (params) => {
    this.isLoading = true
    const res = await handoverService.getHandOverReservationBindingData(params).finally(() => (this.isLoading = false))
    this.handOverReservationBindingData = res
  }

  @action
  public getAllDefect = async (params) => {
    this.isLoading = true
    const res = await handoverService
      .getAllDefect({ ...params, type: 3, moduleId: 51 })
      .finally(() => (this.isLoading = false))
    this.defectList = res
  }

  @action
  public getDetailDefect = async (params) => {
    this.isLoading = true
    const res = await handoverService.getDetailDefect(params).finally(() => (this.isLoading = false))
    this.defectDetail = res
  }
}

export default HandoverStore
