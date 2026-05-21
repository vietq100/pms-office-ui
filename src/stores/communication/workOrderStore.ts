import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import workOrderService from '../../services/communication/workOrderService'
import fileService from '../../services/common/fileService'
import { moduleFile, wfFieldTypes } from '../../lib/appconst'
import dayjs from 'dayjs'

class WorkOrderStore {
  @observable isLoading!: boolean
  @observable workOrders!: PagedResultDto<any>
  @observable editWorkOrder!: any
  @observable workOrderOverview: any[] = []
  @observable filters: any
  constructor() {
    makeObservable(this)
    this.workOrders = { items: [], totalCount: 0 }
    this.editWorkOrder = { workflow: {} }
    this.filters = {
      keyword: '',
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
    this.workOrderOverview = await workOrderService.getOverview(params).finally(() => (this.isLoading = false))
  }
  @action
  async create(body: any, files) {
    this.isLoading = true
    this.editWorkOrder = await workOrderService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { wfUniqueId } = this.editWorkOrder
    if (files && files.length && wfUniqueId) {
      await fileService.upload(moduleFile.workOrder, wfUniqueId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(updateWorkOrderInput: any, files, filesAfter) {
    this.isLoading = true
    await workOrderService.update(updateWorkOrderInput).finally(async () => {
      const { wfUniqueId } = this.editWorkOrder
      this.isLoading = !!(files && files.length && wfUniqueId)
      if (files && files.length && wfUniqueId) {
        await fileService.upload(moduleFile.workOrder, wfUniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
      if (filesAfter && filesAfter.length && wfUniqueId) {
        await fileService.upload(moduleFile.workOrderAfters, wfUniqueId, filesAfter).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async delete(id: number) {
    await workOrderService.delete(id)
    this.workOrders.items = this.workOrders.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await workOrderService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await workOrderService.get(id)
    this.editWorkOrder = result
  }

  @action
  async createWorkOrder(customFields?) {
    this.editWorkOrder = {
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
    const result = await workOrderService.getAll(params).finally(() => (this.isLoading = false))
    this.workOrders = result
  }

  @action
  async getAllMyWorkOrder(params: any) {
    params.keyword = decodeURIComponent(params?.keyword)
    this.isLoading = true
    const result = await workOrderService.getAllMyWorkOrder(params).finally(() => (this.isLoading = false))
    this.workOrders = result
  }

  @action
  async exportWorkOrders(params: any) {
    this.isLoading = true
    return await workOrderService.exportWorkOrder(params).finally(() => (this.isLoading = false))
  }
  @action
  async exportWorkOrdersWithImage(params: any) {
    this.isLoading = true
    return await workOrderService.exportWorkOrdersWithImage(params).finally(() => (this.isLoading = false))
  }
}

export default WorkOrderStore
