import DataTable from '@components/DataTable'

import { L } from '@lib/abpUtility'
import { createPieChartEscalate } from '@lib/helperChart'
import wfStatusService from '@services/workflow/wfStatusService'
import { Col, Row, Spin, Table } from 'antd'
import { useEffect, useState } from 'react'

import AppConsts from '@lib/appconst'
import moment from 'moment'

const { pageSize, align } = AppConsts
interface Props {
  escalationModule: number
  title: string
}

const WorkflowFirstResponse = (props: Props) => {
  const [chartData, setChartData] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [escalateViolateData, setEscalateViolateData] = useState<Array<any>>([])
  const [filter, setFilter] = useState({
    maxResultCount: pageSize.pageSize_5,
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
      target: 'FirstResponse',
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
      target: 'FirstResponse'
    })
    setChartData(res)
    setLoading(false)
  }
  const createChart = () => {
    chartData.map((item) => {
      item.unitFor = createPieChartEscalate(`chartUnit${item.escalatePriority.priorityId}`)
      item.unitFor.data = [
        { name: L('VIOLATE'), value: item.totalViolate, color: '#D05454' },
        {
          name: L('UNVIOLATE'),
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

  const columns = [
    {
      title: L('ID'),
      dataIndex: 'parentId',
      key: 'parentId',
      width: '2%',
      ellipsis: true,
      render: (id) => <>{id}</>
    },
    {
      title: L('STATUS'),
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      ellipsis: true,
      align: align.center,
      render: (status) => <>{status.name}</>
    },
    {
      title: L('ASSIGNEE'),
      dataIndex: 'currentAssignedUser',
      key: 'currentAssignedUser',
      width: '15%',
      align: align.center,
      render: (currentAssignedUser) => <>{currentAssignedUser?.displayName}</>
    },

    {
      title: L('OBSERVER'),
      dataIndex: 'currentObserverUser',
      key: 'currentObserverUser',
      width: '15%',
      align: align.center,
      render: (currentObserverUser) => <>{currentObserverUser?.displayName}</>
    },
    {
      title: L('PLANNED_START_END_DATE'),
      dataIndex: 'currentStartDate',
      key: 'currentStartDate',
      width: '10%',
      ellipsis: true,
      align: align.center,
      render: (currentStartDate) => <>{moment(currentStartDate).format('DD-MM-YYYY')}</>
    },
    {
      title: L('DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '10%',
      ellipsis: true,
      render: (description) => <>{description}</>
    },
    {
      title: L('LATE'),
      dataIndex: 'violateTime',
      key: 'violateTime',
      width: '10%',
      ellipsis: true,
      align: align.center,
      render: (violateTime) => <>{violateTime}</>
    }
  ]
  return (
    <>
      {loading && (
        <div className="d-flex justify-content-around align-items-center w-100 mt-3">
          <Spin />
        </div>
      )}
      {!loading && (
        <>
          <h3>{L(props.title)}</h3>
          <Row className="mt-3" gutter={[8, 8]}>
            {chartData.map((item, index) => (
              <Col sm={{ span: 4, offset: 0 }} key={index}>
                <h4>
                  {L(item.escalatePriority.priority.name)} |
                  <span className="text-muted">
                    {L('FIRST_RESPONE_WITHIN')} :{item.escalatePriority.firstResponseWithin}
                    {L('MINUTES')}
                  </span>
                </h4>
                <div id={`chartUnit${item.escalatePriority.priorityId}`} style={{ width: '80%', height: '130x' }}></div>
              </Col>
            ))}
          </Row>
          <DataTable
            title={L('ESCALATION_REPORT')}
            pagination={{
              pageSize: filter.maxResultCount,
              total: totalViolate,
              onChange: handleTableChange
            }}>
            <Table
              size="middle"
              scroll={{ x: 1000, y: 200 }}
              className="custom-ant-table"
              rowKey={(record) => record.id}
              columns={columns}
              pagination={false}
              loading={loading}
              dataSource={escalateViolateData}
            />
          </DataTable>
        </>
      )}
    </>
  )
}

export default WorkflowFirstResponse
