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
import Typography from 'antd/lib/typography'
ChartJS.register(...registerablesJS, LinearScale, CategoryScale, BarElement, PointElement, LineElement, Legend, Tooltip)
type Props = {
  filter: any
  dashboardStore: DashboardStore
}
const columns = [
  {
    title: L('TYPE'),
    dataIndex: 'TypeName',
    key: 'TypeName',
    render: (text) => <h4>{text}</h4>
  },
  {
    title: L('TOTAL'),
    dataIndex: 'TotalCount',
    key: 'TotalCount',
    render: (text) => <span>{text}</span>
  }
]
const FeedbackTypeDashboard = (props: Props) => {
  React.useEffect(() => {
    if (props.filter.projectId) {
      props.dashboardStore.getFeedbackTypeDashboard(props.filter).then((res) => {
        setLabels(res.map((item) => item.TypeName))
      })
    }
  }, [props.filter])
  const [labels, setLabels] = React.useState<string[]>([])
  const data = {
    labels,
    datasets: [
      {
        label: 'Feedback',
        backgroundColor: [
          '#606892',
          '#685892',
          'rgba(255, 99, 132)',
          'rgba(54, 162, 235)',
          'rgba(255, 206, 86)',
          'rgba(75, 192, 192)',
          'rgba(153, 102, 255)',
          'rgba(255, 159, 64)'
        ],
        data: labels.map((label) => {
          const res = props.dashboardStore.feedbackTypeDashboardData.find((data) => data.TypeName === label)
          return res?.TotalCount ?? 0
        })
      }
    ]
  }
  return (
    <>
      <h3>{L('FEEDBACK_OVERVIEW')}</h3>
      <Row gutter={[8, 8]}>
        <Col sm={{ span: 12, offset: 0 }}>
          <Table
            rowKey={(row) => row.TypeName}
            scroll={{ y: 100 }}
            pagination={false}
            columns={columns}
            dataSource={props.dashboardStore.feedbackTypeDashboardData}
            summary={(pageData) => {
              let total = 0
              pageData.forEach((item) => {
                total += item.TotalCount
              })
              return (
                <>
                  <Table.Summary.Row className="bg-total">
                    <Table.Summary.Cell index={1}>
                      <Typography.Text strong>Total</Typography.Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Typography.Text strong>{total}</Typography.Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              )
            }}
          />
        </Col>
        <Col sm={{ span: 12, offset: 0 }}>
          <Bar
            style={{ height: 100 }}
            data={data}
            plugins={[ChartDataLabels]}
            height={300}
            options={{
              maintainAspectRatio: false,
              indexAxis: 'y' as const,
              responsive: true,
              plugins: {
                datalabels: {
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

export default FeedbackTypeDashboard
