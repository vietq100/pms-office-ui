import { action, observable, makeObservable } from 'mobx'
import salesOrganizationService from '../../services/project/salesOrganizationService'
import type { SalesOrganizationDto } from '../../models/Project/Company/CompanyModel'

class SalesOrganizationStore {
  @observable isLoading!: boolean
  @observable salesOrganizations: SalesOrganizationDto[] = []

  constructor() {
    makeObservable(this)
  }

  @action
  async getAll(isActive?: boolean) {
    this.isLoading = true
    this.salesOrganizations = await salesOrganizationService.getAll(isActive).finally(() => (this.isLoading = false))
  }

  @action
  async create(body: { salesOrg: string; companyCode: string; name?: string; isActive?: boolean }) {
    this.isLoading = true
    const result = await salesOrganizationService.create(body).finally(() => (this.isLoading = false))
    await this.getAll()
    return result
  }

  @action
  async update(body: { id: number; name?: string; isActive: boolean }) {
    this.isLoading = true
    const result = await salesOrganizationService.update(body).finally(() => (this.isLoading = false))
    await this.getAll()
    return result
  }

  @action
  async delete(id: number) {
    await salesOrganizationService.delete(id)
    this.salesOrganizations = this.salesOrganizations.filter((x) => x.id !== id)
  }
}

export default SalesOrganizationStore
