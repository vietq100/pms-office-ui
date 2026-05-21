import React from 'react'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import get from 'lodash/get'
import NewsStore from '../../../../stores/communication/newsStore'
import './news-detail.less'
import { renderDate } from '../../../../lib/helper'
import { ClockCircleOutlined, TagOutlined, UserOutlined } from '@ant-design/icons/lib'
import { ImageFile } from '../../../../models/File'
import withRouter from '@components/Layout/Router/withRouter'

interface PublicNewsProps {
  newsStore: NewsStore
}

@inject(Stores.NewsStore)
@observer
class PublicNews extends React.Component<PublicNewsProps, { img: ImageFile | null }> {
  constructor(props: PublicNewsProps) {
    super(props)
    this.state = {
      img: null
    }
  }
  async componentDidMount() {
    const newsId = get(this.props, 'params.id')
    if (newsId) {
      const { newsStore } = this.props
      await newsStore.get(newsId)
      const images = await newsStore.getImage(newsStore.detailNews?.uniqueId)
      if (images && images.length) {
        this.setState({ img: images[0] as any })
      }
    }
  }

  render() {
    const { newsStore } = this.props
    return (
      <div className="news-d-container">
        {this.state.img && (
          <div className="news-d-banner">
            <img src={this.state.img.fileUrl} alt="" />
          </div>
        )}
        <h1 className="news-d-title mt-3">{newsStore.detailNews?.subject}</h1>
        <span className="news-d-sub">
          <TagOutlined /> {newsStore.detailNews?.category?.name}
          {' | '}
          <UserOutlined /> {newsStore.detailNews?.creatorUser?.displayName} {' | '}
          <ClockCircleOutlined /> {renderDate(newsStore.detailNews?.creationTime)}
        </span>
        <p
          className="news-d-content"
          dangerouslySetInnerHTML={{
            __html: newsStore.detailNews?.content || ''
          }}
        />
      </div>
    )
  }
}

export default withRouter(PublicNews)
