import { ExchangeRateModel } from '@models/exchangeRate/ExchangeRateModel'
import http from '@services/httpService'

class ExchangeRateService {
  public async create(body: any) {
    const result = await http.post('/api/services/app/ExchangeRate/Create', body)

    return result.data.result
  }

  public async update(body: any) {
    if (!body) {
      return
    }
    const result = await http.put('/api/services/app/ExchangeRate/Update', body)

    return result.data.result
  }

  public async activateOrDeactivate(id: number, isActive: boolean) {
    if (isActive) {
      return http.post('api/services/app/ExchangeRate/Active', { id }, { params: { isActive } })
    }
    return http.post('api/services/app/ExchangeRate/Active', { id }, { params: { isActive } })
  }

  public async getAll(): Promise<any> {
    const res = await http.get('/api/services/app/ExchangeRate/GetAll')

    const data = ExchangeRateModel.assigns(res.data?.result || [])

    return data
  }

  public async getCurrent(): Promise<any> {
    const res = await http.get('/api/services/app/ExchangeRate/GetCurrent')

    return res.data?.result
  }
}

export default new ExchangeRateService()
