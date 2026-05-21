import { L } from '@lib/abpUtility'
import DashboardStore from '@stores/dashboardStore'
import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  registerables as registerablesJS
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar } from 'react-chartjs-2'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Table from 'antd/lib/table'
import Typography from 'antd/lib/typography'

type Props = {
  filter: any
  dashboardStore: DashboardStore
}
ChartJS.register(...registerablesJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
const columns = [
  {
    title: L('AMENTITY'),
    dataIndex: 'amentity',
    key: 'amentity',
    render: (text) => <h4>{text}</h4>
  },
  {
    title: L('REQUESTED'),
    dataIndex: 'requested',
    key: 'requested',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('APPROVED'),
    dataIndex: 'approved',
    key: 'approved',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('DECLINED'),
    dataIndex: 'declined',
    key: 'declined',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('CANCELLED'),
    dataIndex: 'cancelled',
    key: 'cancelled',
    render: (text) => <span>{text}</span>
  }
]
const BookingDashboard = (props: Props) => {
  React.useEffect(() => {
    if (props.filter.projectId) {
      props.dashboardStore.getBookingDashboard(props.filter).then((res) => {
        setLabels(res.map((item) => item.amentity))
      })
    }
  }, [props.filter])
  const [labels, setLabels] = React.useState<string[]>([])
  const data: any = {
    labels,
    datasets: [
      {
        label: L('REQUESTED'),
        data: labels.map((label) => {
          const res = props.dashboardStore.bookingDashboardData.find((data) => data.amentity === label)
          return res.requested ?? 0
        }),
        backgroundColor: 'rgb(75, 192, 192)',
        stack: 'Stack 0'
      },
      {
        label: L('APPROVED'),
        data: labels.map((label) => {
          const res = props.dashboardStore.bookingDashboardData.find((data) => data.amentity === label)
          return res.approved ?? 0
        }),
        backgroundColor: '#8AB666',
        stack: 'Stack 0'
      },
      {
        label: L('DECLINED'),
        data: labels.map((label) => {
          const res = props.dashboardStore.bookingDashboardData.find((data) => data.amentity === label)
          return res.declined ?? 0
        }),
        backgroundColor: 'rgb(255, 99, 132)',
        stack: 'Stack 0'
      },
      {
        label: L('CANCELLED'),
        data: labels.map((label) => {
          const res = props.dashboardStore.bookingDashboardData.find((data) => data.amentity === label)
          return res.cancelled ?? 0
        }),
        backgroundColor: 'rgb(128, 128, 128)',
        stack: 'Stack 0'
      }
    ]
  }
  return (
    <>
      <h3>{L('BOOKING_OVERVIEW')}</h3>
      <Row gutter={[8, 8]}>
        <Col sm={{ span: 12, offset: 0 }}>
          <Table
            rowKey={(row) => row.amentity}
            scroll={{ y: 120 }}
            pagination={false}
            columns={columns}
            dataSource={props.dashboardStore.bookingDashboardData}
            summary={(pageData) => {
              let total = 0
              pageData.forEach((item) => {
                total += item.approved + item.cancelled + item.declined + item.requested
              })
              return (
                <Table.Summary.Row className="bg-total">
                  <Table.Summary.Cell index={1}>Total</Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Typography.Text>{total}</Typography.Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )
            }}
          />
        </Col>
        <Col sm={{ span: 12, offset: 0 }}>
          <Bar
            style={{ height: 120 }}
            data={data}
            height={300}
            plugins={[ChartDataLabels]}
            options={{
              maintainAspectRatio: false,
              plugins: {
                datalabels: {
                  color: 'white',
                  display: function (context) {
                    return (context.dataset.data[context.dataIndex] as number || 0) > 1
                  },
                  font: {
                    size: 12
                  },
                  formatter: Math.round
                }
              }
            }}
          />
        </Col>
      </Row>
    </>
  )
}

export default BookingDashboard
