import React from 'react'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import get from 'lodash/get'
import EventStore from '../../../../stores/communication/eventStore'
import './event-detail.less'
import { renderDate } from '../../../../lib/helper'
import { ClockCircleOutlined, TagOutlined, UserOutlined } from '@ant-design/icons/lib'
import { ImageFile } from '../../../../models/File'

interface PublicEventProps {
  eventStore: EventStore
}

@inject(Stores.EventStore)
@observer
export default class PublicEvent extends React.Component<PublicEventProps, { img: ImageFile | null }> {
  constructor(props: PublicEventProps) {
    super(props)
    this.state = {
      img: null
    }
  }
  async componentDidMount() {
    const eventId = get(this.props, 'params.id')
    if (eventId) {
      const { eventStore } = this.props
      await eventStore.get(eventId)
      const images = await eventStore.getImage(eventStore.detailEvent?.uniqueId)
      if (images && images.length) {
        this.setState({ img: images[0] as any })
      }
    }
  }

  render() {
    const { eventStore } = this.props
    return (
      <div className="event-d-container">
        {this.state.img && (
          <div className="event-d-banner">
            <img src={this.state.img.fileUrl} alt="" />
          </div>
        )}
        <h1 className="event-d-title mt-3">{eventStore.detailEvent?.subject}</h1>
        <span className="event-d-sub">
          <TagOutlined /> {eventStore.detailEvent?.category?.name}
          {' | '}
          <UserOutlined /> {eventStore.detailEvent?.creatorUser?.displayName} {' | '}
          <ClockCircleOutlined /> {renderDate(eventStore.detailEvent?.creationTime)}
        </span>
        <p
          className="event-d-content"
          dangerouslySetInnerHTML={{
            __html: eventStore.detailEvent?.content || ''
          }}
        />
      </div>
    )
  }
}
