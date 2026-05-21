import './statistic-item.less'
import { Card } from 'antd'
import { formatNumber, hexToRGB } from '@lib/helper'
import Row from 'antd/lib/grid/row'
import Col from 'antd/lib/grid/col'

type StatisticItemProps = {
  description?: string
  value: string | number
  iconUrl?: string
  color: string
  statisticDetailItems?: any[]
}

export function StatisticItem({ description, value, iconUrl, color, statisticDetailItems }: StatisticItemProps) {
  const backgroundColor = `rgba(${hexToRGB(color)}, .2)`
  const descriptionColor = `rgba(${hexToRGB(color)}, .7)`

  return (
    <Card
      style={{ boxShadow: 'none' }}
      bordered={false}
      bodyStyle={{ backgroundColor, color, borderRadius: '10px' }}
      className="statistic-item">
      <Row gutter={4}>
        <Col flex="4" style={{ display: 'flex' }}>
          {iconUrl && iconUrl.length > 0 && (
            <span className="btn-icon">
              <img src={iconUrl} />
            </span>
          )}
          <span>
            <h2 className="mb-0 custom-title-static-item" style={{ color }}>
              {formatNumber(value) || 0}
            </h2>
            <div className="statistic-item-description" style={{ color: descriptionColor }}>
              {description}
            </div>
          </span>
        </Col>
        {statisticDetailItems && (
          <Col flex="4" className="align-self-center small">
            {statisticDetailItems.map((item, index) => (
              <div className="d-flex justify-content-between" key={index}>
                <div className="mr-3">{item.label}</div>
                <div>{formatNumber(item.value) || 0}</div>
              </div>
            ))}
          </Col>
        )}
      </Row>
    </Card>
  )
}
