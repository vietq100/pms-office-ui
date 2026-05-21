import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { CommentModel } from '../../models/common/commentModel'

class CommentService {
  public async create(body: any) {
    const res = await http.post('api/services/app/ChatMessage/CreateV1', body)
    return CommentModel.assign(res.data.result)
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('api/services/app/ChatMessage/GetAll', {
      params
    })
    const result = res.data.result
    result.items = CommentModel.assigns(result.items || [])
    return result
  }
}

export default new CommentService()
