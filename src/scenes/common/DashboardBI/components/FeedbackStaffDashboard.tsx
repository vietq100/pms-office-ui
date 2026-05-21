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
import ChartDataLabels from 'chartjs-plugin-datalabels'
import Col from 'antd/lib/col'
import Table from 'antd/lib/table'
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
const FeedbackStaffDashboard = (props: Props) => {
  React.useEffect(() => {
    if (props.filter.projectId) {
      props.dashboardStore.getFeedbackStaffDashboard(props.filter).then((res) => {
        setLabels(res.map((item) => item.staff))
      })
    }
  }, [props.filter])
  const [labels, setLabels] = React.useState<string[]>([])
  const data = {
    labels,
    datasets: [
      {
        label: L('NEW'),
        backgroundColor: 'rgba(255, 206, 86)',
        data: labels.map((label) => {
          const res = props.dashboardStore.feedbackStaffDashboardData.find((data) => data.staff === label)
          return res?.new ?? 0
        }),
        stack: 'Stack 0'
      },
      {
        label: L('IN_PROGRESS'),
        backgroundColor: 'rgba(54, 162, 235)',
        data: labels.map((label) => {
          const res = props.dashboardStore.feedbackStaffDashboardData.find((data) => data.staff === label)
          return res?.inProgress ?? 0
        }),
        stack: 'Stack 0'
      },
      {
        label: L('COMPLETED'),
        backgroundColor: '#8AB666',
        data: labels.map((label) => {
          const res = props.dashboardStore.feedbackStaffDashboardData.find((data) => data.staff === label)
          return res?.completed ?? 0
        }),
        stack: 'Stack 0'
      },
      {
        label: L('CLOSED'),
        backgroundColor: '#00ced1',
        data: labels.map((label) => {
          const res = props.dashboardStore.feedbackStaffDashboardData.find((data) => data.staff === label)
          return res?.closed ?? 0
        }),
        stack: 'Stack 0'
      },
      {
        label: L('CANCELLED'),
        backgroundColor: 'rgba(128, 128, 128)',
        data: labels.map((label) => {
          const res = props.dashboardStore.feedbackStaffDashboardData.find((data) => data.staff === label)
          return res?.cancelled ?? 0
        }),
        stack: 'Stack 0'
      }
    ]
  }
  return (
    <>
      <h3>{L('FEEDBACK_BY_STAFF_OVERVIEW')}</h3>
      <Row gutter={[8, 8]}>
        <Col sm={{ span: 12, offset: 0 }}>
          <Table
            rowKey={(row) => row.staff}
            scroll={{ y: 120 }}
            pagination={false}
            columns={columns}
            dataSource={props.dashboardStore.feedbackStaffDashboardData}
          />
        </Col>
        <Col sm={{ span: 12, offset: 0 }}>
          <Bar
            style={{ height: 120 }}
            data={data}
            plugins={[ChartDataLabels]}
            height={300}
            options={{
              maintainAspectRatio: false,
              indexAxis: 'y' as const,
              plugins: {
                datalabels: {
                  display: function (context) {
                    return (context.dataset.data[context.dataIndex] || 0) > 1
                  },
                  anchor: 'center',
                  font: {
                    size: 12
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

export default FeedbackStaffDashboard
