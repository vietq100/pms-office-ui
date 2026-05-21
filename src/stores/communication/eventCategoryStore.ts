import { action, computed, observable, toJS, makeObservable } from 'mobx'
import { Category } from '../../models/category'
import eventCategoryService from '../../services/communication/eventCategoryService'
import type { PagedResultDto } from '../../services/dto/pagedResultDto'

class EventCategoryStore {
  @observable isLoading!: boolean
  @observable totalCount?: number
  @observable pageResult!: PagedResultDto<Category>
  @observable editEventCategory!: Category
  @observable roles: any = []

  constructor() {
    makeObservable(this)
  }
  @action
  async create(body: any) {
    const result = await eventCategoryService.create(body)
    this.pageResult.items.push(result)
  }

  @action
  async update(updateEventInput: any) {
    const result = await eventCategoryService.update(updateEventInput)
    this.pageResult.items = this.pageResult.items.map((x) => {
      if (x.id === updateEventInput.id) x = result
      return x
    })
  }

  @action
  async delete(id: number) {
    await eventCategoryService.delete(id)
    this.pageResult.items = this.pageResult.items.filter((x) => x.id !== id)
  }

  // @action
  // async get(id: number) {
  //   this.editEvent = await eventCategoryService.get(id)
  // }

  @action
  async createEvent() {
    this.editEventCategory = {} as Category
    this.roles = []
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    this.pageResult = await eventCategoryService.getAll(params).finally(() => (this.isLoading = false))
  }

  @computed
  get categories() {
    return this.pageResult ? toJS(this.pageResult.items) : []
  }

  @computed
  get count() {
    return this.pageResult ? this.pageResult.totalCount : 0
  }
}

export default EventCategoryStore
