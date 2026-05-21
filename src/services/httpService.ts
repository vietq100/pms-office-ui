import AppConsts, { AppConfiguration } from './../lib/appconst'
import { LError } from '@lib/abpUtility'
import { notifyError } from '@lib/helper'
import axios from 'axios'
const { authorization } = AppConsts
import qs from 'qs'

declare let abp: any

const http = axios.create({
  baseURL: AppConfiguration.remoteServiceBaseUrl,
  timeout: 30000,
  paramsSerializer: (params) => {
    return qs.stringify(params, {
      // check if search keyword with # for search tag
      encode: params.keyword?.includes('#')
    })
  }
})

http.interceptors.request.use(
  function (config) {
    if (!config.headers) {
      config.headers = {}
    }
    if (abp.auth.getToken()) {
      config.headers.common['Authorization'] = 'Bearer ' + abp.auth.getToken()
    }

    config.headers.common['.AspNetCore.Culture'] = abp.utils.getCookieValue('Abp.Localization.CultureName')
    config.headers.common['Abp.TenantId'] = abp.multiTenancy.getTenantIdCookie()
    config.headers.common['ProjectId'] = localStorage.getItem(authorization.projectId)
    config.params = {
      ...(config.params || {}),
      culture: abp.utils.getCookieValue('Abp.Localization.CultureName') || 'vi'
    }

    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  (response) => {
    return response
  },
  (res) => {
    if (res.request?.status === HTTP_ERROR_CODES.UNAUTHENTICATED) {
      abp.utils.deleteCookie(AppConsts.authorization.encrptedAuthTokenName, abp.appPath)
      abp.auth.clearToken()
      window.location.href = `/account/login`
      return Promise.reject(res)
    }

    const { error } = res?.response?.data || {}
    if (!error) {
      notifyError(LError('UNKNOW_ERROR'), '')
      return Promise.reject(error)
    }

    if (!!error.message && error.details) {
      notifyError(error.message, error.details)
    } else if (error.message) {
      notifyError(LError('REQUEST_ERROR'), error.message)
    }
    const { code } = error
    if (code === ERROR_CODE.LOGIN_NOT_FINISH) {
      abp.utils.deleteCookie(AppConsts.authorization.encrptedAuthTokenName, abp.appPath)
      abp.auth.clearToken()
      window.location.href = `/account/login`
    }

    return Promise.reject(error)
  }
)

const ERROR_CODE = {
  LOGIN_NOT_FINISH: 100001
}
const HTTP_ERROR_CODES = {
  UNAUTHENTICATED: 401
}
export default http
