import { action, observable, makeObservable } from 'mobx'
import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import { FilterPackageFee, IPackageFee } from '../../models/fee'
import packageFeeService from '../../services/fee/packageFeeService'

class PackageFeeStore {
  @observable isLoading!: boolean
  @observable pagedResult!: PagedResultDto<IPackageFee>
  @observable editPackageFee?: IPackageFee
  @observable packageOptions?: IPackageFee[]

  constructor() {
    makeObservable(this)
    this.pagedResult = {
      totalCount: 0,
      items: []
    }
  }

  @action
  async getAll(params: FilterPackageFee) {
    this.isLoading = true
    this.pagedResult = await packageFeeService.getAllByYears(params).finally(() => (this.isLoading = false))
  }

  @action
  async update(packageFee: IPackageFee) {
    const result = await packageFeeService.update(packageFee)
    this.pagedResult.items = this.pagedResult.items?.map((pf) => {
      if (pf.id === result.id) return result

      return pf
    })
  }

  @action
  async create(packageFee: IPackageFee) {
    await packageFeeService.create(packageFee)
  }

  @action
  async createBulk(packageFees: IPackageFee[]) {
    await packageFeeService.createBulk(packageFees)
  }

  @action
  async delete(id: number) {
    await packageFeeService.delete(id)
  }

  @action
  async deleteYear(id: number) {
    await packageFeeService.deleteYear(id)
  }

  @action
  async get(id: number) {
    this.editPackageFee = await packageFeeService.get(id)
  }

  @action
  clearData() {
    this.pagedResult.items = []
  }

  @action
  async filterOption(params: FilterPackageFee) {
    this.isLoading = true
    this.packageOptions = await packageFeeService.filter(params).finally(() => (this.isLoading = false))
  }

  @action
  async close(id: number, IsClosed) {
    await packageFeeService.close(id, IsClosed)
  }
}

export default PackageFeeStore
