import { action, observable, makeObservable } from 'mobx'
import customerGroupService, { CustomerGroupDto } from '../../services/project/customerGroupService'

class CustomerGroupStore {
  @observable isLoading!: boolean
  @observable customerGroups: CustomerGroupDto[] = []

  constructor() {
    makeObservable(this)
  }

  @action
  async getAll(isActive?: boolean) {
    this.isLoading = true
    this.customerGroups = await customerGroupService.getAll(isActive).finally(() => (this.isLoading = false))
  }

  @action
  async create(body: { code: string; name: string; isActive?: boolean }) {
    this.isLoading = true
    const result = await customerGroupService.create(body).finally(() => (this.isLoading = false))
    return result
  }

  @action
  async update(body: { id: number; name: string; isActive: boolean }) {
    this.isLoading = true
    const result = await customerGroupService.update(body).finally(() => (this.isLoading = false))
    return result
  }

  @action
  async delete(id: number) {
    await customerGroupService.delete(id)
    this.customerGroups = this.customerGroups.filter((x) => x.id !== id)
  }
}

export default CustomerGroupStore
