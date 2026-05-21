import React from 'react'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import get from 'lodash/get'
import EventStore from '../../../../stores/communication/eventStore'
import { renderDate, renderDateTime } from '@lib/helper'
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  FieldTimeOutlined,
  TagOutlined,
  UserOutlined
} from '@ant-design/icons/lib'
import { ImageFile } from '@models/File'
import { Button } from 'antd'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import { L } from '@lib/abpUtility'
import withRouter from '@components/Layout/Router/withRouter'

interface EventDetailProps {
  navigate: any
  eventStore: EventStore
}

@inject(Stores.EventStore)
@observer
class EventDetail extends React.Component<EventDetailProps, { img: ImageFile | null }> {
  constructor(props: EventDetailProps) {
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

  renderBackBtn = () => (
    <Button onClick={() => this.props.navigate(-1)} shape="round">
      {L('BTN_BACK')}
    </Button>
  )

  render() {
    const { eventStore } = this.props
    return (
      <WrapPageScroll renderActions={this.renderBackBtn}>
        <div className="event-d-container">
          {this.state.img && (
            <div className="event-d-banner mb-3">
              <img src={this.state.img.fileUrl} alt="" />
            </div>
          )}
          <h1 className="event-d-title">{eventStore.detailEvent?.subject}</h1>
          <span className="event-d-sub text-muted mb-3">
            <EnvironmentOutlined /> {eventStore.detailEvent?.location}
            {' | '}
            <ClockCircleOutlined /> {renderDateTime(eventStore.detailEvent?.startTime)}
            {' | '}
            <FieldTimeOutlined /> {renderDateTime(eventStore.detailEvent?.endTime)}
            {' | '}
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
      </WrapPageScroll>
    )
  }
}
export default withRouter(EventDetail)
