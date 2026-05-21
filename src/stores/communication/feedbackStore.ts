import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import feedbackService from '../../services/communication/feedbackService'
import fileService from '../../services/common/fileService'
import { moduleFile, wfFieldTypes } from '../../lib/appconst'
import dayjs from 'dayjs'

class FeedbackStore {
  @observable isLoading!: boolean
  @observable feedbacks!: PagedResultDto<any>
  @observable editFeedback!: any
  @observable feedbackOverview: any[] = []
  @observable filters: any
  constructor() {
    makeObservable(this)
    this.feedbacks = { items: [], totalCount: 0 }
    this.editFeedback = { workflow: {} }
    this.filters = {
      keyword: undefined,
      projectIds: undefined,
      buildingIds: undefined,
      assignedIds: undefined,
      trackerIds: undefined,
      unitIds: undefined,
      statusIds: undefined,
      isActive: 'true',
      skipCount: 0,
      fromDate: undefined,
      toDate: undefined,
      FromLastModificationDate: undefined,
      ToLastModificationDate: undefined
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

  @action async getOverview(params) {
    params.keyword = decodeURIComponent(params?.keyword)
    this.isLoading = true
    this.feedbackOverview = await feedbackService.getOverview(params).finally(() => (this.isLoading = false))
  }
  @action
  async create(body: any, files) {
    this.isLoading = true
    this.editFeedback = await feedbackService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { wfUniqueId } = this.editFeedback
    if (files && files.length && wfUniqueId) {
      await fileService.upload(moduleFile.feedback, wfUniqueId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(updateFeedbackInput: any, files, filesAfter) {
    this.isLoading = true
    await feedbackService.update(updateFeedbackInput).finally(async () => {
      const { wfUniqueId } = this.editFeedback
      this.isLoading = !!(files && files.length && wfUniqueId)
      if (files && files.length && wfUniqueId) {
        await fileService.upload(moduleFile.feedback, wfUniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
      if (filesAfter && filesAfter.length && wfUniqueId) {
        await fileService.upload(moduleFile.feedbackAfters, wfUniqueId, filesAfter).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async delete(id: number) {
    await feedbackService.delete(id)
    this.feedbacks.items = this.feedbacks.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await feedbackService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await feedbackService.get(id)
    this.editFeedback = result
  }

  @action
  async createFeedback(customFields?) {
    this.editFeedback = {
      id: 0,
      displayName: '',
      name: '',
      surname: '',
      emailAddress: '',
      isActive: true,
      roleNames: [],
      password: '',
      isShowToResident: false,
      workflow: {
        customFields: (customFields || []).map((item) => {
          if (item.fieldType === wfFieldTypes.dateTime) {
            item.value = item.defaultValue ? dayjs(item.defaultValue) : null
          } else {
            item.value = item.defaultValue
          }
          return item
        })
      }
    }
  }

  @action
  async getAll(params: any) {
    params.keyword = decodeURIComponent(params?.keyword)
    this.isLoading = true
    const result = await feedbackService.getAll(params).finally(() => (this.isLoading = false))
    this.feedbacks = result
  }

  @action
  async getAllMyFeedback(params: any) {
    params.keyword = decodeURIComponent(params?.keyword)
    this.isLoading = true
    const result = await feedbackService.getAllMyFeedback(params).finally(() => (this.isLoading = false))
    this.feedbacks = result
  }

  @action
  async exportFeedbacks(params: any) {
    this.isLoading = true
    return await feedbackService.exportFeedback(params).finally(() => (this.isLoading = false))
  }
}

export default FeedbackStore
