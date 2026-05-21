import type { PagedResultDto } from '../dto/pagedResultDto'
import http from '../httpService'
import { TeamModel } from '@models/Team/TeamModel'

class TeamService {
  public async getAll(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }
    const {
      data: { result }
    } = await http.get('api/services/app/TeamManagements/GetTeams', { params })
    result.items = TeamModel.assigns(result.items || [])
    return result
  }

  public async filterOptions(params: any): Promise<PagedResultDto<any>> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }
    const { data } = await http.get('api/services/app/TeamManagements/GetTeams', { params })
    return (data.result?.items || []).map((item) => ({
      id: item.id,
      name: item.name,
      value: item.id,
      label: item.name,
      code: item.code
    }))
  }

  public async filterUsersInTeamOptions(params: any): Promise<any> {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }
    const { data } = await http.get('api/services/app/TeamManagements/GetUsersInTeam', { params })
    return (data?.result || []).map((item) => ({
      id: item.userId,
      name: item.displayName,
      value: item.userId,
      label: item.displayName,
      isObserver: item.isObserver
    }))
  }
  public async createTeam(info) {
    await http.post(`/api/services/app/TeamManagements/AddTeam`, info)
  }
  public async addMember(info) {
    await http.post(`/api/services/app/TeamManagements/AddMember`, info)
  }

  public async updateTeam(info) {
    await http.put(`/api/services/app/TeamManagements/UpdateTeam`, info)
  }
  public async updateTeamMember(info) {
    await http.put(`/api/services/app/TeamManagements/UpdateTeamMember`, info)
  }
  public async activeTeam(id) {
    await http.post(`/api/services/app/TeamManagements/ActiveTeam?id=${id}`)
  }
  public async deactiveTeam(id) {
    await http.post(`/api/services/app/TeamManagements/DeActiveTeam?id=${id}`)
  }
  public async getAllUser(params: any) {
    if (params.keyword) {
      params.keyword = encodeURIComponent(params.keyword)
    }
    const {
      data: { result }
    } = await http.get('/api/services/app/TeamManagements/GetUsersInTeam', {
      params
    })
    // result.items = TeamModel.assigns(result.items || [])
    return result
  }
  public async getTeamDetail(id) {
    const res = await http.get(`/api/services/app/TeamManagements/GetDetail?id=${id}`)
    return res.data.result.name
  }
  public async removeMember(params) {
    await http.delete(`/api/services/app/TeamManagements/RemoveMember`, {
      params
    })
  }
}

export default new TeamService()
