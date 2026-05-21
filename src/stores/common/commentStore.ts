import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import commentService from '../../services/common/commentService'
import fileService from '@services/common/fileService'
import { moduleFile } from '@lib/appconst'

class AuditLogStore {
  @observable isLoading!: boolean
  @observable comments!: PagedResultDto<any>

  constructor() {
    makeObservable(this)
    this.comments = { items: [], totalCount: 0 }
  }

  @action
  async create(body, files) {
    this.isLoading = true
    await commentService
      .create(body)
      .then(async (res) => {
        if (files.length) {
          await fileService.upload(moduleFile.chatMessage, res.uniqueId, files).finally(() => {
            this.isLoading = false
          })
        }
        return res
      })
      .finally(() => {
        this.isLoading = false
      })
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await commentService.getAll(params).finally(() => (this.isLoading = false))
    this.comments = result
  }
}

export default AuditLogStore
