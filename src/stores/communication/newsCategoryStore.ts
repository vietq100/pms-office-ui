import { action, computed, observable, toJS, makeObservable } from 'mobx'
import { Category } from '../../models/category'
import newsCategoryService from '../../services/communication/newsCategoryService'
import type { PagedResultDto } from '../../services/dto/pagedResultDto'

class NewsCategoryStore {
  @observable isLoading!: boolean
  @observable totalCount?: number
  @observable pageResult!: PagedResultDto<Category>
  @observable editNewsCategory!: Category
  @observable roles: any = []
  constructor() {
    makeObservable(this)
  }
  @action
  async create(body: any) {
    const result = await newsCategoryService.create(body)
    this.pageResult.items.push(result)
  }

  @action
  async update(updateNewsInput: any) {
    const result = await newsCategoryService.update(updateNewsInput)
    this.pageResult.items = this.pageResult.items.map((x) => {
      if (x.id === updateNewsInput.id) x = result
      return x
    })
  }

  @action
  async delete(id: number) {
    await newsCategoryService.delete(id)
    this.pageResult.items = this.pageResult.items.filter((x) => x.id !== id)
  }

  // @action
  // async get(id: number) {
  //   this.editNews = await newsCategoryService.get(id)
  // }

  @action
  async createNews() {
    this.editNewsCategory = {} as Category
    this.roles = []
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    this.pageResult = await newsCategoryService.getAll(params).finally(() => (this.isLoading = false))
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

export default NewsCategoryStore
