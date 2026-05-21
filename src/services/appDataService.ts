import http from './httpService'
import { AppConfiguration } from '@lib/appconst'
import axios from 'axios'

class AppDataService {
  public async getAppConfiguration(): Promise<any> {
    const httpTemp = axios.create()
    const result = await httpTemp.get(
      process.env.NODE_ENV === 'production' ? '/configuration.json' : '/assets/configuration.json'
    )
    AppConfiguration.remoteServiceBaseUrl = result.data.remoteServiceBaseUrl
    AppConfiguration.appBaseUrl = result.data.appBaseUrl
    AppConfiguration.appLayoutConfig = result.data.appLayoutConfig
    http.defaults.baseURL = result.data.remoteServiceBaseUrl
    AppConfiguration.powerBIUrl = result.data.powerBIUrl
  }
}

export default new AppDataService()
