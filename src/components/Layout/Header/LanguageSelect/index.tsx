import './index.less'
import 'famfamfam-flags/dist/sprite/famfamfam-flags.css'

import * as React from 'react'

import { Dropdown, Menu } from 'antd'
import { L } from '../../../../lib/abpUtility'
import Stores from '../../../../stores/storeIdentifier'
import UserStore from '../../../../stores/administrator/userStore'
import { inject } from 'mobx-react'

declare let abp: any

export interface ILanguageSelectProps {
  userStore?: UserStore
  wrapClass?: string
  type?: string
}

@inject(Stores.UserStore)
class LanguageSelect extends React.Component<ILanguageSelectProps> {
  state = {
    isMobile: false
  }

  get languages() {
    return abp.localization.languages.filter((val: any) => {
      return !val.isDisabled
    })
  }

  async changeLanguage(languageName: string) {
    await this.props.userStore!.changeLanguage(languageName)

    abp.utils.setCookieValue(
      'Abp.Localization.CultureName',
      languageName,
      new Date(new Date().getTime() + 5 * 365 * 86400000), //5 year
      abp.appPath
    )

    window.location.reload()
  }
  componentDidMount() {
    if (window.screen.width <= 760) {
      this.resize(true)
    } else {
      this.resize(false)
    }
  }

  resize = (isResize) => {
    this.setState({ isMobile: isResize })
  }
  async unauthenticatedChangeLanguage(languageName) {
    abp.utils.setCookieValue(
      'Abp.Localization.CultureName',
      languageName,
      new Date(new Date().getTime() + 5 * 365 * 86400000), // 5 year
      abp.appPath
    )
    if (languageName !== this.currentLanguage.name) window.location.reload()
  }

  get currentLanguage() {
    return abp.localization.currentLanguage
  }

  renderDropdown() {
    const langMenu = (
      <Menu className={'menu'} selectedKeys={[this.currentLanguage.name]}>
        {this.languages.map((item: any) => (
          <Menu.Item key={item.name} onClick={() => this.changeLanguage(item.name)}>
            <i className={item.icon} /> {item.displayName}
          </Menu.Item>
        ))}
      </Menu>
    )
    const wrapClass = `wrap-language ${this.props.wrapClass}`
    const wrapClassIcon = `icon ${this.currentLanguage.icon}`
    const languageName = `LANGUAGE_NAME_${this.currentLanguage.name}`
    return (
      <Dropdown overlay={langMenu} placement="bottomRight" className={wrapClass}>
        <span>
          <span>
            <i className={wrapClassIcon} title={L('Languages')} style={{ fontSize: '16px' }} />
            <span className="ml-1 language-name">{L(languageName)}</span>
          </span>
        </span>
      </Dropdown>
    )
  }

  renderHorizontal() {
    const wrapClass = `wrap-language ${this.props.wrapClass}`
    return (
      <div className={this.state.isMobile ? 'wrap-language-mobile' : wrapClass}>
        {this.languages.map((item: any, index) => {
          const languageNameClass = `language-name ${this.currentLanguage.name === item.name ? 'active' : ''}`
          return (
            <span key={index}>
              {index > 0 && <span className="mx-1">|</span>}
              <span className={languageNameClass} onClick={() => this.unauthenticatedChangeLanguage(item.name)}>
                {item.displayName}
              </span>
            </span>
          )
        })}
      </div>
    )
  }

  render() {
    const { type } = this.props

    return type === 'horizontal' ? this.renderHorizontal() : this.renderDropdown()
  }
}

export default LanguageSelect
