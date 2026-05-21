import { Card, Col, Row } from 'antd'
import { L } from '@lib/abpUtility'
import { useState } from 'react'
import { useEffect } from 'react'
import { Spin } from 'antd'
import { createPieChart } from '@lib/helperChart'
import projectService from '@services/project/projectService'

export default function ProjectUnitChart({ filters }) {
  let unitStatusChart: any
  let unitTypeChart: any
  const [loading, setLoading] = useState(true)
  const [dataStatus, setDataStatus] = useState([] as any)
  const [totalStatus, setTotalStatus] = useState(0)
  const [dataTypes, setDataTypes] = useState([] as any)
  const [totalTypes, setTotalTypes] = useState(0)
  useEffect(() => {
    refreshChart()

    return () => {
      if (unitStatusChart) {
        unitStatusChart.dispose()
      }
      if (unitTypeChart) {
        unitTypeChart.dispose()
      }
    }
  }, [filters])

  const refreshChart = async () => {
    setLoading(true)

    unitStatusChart = createPieChart('chartUnitByStatus')
    unitTypeChart = createPieChart('chartUnitByType')

    unitStatusChart.data = await projectService.countUnitByStatus(filters)
    unitTypeChart.data = await projectService.countUnitByType(filters)
    let totalSumStatus = 0
    let totalSumType = 0
    setDataStatus(unitStatusChart.data)
    setDataTypes(unitTypeChart.data)
    unitStatusChart.data.map((item) => (totalSumStatus += item.value))
    unitTypeChart.data.map((item) => (totalSumType += item.value))
    setTotalStatus(totalSumStatus)
    setTotalTypes(totalSumType)
    setLoading(false)
  }

  return (
    <Spin spinning={loading}>
      <Row gutter={[16, 0]}>
        <Col sm={8}>
          <Card className="ant-card-border-10" bordered={false}>
            <p className="text-large line-height-5">
              {L('PROJECT')} | <span className="text-muted">{L('STATUS')}</span>
            </p>
            <Row gutter={[8, 8]}>
              {dataStatus.map((item, index) => (
                <Col sm={12} key={index}>
                  <Row gutter={[8, 0]}>
                    <Col
                      sm={2}
                      style={{
                        backgroundColor: item.color ? item.color : '#ffffff',
                        borderRadius: 6
                      }}
                    />
                    <Col sm={13}>{item.name}</Col>
                    <Col sm={9}>{((item.value / totalStatus) * 100).toFixed(1)}%</Col>
                  </Row>
                </Col>
              ))}
            </Row>
          </Card>
          <br />
        </Col>
        <Col sm={16}>
          <Card className="ant-card-border-10" bordered={false}>
            <p className="text-large line-height-5">
              {L('PROJECT')} | <span className="text-muted">{L('TYPE')}</span>
            </p>
            <Row gutter={[8, 8]}>
              {dataTypes.map((item, index) => (
                <Col sm={6} key={index}>
                  <Row gutter={[8, 0]}>
                    <Col
                      sm={2}
                      style={{
                        backgroundColor: item.color ? item.color : '#ffffff',
                        borderRadius: 6
                      }}
                    />
                    <Col sm={13}>{item.name}</Col>
                    <Col sm={9}>{((item.value / totalTypes) * 100).toFixed(1)}%</Col>
                  </Row>
                </Col>
              ))}
            </Row>
          </Card>
          <br />
        </Col>
      </Row>
    </Spin>
  )
}
