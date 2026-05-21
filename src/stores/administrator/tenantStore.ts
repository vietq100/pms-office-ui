import { action, makeObservable, observable } from 'mobx'

import CreateTenantInput from '../../services/administrator/tenant/dto/createTenantInput'
import { EntityDto } from '../../services/dto/entityDto'
import { GetAllTenantOutput } from '../../services/administrator/tenant/dto/getAllTenantOutput'
import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import { PagedTenantResultRequestDto } from '../../services/administrator/tenant/dto/PagedTenantResultRequestDto'
import TenantModel from '../../models/Tenants/TenantModel'
import UpdateTenantInput from '../../services/administrator/tenant/dto/updateTenantInput'
import tenantService from '../../services/administrator/tenant/tenantService'

class TenantStore {
  @observable isLoading!: boolean
  @observable tenants!: PagedResultDto<GetAllTenantOutput>
  @observable tenantModel: TenantModel = new TenantModel()
  constructor() {
    makeObservable(this)
  }
  @action
  async create(createTenantInput: CreateTenantInput) {
    await tenantService.create(createTenantInput)
  }

  @action
  async createTenant() {
    this.tenantModel = {
      id: 0,
      isActive: true,
      name: '',
      tenancyName: ''
    }
  }

  @action
  async update(updateTenantInput: UpdateTenantInput) {
    const result = await tenantService.update(updateTenantInput)

    this.tenants.items = this.tenants.items.map((x: GetAllTenantOutput) => {
      if (x.id === updateTenantInput.id) x = result
      return x
    })
  }

  @action
  async delete(entityDto: EntityDto) {
    await tenantService.delete(entityDto)
    this.tenants.items = this.tenants.items.filter((x: GetAllTenantOutput) => x.id !== entityDto.id)
  }

  @action
  async get(entityDto: EntityDto) {
    const result = await tenantService.get(entityDto)
    this.tenantModel = result
  }

  @action
  async getAll(pagedFilterAndSortedRequest: PagedTenantResultRequestDto) {
    this.isLoading = true
    const result = await tenantService.getAll(pagedFilterAndSortedRequest).finally(() => (this.isLoading = false))
    this.tenants = result
  }
}

export default TenantStore
