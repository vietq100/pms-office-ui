import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import auditLogService from '../../services/common/auditLogService'

class AuditLogStore {
  @observable isLoading!: boolean
  @observable auditLogs!: PagedResultDto<any>
  constructor() {
    makeObservable(this)
  }
  @action
  async get(id: number) {
    await auditLogService.get(id)
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await auditLogService.getAll(params).finally(() => (this.isLoading = false))
    this.auditLogs = result
  }
}

export default AuditLogStore
