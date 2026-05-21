import { L } from '@lib/abpUtility'
import { Card, Col, Collapse, Row, Statistic } from 'antd'
import React from 'react'

const { Panel } = Collapse
type Props = {
  data: any[]
  handleClickItem?: (item) => void
  title?: string
}

const OverViewParking = (props: Props) => {
  React.useEffect(() => {
    totalAmount()
  }, [props.data])

  const [totalCount, setTotalCount] = React.useState(0)
  const totalAmount = () => {
    let count = 0
    props.data.map((item) => {
      count += item.count
    })

    setTotalCount(count)
  }
  return (
    <Collapse defaultActiveKey={['0']} ghost>
      <Panel header={<strong>{L('OVERVIEW')}</strong>} key="1">
        <Row gutter={16} className={'mb-3'}>
          <Col md={{ span: 4 }}>
            <Card title={L('TOTAL')}>
              <div className="flex center-content"></div>

              <Row>
                <Col span={10}>
                  <Statistic value={totalCount} valueStyle={{ color: '#2db7f5' }} />
                </Col>
              </Row>
            </Card>
          </Col>
          {props.data.map((item, index) => {
            return (
              <Col key={index} md={{ span: 4 }}>
                <Card title={item.name}>
                  <div className="flex center-content"></div>

                  <Row>
                    <Col span={10}>
                      <Statistic value={item.count} valueStyle={{ color: '#2db7f5' }} />
                    </Col>
                  </Row>
                </Card>
              </Col>
              //   <Card
              //     bordered={false}
              //     key={index}
              //     style={{
              //       minWidth: 120,
              //       marginBottom: 4,
              //       borderRadius: 12,
              //       cursor: 'pointer'
              //     }}
              //     onClick={() => {
              //       item.filter &&
              //         props.handleClickItem &&
              //         props.handleClickItem(item.filter)
              //     }}>
              //     {/* <div className="d-flex justify-content-between align-items-baseline"> */}
              //     <div className="fs-5 fw-bold">{item.totalAmount}</div>
              //     <div className="fs-6 text-wrap">{item.totalCount}</div>
              //     {/* </div> */}
              //   </Card>
            )
          })}
        </Row>
      </Panel>
    </Collapse>
  )
}

export default OverViewParking
