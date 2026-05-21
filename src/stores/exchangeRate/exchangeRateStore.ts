import { action, observable, makeObservable } from 'mobx'
import exchangeRateService from '@services/exchangeRate/exchangeRateService'

class ExchangeRateStore {
  @observable isLoading!: boolean
  @observable listExchangeRate!: any[]

  constructor() {
    this.listExchangeRate = []

    makeObservable(this)
  }

  @action
  async create(body: any) {
    this.isLoading = true
    await exchangeRateService.create(body)

    this.isLoading = false
  }

  @action
  async update(body: any) {
    this.isLoading = true
    await exchangeRateService.update(body)

    this.isLoading = false
  }

  @action
  async getAll() {
    this.isLoading = true
    this.listExchangeRate = await exchangeRateService.getAll().finally(() => (this.isLoading = false))
  }

  @action
  async activateOrDeactivate(id: number, isActive: boolean) {
    await exchangeRateService.activateOrDeactivate(id, isActive)
    if (isActive) {
      this.listExchangeRate = this.listExchangeRate.filter((item) => item.id !== id)
    }
  }
}

export default ExchangeRateStore
