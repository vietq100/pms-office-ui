import { L } from '@lib/abpUtility'
import { formatCurrency, formatNumberToTy } from '@lib/helper'
import { Card, Col, Collapse, Divider, Row, Tooltip } from 'antd'
import React from 'react'

const { Panel } = Collapse
type Props = {
  data: any[]
  handleClickItem?: (item) => void
  title?: string
}

const OverViewFee = (props: Props) => {
  React.useEffect(() => {
    totalAmount()
  }, [props.data])
  const [total, setTotal] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const totalAmount = () => {
    let value = 0
    let count = 0
    props.data.map((item) => {
      value += item.totalAmount
      count += item.totalCount
    })
    setTotal(value)
    setCount(count)
  }
  return (
    <Collapse defaultActiveKey={['0']} ghost>
      <Panel header={<strong>{L('OVERVIEW')}</strong>} key="1">
        <Row gutter={[4, 4]} className={'mb-3'}>
          <Col span={props.data.length > 4 ? 6 : 4}>
            <Card>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'start',
                  fontSize: 16,
                  width: '100%',
                  paddingTop: 3,
                  paddingBottom: 3
                }}>
                {L('TOTAL')}
              </div>
              <Divider style={{ marginBottom: 3, marginTop: 0 }} />
              <Row>
                <Col span={8}>
                  <Row>
                    <Col span={24}>
                      <span style={{ fontSize: 14, color: '#00000073' }}>{L('TOTAL_NUMBER')}</span>
                    </Col>
                    <Col span={24}>
                      <span style={{ fontSize: 13, color: '#2db7f5' }}>{count}</span>
                    </Col>
                  </Row>
                </Col>
                <Col span={15}>
                  <Col span={24}>
                    <span style={{ fontSize: 14, color: '#00000073' }}>{L('FEE_TOTAL_AMOUNT')}</span>
                  </Col>
                  <Col span={24}>
                    <Tooltip title={total >= 100000000000 && formatCurrency(total)}>
                      <span style={{ fontSize: 13, color: '#2db7f5' }}>{formatNumberToTy(total)}</span>
                    </Tooltip>
                  </Col>
                </Col>
              </Row>
            </Card>
          </Col>
          {props.data.map((item, index) => {
            return (
              <Col key={index} span={props.data.length > 4 ? 6 : 5}>
                <Card>
                  <div
                    className="text-truncate-1"
                    style={{
                      justifyContent: 'start',
                      fontSize: 15,
                      width: '100%',
                      paddingTop: 3,
                      paddingBottom: 3
                    }}>
                    {item.paymentChannel.name}
                  </div>
                  <Divider style={{ marginBottom: 3, marginTop: 0 }} />
                  <Row>
                    <Col span={9}>
                      <Row>
                        <Col span={24}>
                          <span style={{ fontSize: 14, color: '#00000073' }}>{L('TOTAL_NUMBER')}</span>
                        </Col>
                        <Col span={24}>
                          <span style={{ fontSize: 14, color: '#2db7f5' }}>{item.totalCount}</span>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={15}>
                      <Col span={24}>
                        <span style={{ fontSize: 14, color: '#00000073' }}>{L('FEE_TOTAL_AMOUNT')}</span>
                      </Col>
                      <Col span={24}>
                        <Tooltip title={item.totalAmount >= 100000000000 && formatCurrency(item.totalAmount)}>
                          <span style={{ fontSize: 14, color: '#2db7f5' }}>{formatNumberToTy(item.totalAmount)}</span>
                        </Tooltip>
                      </Col>
                    </Col>
                  </Row>
                </Card>
              </Col>
            )
          })}
        </Row>
      </Panel>
    </Collapse>
  )
}

export default OverViewFee
