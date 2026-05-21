import { hexToRGB } from '@lib/helper'
import { Card } from 'antd'
import { randomLightColor } from './OverViewBar'

type Props = {
  data: any[]
  handleClickItem: (item) => void
}

const OverViewAnnouncement = (props: Props) => {
  return (
    <div className="d-flex flex-wrap justify-content-around align-items-center mb-3 w-100">
      {props.data.map((item, index) => {
        const color = item.color ?? randomLightColor()
        // const backgroundColor = `rgba(${hexToRGB(color)}, .01)`
        const descriptionColor = `rgba(${hexToRGB(color)}, .9)`
        return (
          <Card
            bordered={false}
            key={index}
            style={{
              // backgroundColor: backgroundColor,
              color: descriptionColor,
              minWidth: 380,
              marginBottom: 4,
              borderRadius: 12,
              cursor: 'pointer'
            }}
            onClick={() => {
              item.filter && props.handleClickItem(item.filter)
            }}
            title={<div style={{ color: descriptionColor }}>{item.name}</div>}>
            {/* <div className="fs-6 text-wrap fw-bold">{item.name}</div> */}
            <div className="d-flex flex-wrap justify-content-between align-items-center w-100 px-1">
              {(item.campaignTypes || []).map((campaign, index) => (
                <div key={index}>
                  <div className="fs-5 fw-bold">{campaign.count}</div>
                  <div className="fs-6 text-wrap">{campaign.campaignTypeId}</div>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default OverViewAnnouncement
