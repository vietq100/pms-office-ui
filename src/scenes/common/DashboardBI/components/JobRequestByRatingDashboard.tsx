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
    title: L('1 *'),
    dataIndex: 'one',
    key: 'one',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('2 *'),
    dataIndex: 'two',
    key: 'two',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('3 *'),
    dataIndex: 'three',
    key: 'three',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('4 *'),
    dataIndex: 'four',
    key: 'four',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('5 *'),
    dataIndex: 'five',
    key: 'five',
    render: (text) => <span>{text}</span>
  }
]
const JobRequestByRatingDashboard = (props: Props) => {
  React.useEffect(() => {
    if (props.filter.projectId) {
      props.dashboardStore.getJobRequestByRatingDashboard(props.filter).then((res) => {
        setLabels(res.map((item) => item.staff))
      })
    }
  }, [props.filter])
  const [labels, setLabels] = React.useState<string[]>([])
  const data = {
    labels,
    datasets: [
      {
        label: '1 *',
        backgroundColor: 'rgba(128, 128, 128)',
        data: labels.map((label) => {
          const res = props.dashboardStore.jobRequestByRatingDashboardData.find((data) => data.staff === label)
          return res.one ?? 0
        }),
        stack: 'Stack 0'
      },
      {
        label: '2 *',
        backgroundColor: 'rgba(54, 162, 235)',
        data: labels.map((label) => {
          const res = props.dashboardStore.jobRequestByRatingDashboardData.find((data) => data.staff === label)
          return res?.two ?? 0
        }),
        stack: 'Stack 0'
      },
      {
        label: '3 *',
        backgroundColor: '#00ced1',
        data: labels.map((label) => {
          const res = props.dashboardStore.jobRequestByRatingDashboardData.find((data) => data.staff === label)
          return res?.three ?? 0
        }),
        stack: 'Stack 0'
      },
      {
        label: '4 *',
        backgroundColor: '#8AB666',
        data: labels.map((label) => {
          const res = props.dashboardStore.jobRequestByRatingDashboardData.find((data) => data.staff === label)
          return res?.four ?? 0
        }),
        stack: 'Stack 0'
      },
      {
        label: '5 *',
        backgroundColor: 'rgba(255, 206, 86)',
        data: labels.map((label) => {
          const res = props.dashboardStore.jobRequestByRatingDashboardData.find((data) => data.staff === label)
          return res?.five ?? 0
        }),
        stack: 'Stack 0'
      }
    ]
  }
  return (
    <>
      <h3>{L('JOB_REQUEST_RATING')}</h3>
      <Row gutter={[8, 8]}>
        <Col sm={{ span: 12, offset: 0 }}>
          <Table
            rowKey={(row) => row.staff}
            scroll={{ y: 100 }}
            pagination={false}
            columns={columns}
            dataSource={props.dashboardStore.jobRequestByRatingDashboardData}
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

export default JobRequestByRatingDashboard
