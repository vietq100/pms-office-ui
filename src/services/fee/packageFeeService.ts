import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import http from '../httpService'
import { L } from '../../lib/abpUtility'
import { notifyError } from '../../lib/helper'
import { FilterPackageFee, IPackageFee, PackageFeeByYearModel, PackageFeeModel } from '../../models/fee'

class PackageFeeService {
  public async create(body: IPackageFee): Promise<IPackageFee> {
    if (body.fromToDate && body.fromToDate.length) {
      body.startDate = body.fromToDate[0]
      body.endDate = body.fromToDate[body.fromToDate.length - 1]
      delete body.fromToDate
    }

    const result = await http.post('/api/services/app/FeePackage/Create', body)
    return result.data.result
  }

  public async createBulk(data: IPackageFee[]): Promise<IPackageFee[]> {
    const body = (data || []).map((feePackage) => {
      if (feePackage.fromToDate && feePackage.fromToDate.length) {
        feePackage.startDate = feePackage.fromToDate[0]
        feePackage.endDate = feePackage.fromToDate[feePackage.fromToDate.length - 1]
        delete feePackage.fromToDate
      }
      return feePackage
    })

    const result = await http.post('/api/services/app/FeePackage/CreateMultiple', body)
    return result.data.result
  }

  public async update(body: IPackageFee): Promise<IPackageFee> {
    const result = await http.put('/api/services/app/FeePackage/Update', body)
    return result.data.result
  }

  public async delete(id: number): Promise<IPackageFee> {
    const result = await http.delete('/api/services/app/FeePackage/Delete', {
      params: { id }
    })
    return result.data
  }

  public async deleteYear(year: number): Promise<IPackageFee> {
    const result = await http.delete('/api/services/app/FeePackage/DeleteYearPackage', {
      params: { year }
    })
    return result.data
  }

  public async get(id: number): Promise<IPackageFee> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const result = await http.get('/api/services/app/FeePackage/Get', {
      params: { id }
    })
    return PackageFeeModel.assign(result.data.result)
  }

  public async getAll(params: FilterPackageFee): Promise<PagedResultDto<IPackageFee>> {
    const res = await http.get('/api/services/app/FeePackage/GetAll', {
      params
    })
    const { result } = res.data
    result.items = PackageFeeModel.assigns(result.items || [])
    return result
  }

  public async getAllByYears(params: FilterPackageFee): Promise<PagedResultDto<IPackageFee>> {
    const res = await http.get('/api/services/app/FeePackage/GetAllByYears', {
      params
    })
    const { result } = res.data
    result.items = PackageFeeByYearModel.assigns(result.items || [])
    return result
  }

  public async filter(params): Promise<IPackageFee[]> {
    const res = await http.get('/api/services/app/FeePackage/GetAll', {
      params
    })
    return res.data.result?.items
  }

  public async close(id: number, IsClosed) {
    const body = {
      id,
      IsClosed
    }
    const res = await http.post('api/services/app/FeePackage/Close', body)
    return res.data
  }

  public async getList(params): Promise<IPackageFee[]> {
    const res = await http.get('/api/services/app/FeePackage/GetList', {
      params
    })
    return res.data.result?.items
  }
}

export default new PackageFeeService()
