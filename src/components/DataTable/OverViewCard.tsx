import { hexToRGB } from '@lib/helper'
import { Card } from 'antd'
import { randomLightColor } from './OverViewBar'

type Props = {
  data: any[]
  handleClickItem: (item) => void
  cardTitle: string
}

const OverViewCard = (props: Props) => {
  const color = randomLightColor()
  //const backgroundColor = `rgba(${hexToRGB(color)}, .01)`
  const descriptionColor = `rgba(${hexToRGB(color)}, .95)`
  return (
    <Card
      bordered={false}
      title={<div style={{ color: descriptionColor }}>{props.cardTitle}</div>}
      style={{
        // backgroundColor: backgroundColor,
        color: descriptionColor,
        width: '100%',
        marginBottom: 12,
        borderRadius: 12,
        cursor: 'pointer'
      }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center w-100">
        {props.data.map((item, index) => {
          return (
            <div
              style={{ minWidth: 120 }}
              key={index}
              onClick={() => {
                item.filter && props.handleClickItem(item.filter)
              }}>
              <div className="fs-5 fw-bold">{item.count}</div>
              <div className="fs-6 text-wrap">{item.name}</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default OverViewCard
