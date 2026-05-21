import { GetCurrentLoginInformations } from './dto/getCurrentLoginInformations'
import http from '../httpService'
import { AppSettingConfiguration, HostSettingConfiguration } from '@models/global'

declare let abp: any

class SessionService {
  public async getCurrentLoginInformations(): Promise<GetCurrentLoginInformations> {
    const result = await http.get('api/services/app/Session/GetCurrentLoginInformations', {
      headers: {
        'Abp.TenantId': abp.multiTenancy.getTenantIdCookie()
      }
    })

    return result.data.result
  }

  public async getWebConfiguration(): Promise<AppSettingConfiguration> {
    const result = await http.get('api/services/app/Configuration/GetWebConfiguration')
    return AppSettingConfiguration.assign(result.data.result)
  }
  public async getHostSetting(): Promise<HostSettingConfiguration> {
    const result = await http.get('api/services/app/HostSettings/GetAllSettings')
    return result.data.result
  }
  public async changeHostSetting(body): Promise<HostSettingConfiguration> {
    const result = await http.put('api/services/app/HostSettings/UpdateAllSettings', body)
    return result.data.result
  }
}

export default new SessionService()
