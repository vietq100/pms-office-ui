import { Category } from '../../models/category'
import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'

class NewsCategoryService {
  public async create(body: Category) {
    const result = await http.post('/api/services/app/NewsCategories/Create', body)
    return result.data.result
  }

  public async update(body: any) {
    const result = await http.put('/api/services/app/NewsCategories/Update', body)
    return result.data.result
  }

  public async delete(id: number) {
    const result = await http.delete('api/services/app/Residents/Delete', {
      params: { id }
    })
    return result.data
  }

  // public async get(id: number): Promise<any> {
  //   if (!id) {
  //     notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
  //   }

  //   let result = await http.get('/api/services/app/Events/Get', { params: { id } })
  //   return result.data.result
  // }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const result = await http.get('/api/services/app/NewsCategories/GetAll', {
      params
    })
    return result.data.result
  }
}

export default new NewsCategoryService()
