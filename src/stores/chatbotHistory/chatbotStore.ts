import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import fileService from '@services/common/fileService'
import { moduleFile } from '@lib/appconst'
import chatbotService from '@services/chatbotHistory/chatbotService'

class ChatbotStore {
  @observable isLoading!: boolean
  @observable tableData!: PagedResultDto<any>
  @observable detailData!: any

  constructor() {
    makeObservable(this)
    this.tableData = { items: [], totalCount: 0 }
    this.detailData = {}
  }

  @action
  async create(body, files) {
    this.isLoading = true
    await chatbotService
      .createAdmin(body)
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
    this.tableData = await chatbotService.getAllAdmin(params).finally(() => (this.isLoading = false))
  }

  @action
  async get(params: any) {
    this.isLoading = true
    this.detailData = await chatbotService.get(params).finally(() => (this.isLoading = false))
  }
}

export default ChatbotStore
