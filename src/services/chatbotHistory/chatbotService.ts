import { ChatbotModel } from '@models/chatbotHistory/chatbotModel'
import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'

class ChatbotService {
  public async createAdmin(body: any) {
    const res = await http.post('/api/services/app/ChatMessage/CreateV1', body)
    return ChatbotModel.assign(res.data.result)
  }

  public async create(body: any) {
    const res = await http.post('/api/services/app/ChatMessage/Create', body)
    return ChatbotModel.assign(res.data.result)
  }

  public async getAllAdmin(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('/api/services/app/ChatMessage/GetAllForAdmin', {
      params
    })
    const result = res.data.result
    result.items = ChatbotModel.assigns(result.items || [])
    return result
  }

  public async getAll(params: any): Promise<PagedResultDto<any>> {
    const res = await http.get('/api/services/app/ChatMessage/GetAll', {
      params
    })
    const result = res.data.result
    result.items = ChatbotModel.assigns(result.items || [])
    return result
  }

  public async get(params: any): Promise<any> {
    const res = await http.get('/api/services/app/ChatMessage/GetAllV1', {
      params
    })

    return res.data.result
  }
}

export default new ChatbotService()
