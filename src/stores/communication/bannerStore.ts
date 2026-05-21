import type { PagedResultDto } from '@services/dto/pagedResultDto'
import { IBanner, BannerModel } from '@models/communication/banner/bannerModel'
import { action, makeObservable, observable } from 'mobx'
import bannerWelcomeService from '@services/communication/bannerService'
import { OptionModel } from '@models/global'
import fileService from '@services/common/fileService'
import { moduleFile } from '@lib/appconst'

class BannerStore {
  @observable pagedData!: PagedResultDto<IBanner>
  @observable isLoading!: boolean
  @observable bannerWelcoms!: IBanner[]
  @observable editBannerWelcome!: IBanner
  @observable bannerTypes!: OptionModel[]

  constructor() {
    this.pagedData = {
      items: [],
      totalCount: 0
    }
    this.bannerTypes = []
    makeObservable(this)
  }

  @action
  async create(body, files?) {
    this.isLoading = true
    this.editBannerWelcome = await bannerWelcomeService.create(body).finally(async () => {
      this.isLoading = !!(files && files.length)
    })
    const { uniqueId } = this.editBannerWelcome
    if (files?.length && uniqueId) {
      await fileService.upload(moduleFile.banner, uniqueId, files).finally(() => {
        this.isLoading = false
      })
    }
  }

  @action
  async update(body, files?) {
    this.isLoading = true
    await bannerWelcomeService.update(body).finally(async () => {
      this.isLoading = !!(files && files.length)
      const { uniqueId } = this.editBannerWelcome
      if (files && files?.length && uniqueId) {
        await fileService.upload(moduleFile.banner, uniqueId, files).finally(() => {
          this.isLoading = false
        })
      }
    })
  }

  @action
  async activateOrDeactivate(id, isActive) {
    await bannerWelcomeService.activateOrDeactivate(id, isActive)
  }

  @action
  async delete(id) {
    await bannerWelcomeService.delete(id)
    this.pagedData.items = this.pagedData.items.filter((x) => x.id !== id)
  }

  @action
  async get(id) {
    const result = await bannerWelcomeService.get(id)
    this.editBannerWelcome = result
  }

  @action
  async createBannerWelcome() {
    this.editBannerWelcome = new BannerModel()
  }

  @action
  async filter(params) {
    this.isLoading = true
    const result = await bannerWelcomeService.filter(params).finally(() => (this.isLoading = false))
    this.pagedData = result
  }

  @action
  async getAll(params) {
    this.isLoading = true
    params.isActive = true
    this.bannerWelcoms = await bannerWelcomeService.getAll(params).finally(() => (this.isLoading = false))
  }

  @action
  async getBannerWelcomeTypes() {
    this.isLoading = true
    this.bannerTypes = await bannerWelcomeService.getBannerWelcomeTypes().finally(() => (this.isLoading = false))
  }
}

export default BannerStore
