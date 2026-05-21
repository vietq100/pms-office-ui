import DataTable from '@components/DataTable'
import { ExcelIcon } from '@components/Icon'
import { L } from '@lib/abpUtility'
import { createPieChartEscalate } from '@lib/helperChart'
import wfStatusService from '@services/workflow/wfStatusService'
import { Button, Card, Col, Row, Spin, Table } from 'antd'
import { useEffect, useState } from 'react'
import { columns } from './columns'

interface Props {
  escalationModule: number
}

const SLAReportOnViolate = (props: Props) => {
  const [chartData, setChartData] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [escalateViolateData, setEscalateViolateData] = useState<Array<any>>([])
  const [filter, setFilter] = useState({
    maxResultCount: 10,
    skipCount: 0
  })
  let moduleId
  switch (props.escalationModule) {
    case 1:
      moduleId = 'WorkOrder'
      break
    case 2:
      moduleId = 'Feedback'
      break
  }
  const [totalViolate, setTotalViolate] = useState(0)
  const getViolate = async (filter) => {
    const anotherRes = await wfStatusService.getEscalateViolates({
      Module: moduleId,
      target: 'OnViolate',
      maxResultCount: filter.maxResultCount,
      skipCount: filter.skipCount
    })
    setEscalateViolateData(anotherRes.items)
    setTotalViolate(anotherRes.totalCount)
  }
  const getDashboard = async () => {
    setLoading(true)
    const res = await wfStatusService.getEscalateDashboard({
      Module: moduleId,
      target: 'OnViolate'
    })
    setChartData(res)
    setLoading(false)
  }
  const createChart = () => {
    chartData.map((item) => {
      item.unitFor = createPieChartEscalate(`chartUnit${item.escalatePriority.priorityId}`)
      item.unitFor.data = [
        { name: 'violate', value: item.totalViolate, color: '#D05454' },
        {
          name: 'unviolate',
          value: item.totalItems - item.totalViolate,
          color: '#35A359'
        }
      ]
    })
  }
  useEffect(() => {
    getDashboard()
    getViolate(filter)
  }, [props.escalationModule])

  useEffect(() => {
    const checkDoc = chartData.map((item) => {
      return document.querySelector(`#chartUnit${item.escalatePriority.priorityId}`)
    })
    if (!checkDoc.includes(null)) createChart()
  })

  const handleTableChange = (pagination: any) => {
    const newFilter = {
      ...filter,
      skipCount: (pagination.current - 1) * filter.maxResultCount!
    }
    setFilter(newFilter)
    getViolate(newFilter)
  }

  const handleExportFile = async () => {
    return await wfStatusService.exportEscalate({
      Module: moduleId,
      target: 'OnViolate',
      ...filter
    })
  }

  const renderActionGroups = () => {
    return (
      <span style={{ flex: 1, alignItems: 'center' }} className="mr-1">
        <Button
          shape="circle"
          type="primary"
          className="pt-1 mx-2"
          onClick={() => handleExportFile()}
          icon={
            // <span className="btn-icon">
            <ExcelIcon />
            // </span>
          }>
          {/* {L('EXPORT_EXCEL')} */}
        </Button>
      </span>
    )
  }
  return (
    <>
      {loading && (
        <div className="d-flex justify-content-around align-items-center w-100 mt-3">
          <Spin />
        </div>
      )}
      {!loading && (
        <>
          <Card className="my-3">
            <Row className="mt-3" gutter={[8, 8]}>
              {chartData.map((item, index) => (
                <Col sm={{ span: 8, offset: 0 }} key={index}>
                  <Card>
                    <h4>
                      {L(item.escalatePriority.priority.name)} |
                      <span className="text-muted">
                        {L('FIRST_RESPONE_WITHIN')} :{item.escalatePriority.firstResponseWithin}
                        {L('MINUTES')}
                      </span>
                    </h4>
                    <div
                      id={`chartUnit${item.escalatePriority.priorityId}`}
                      style={{ width: '80%', height: '180px' }}></div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
          <Card>
            <DataTable
              title={L('ESCALATION_REPORT')}
              pagination={{
                pageSize: filter.maxResultCount,
                total: totalViolate,
                onChange: handleTableChange
              }}
              actionGroups={renderActionGroups}>
              <Table
                size="middle"
                scroll={{ x: 1000, y: 500 }}
                className="custom-ant-table"
                rowKey={(record) => record.id}
                columns={columns}
                pagination={false}
                loading={loading}
                dataSource={escalateViolateData}
              />
            </DataTable>
          </Card>
        </>
      )}
    </>
  )
}

export default SLAReportOnViolate
