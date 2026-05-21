import { CaretRightOutlined } from '@ant-design/icons'
import { L } from '@lib/abpUtility'
import { hexToRGB } from '@lib/helper'
import { Card, Collapse, Popover } from 'antd'
import Paragraph from 'antd/lib/typography/Paragraph'

type Props = {
  data: any[]
  handleClickItem?: (item) => void
  title?: string
}
export const randomLightColor = () => {
  const colorPool = [
    '#24474b',
    '#8c644d',
    '#3b2219',
    '#7f1919',
    '#0c1e2b',
    '#04293A',
    '#461111',
    '#3D0000',
    '#3E2C41',
    '#5C3D2E',
    '#2C394B',
    '#E2703A',
    '#03506F',
    '#734046',
    '#133B5C',
    '#ED5107'
  ]
  return colorPool[Math.floor(Math.random() * colorPool.length)]
}
const OverViewBar = (props: Props) => {
  return (
    <Collapse
      defaultActiveKey={['0']}
      ghost
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
      <Collapse.Panel className="overview-collapse" header={<strong>{L('OVERVIEW')}</strong>} key="1">
        <div className="d-flex flex-wrap align-items-center">
          {props.data.map((item, index) => {
            const color = item.color ?? randomLightColor()
            // const backgroundColor =
            //   item.borderColorCode ?? `rgba(${hexToRGB(color)}, .05)`
            const descriptionColor = item.colorCode ?? `rgba(${hexToRGB(color)}, .95)`
            return (
              <Card
                key={index}
                bodyStyle={{
                  padding: '12px 12px 0px 12px'
                }}
                style={{
                  // backgroundColor: backgroundColor,
                  color: descriptionColor,
                  width: 150,
                  marginLeft: 5,
                  marginBottom: 8,
                  borderRadius: 12,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  item.filter && props.handleClickItem && props.handleClickItem(item.filter)
                }}>
                <div className="text-center fw-bold">{item.count}</div>
                <div className="text-center fs-6">
                  <Popover trigger="click" content={item.name}>
                    <Paragraph
                      ellipsis={{
                        rows: 1
                      }}>
                      {item.name}
                    </Paragraph>
                  </Popover>
                </div>
              </Card>
            )
          })}
        </div>
      </Collapse.Panel>
    </Collapse>
  )
}

export default OverViewBar
