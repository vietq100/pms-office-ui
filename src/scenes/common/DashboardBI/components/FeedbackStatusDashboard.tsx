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
import { Pie } from 'react-chartjs-2'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Table from 'antd/lib/table'
import { L } from '@lib/abpUtility'
import Typography from 'antd/lib/typography'
import ChartDataLabels from 'chartjs-plugin-datalabels'
ChartJS.register(...registerablesJS, LinearScale, CategoryScale, BarElement, PointElement, LineElement, Legend, Tooltip)
type Props = {
  filter: any
  dashboardStore: DashboardStore
}
const columns = [
  {
    title: L('STATUS'),
    dataIndex: 'StatusName',
    key: 'StatusName',
    render: (text) => <h4>{text}</h4>
  },
  {
    title: L('TOTAL'),
    dataIndex: 'TotalCount',
    key: 'TotalCount',
    render: (text) => <span>{text}</span>
  }
]
const FeedbackStatusDashboard = (props: Props) => {
  React.useEffect(() => {
    if (props.filter.projectId) {
      props.dashboardStore.getFeedbackStatusDashboard(props.filter).then((res) => {
        setLabels(res.map((item) => item.StatusName))
      })
    }
  }, [props.filter])
  const [labels, setLabels] = React.useState<string[]>([])
  const data = {
    labels,
    datasets: [
      {
        label: 'Feedback',
        backgroundColor: ['rgba(128, 128, 128)', '#00ced1', '#008000', 'rgba(54, 162, 235)', 'rgba(255, 206, 86)'],
        data: labels.map((label) => {
          const res = props.dashboardStore.feedbackStatusDashboardData.find((data) => data.StatusName === label)
          return res?.TotalCount ?? 0
        })
      }
    ]
  }
  return (
    <>
      <h3>{L('FEEDBACK_OVERVIEW_STATUS')}</h3>
      <Row gutter={[8, 8]}>
        <Col sm={{ span: 8, offset: 0 }}>
          <Table
            rowKey={(row) => row.StatusName}
            scroll={{ y: 100 }}
            pagination={false}
            columns={columns}
            dataSource={props.dashboardStore.feedbackStatusDashboardData}
            summary={(pageData) => {
              let total = 0
              pageData.forEach((item) => {
                total += item.TotalCount
              })
              return (
                <Table.Summary.Row className="bg-total">
                  <Table.Summary.Cell index={1}>
                    <Typography.Text strong>Total</Typography.Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Typography.Text strong>{total}</Typography.Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )
            }}
          />
        </Col>
        <Col sm={{ span: 16, offset: 0 }}>
          <Pie
            style={{ height: 100 }}
            plugins={[ChartDataLabels]}
            data={data}
            height={300}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right'
                },
                datalabels: {
                  anchor: 'center',
                  font: {
                    size: 11
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

export default FeedbackStatusDashboard
