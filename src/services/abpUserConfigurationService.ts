import http from './httpService'

class AbpUserConfigurationService {
  public async getAll() {
    return await http.get('/AbpUserConfiguration/GetAll', {
      params: { culture: 'vi' }
    })
  }
}

export default new AbpUserConfigurationService()
