import * as abpTypings from '../lib/abp'

import { L } from '../lib/abpUtility'
import { routers } from '../components/Layout/Router/router.config'
import { Language } from '../services/administrator/language/dto/language'

declare let abp: any

class Utils {
  loadScript(url: string) {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = url
    document.body.appendChild(script)
  }

  extend(...args: any[]) {
    let options,
      name,
      src,
      srcType,
      copy,
      copyIsArray,
      clone,
      target = args[0] || {},
      i = 1,
      deep = false
    const length = args.length
    if (typeof target === 'boolean') {
      deep = target
      target = args[i] || {}
      i++
    }
    if (typeof target !== 'object' && typeof target !== 'function') {
      target = {}
    }
    if (i === length) {
      target = this
      i--
    }
    for (; i < length; i++) {
      if ((options = args[i]) !== null) {
        for (name in options) {
          src = target[name]
          copy = options[name]
          if (target === copy) {
            continue
          }
          srcType = Array.isArray(src) ? 'array' : typeof src
          if (deep && copy && ((copyIsArray = Array.isArray(copy)) || typeof copy === 'object')) {
            if (copyIsArray) {
              copyIsArray = false
              clone = src && srcType === 'array' ? src : []
            } else {
              clone = src && srcType === 'object' ? src : {}
            }
            target[name] = this.extend(deep, clone, copy)
          } else if (copy !== undefined) {
            target[name] = copy
          }
        }
      }
    }

    return target
  }

  getPageTitle = (pathname: string) => {
    const route = Object.keys(routers).find((route: any) => route.path === pathname)
    const localizedAppName = L('CPMS')
    if (!route || route.length === 0) {
      return localizedAppName
    }
    return L(routers[route].title) + ' | ' + localizedAppName
  }

  getRoute = (path: string): any => {
    return routers[path]
  }

  setLocalization() {
    if (!abp.utils.getCookieValue('Abp.Localization.CultureName')) {
      const language = 'vi'
      abp.utils.setCookieValue(
        'Abp.Localization.CultureName',
        language,
        new Date(new Date().getTime() + 5 * 365 * 86400000),
        abp.appPath
      )
    }
  }

  getCurrentClockProvider(currentProviderName: string): abpTypings.timing.IClockProvider {
    if (currentProviderName === 'unspecifiedClockProvider') {
      return abp.timing.unspecifiedClockProvider
    }

    if (currentProviderName === 'utcClockProvider') {
      return abp.timing.utcClockProvider
    }

    return abp.timing.localClockProvider
  }

  getLanguages(): Array<Language> {
    return abp.localization.languages.filter((val: any) => {
      return !val.isDisabled
    })
  }
}

export default new Utils()
