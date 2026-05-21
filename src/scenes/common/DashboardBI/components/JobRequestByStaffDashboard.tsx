import DashboardStore from '@stores/dashboardStore'
import React from 'react'
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  registerables as registerablesJS
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Table from 'antd/lib/table'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { L } from '@lib/abpUtility'
ChartJS.register(...registerablesJS, LinearScale, CategoryScale, BarElement, PointElement, LineElement, Legend, Tooltip)
type Props = {
  filter: any
  dashboardStore: DashboardStore
}
const columns = [
  {
    title: L('STAFF'),
    dataIndex: 'staff',
    key: 'staff',
    width: 120,
    render: (text) => <h4>{text}</h4>
  },
  {
    title: L('NEW'),
    dataIndex: 'new',
    key: 'new',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('IN_PROGRESS'),
    dataIndex: 'inProgress',
    key: 'inProgress',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('COMPLETED'),
    dataIndex: 'completed',
    key: 'completed',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('CLOSED'),
    dataIndex: 'closed',
    key: 'closed',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('CANCELLED'),
    dataIndex: 'cancelled',
    key: 'cancelled',
    render: (text) => <span>{text}</span>
  }
]
const JobRequestByStaffDashboard = (props: Props) => {
  React.useEffect(() => {
    if (props.filter.projectId) {
      props.dashboardStore.getJobRequestByStaffDashboard(props.filter).then((res) => {
        setLabels(res.map((item) => item.staff))
      })
    }
  }, [props.filter])
  const [labels, setLabels] = React.useState<string[]>([])
  const data = {
    labels,
    datasets: [
      {
        label: 'New',
        backgroundColor: 'rgba(255, 206, 86)',
        data: labels.map((label) => {
          const res = props.dashboardStore.jobRequestByStaffDashboardData.find((data) => data.staff === label)
          return res.new ?? 0
        }),
        stack: 'Stack 0'
      },
      {
        label: 'In Progress',
        backgroundColor: 'rgba(54, 162, 235)',
        data: labels.map((label) => {
          const res = props.dashboardStore.jobRequestByStaffDashboardData.find((data) => data.staff === label)
          return res?.inProgress ?? 0
        }),
        stack: 'Stack 0'
      },
      {
        label: 'Completed',
        backgroundColor: '#8AB666',
        data: labels.map((label) => {
          const res = props.dashboardStore.jobRequestByStaffDashboardData.find((data) => data.staff === label)
          return res?.inProgress ?? 0
        }),
        stack: 'Stack 0'
      },
      {
        label: 'Closed',
        backgroundColor: '#00ced1',
        data: labels.map((label) => {
          const res = props.dashboardStore.jobRequestByStaffDashboardData.find((data) => data.staff === label)
          return res?.closed ?? 0
        }),
        stack: 'Stack 0'
      },
      {
        label: 'Cancelled',
        backgroundColor: 'rgba(128, 128, 128)',
        data: labels.map((label) => {
          const res = props.dashboardStore.jobRequestByStaffDashboardData.find((data) => data.staff === label)
          return res?.cancelled ?? 0
        }),
        stack: 'Stack 0'
      }
    ]
  }
  return (
    <>
      <h3>{L('JOB_REQUEST_BY_STAFF_OVERVIEW')}</h3>
      <Row gutter={[8, 8]}>
        <Col sm={{ span: 12, offset: 0 }}>
          <Table
            rowKey={(row) => row.staff}
            scroll={{ y: 100 }}
            pagination={false}
            columns={columns}
            dataSource={props.dashboardStore.jobRequestByStaffDashboardData}
          />
        </Col>
        <Col sm={{ span: 12, offset: 0 }}>
          <Bar
            style={{ height: 100 }}
            data={data}
            height={300}
            plugins={[ChartDataLabels]}
            options={{
              maintainAspectRatio: false,
              indexAxis: 'y' as const,
              plugins: {
                datalabels: {
                  anchor: 'center',
                  font: {
                    size: 13
                  },

                  labels: {
                    value: {
                      color: 'White'
                    }
                  }
                }
              }
            }}
          />
        </Col>
      </Row>
    </>
  )
}

export default JobRequestByStaffDashboard
