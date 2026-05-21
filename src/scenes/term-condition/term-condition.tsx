import LanguageSelect from '@components/Layout/Header/LanguageSelect'
import termConditionService from '@services/administrator/termConditionService'
import React from 'react'

export default class TermCondition extends React.Component<any, any> {
  constructor(props) {
    super(props)
    this.state = {
      img: null,
      title: null,
      content: null
    }
  }

  componentDidMount() {
    const culture = abp.utils.getCookieValue('Abp.Localization.CultureName') || 'vi'
    termConditionService.get().then((res) => {
      const content = res.content[culture]
      const title = res.subject[culture]
      this.setState({ content, title })
    })
  }
  render() {
    const { title, content } = this.state
    return (
      <div>
        <div className="lang pr-3">
          <LanguageSelect wrapClass="dart-auth-language" type="horizontal" />
        </div>
        <div>
          <h3>{title}</h3>
          <p
            className="event-d-content"
            dangerouslySetInnerHTML={{
              __html: content || ''
            }}
          />
        </div>
      </div>
    )
  }
}
