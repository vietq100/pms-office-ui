import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import visitorService from '../../services/communication/visitorService'
import fileService from '../../services/common/fileService'
import { moduleFile } from '../../lib/appconst'
import dayjs from 'dayjs'

class VisitorStore {
  @observable isLoading!: boolean
  @observable visitors!: PagedResultDto<any>
  @observable visitReasons!: any[]
  @observable editVisitor!: any

  constructor() {
    makeObservable(this)
    this.visitors = { items: [], totalCount: 0 }
    this.editVisitor = { workflow: {} }
  }

  @action
  async create(body: any, files) {
    this.isLoading = true
    this.editVisitor = await visitorService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { wfUniqueId } = this.editVisitor
    if (files && files.length && wfUniqueId) {
      await fileService.upload(moduleFile.visitor, wfUniqueId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(updateVisitorInput: any, files) {
    this.isLoading = true
    await visitorService.update(updateVisitorInput).finally(async () => {
      const { wfUniqueId } = this.editVisitor
      this.isLoading = !!(files && files.length && wfUniqueId)
      if (files && files.length && wfUniqueId) {
        await fileService.upload(moduleFile.visitor, wfUniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async delete(id: number) {
    await visitorService.delete(id)
    this.visitors.items = this.visitors.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await visitorService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number) {
    const result = await visitorService.get(id)
    this.editVisitor = result
  }

  @action
  async getVisitReasons() {
    const result = await visitorService.getVisitReasons()
    this.visitReasons = result
  }

  @action
  async createVisitor() {
    this.editVisitor = {
      id: 0,
      isActive: true,
      registerTime: dayjs()
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await visitorService.getAll(params).finally(() => (this.isLoading = false))
    this.visitors = result
  }

  @action
  async getAllMyVisitor(params: any) {
    this.isLoading = true
    const result = await visitorService.getAllMyVisitor(params).finally(() => (this.isLoading = false))
    this.visitors = result
  }

  @action
  async exportVisitors(params: any) {
    this.isLoading = true
    return await visitorService.exportVisitor(params).finally(() => (this.isLoading = false))
  }

  @action
  async importFromExcel(file) {
    return await visitorService.importFromExcel(file)
  }
  @action
  async downloadTemplate() {
    return visitorService.downloadTemplate()
  }
}

export default VisitorStore
