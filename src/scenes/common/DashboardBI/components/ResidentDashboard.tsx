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
    title: L('GROUP_AGE'),
    dataIndex: 'groupAge',
    key: 'groupAge',
    render: (text) => <span className="fs-6">{text}</span>
  },
  {
    title: L('FEMALE'),
    dataIndex: 'female',
    key: 'female',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('MALE'),
    dataIndex: 'male',
    key: 'male',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('TOTAL'),
    dataIndex: 'male',
    key: 'male',
    render: (text, row) => <span>{row.female + row.male}</span>
  }
]
const ResidentDashboard = (props: Props) => {
  React.useEffect(() => {
    if (props.filter.projectId) {
      props.dashboardStore.getResidentDashboard(props.filter).then((res) => {
        setLabels(res.map((item) => item.groupAge))
      })
    }
  }, [props.filter])
  const [labels, setLabels] = React.useState<string[]>([])
  const data = {
    labels,
    datasets: [
      {
        label: L('FEMALE'),
        data: labels.map((label) => {
          const res = props.dashboardStore.residentDashboardData.find((data) => data.groupAge === label)
          return res.female ?? 0
        }),
        backgroundColor: 'rgb(255, 99, 132)',
        stack: 'Stack 0'
      },
      {
        label: L('MALE'),
        data: labels.map((label) => {
          const res = props.dashboardStore.residentDashboardData.find((data) => data.groupAge === label)
          return res.male ?? 0
        }),
        backgroundColor: 'rgb(75, 192, 192)',
        stack: 'Stack 0'
      }
    ]
  }
  return (
    <>
      <h3>{L('RESIDENT_OVERVIEW')}</h3>
      <Row gutter={[8, 8]}>
        <Col sm={{ span: 12, offset: 0 }}>
          <Table
            rowKey={(row) => row.groupAge}
            scroll={{ y: 150 }}
            pagination={false}
            columns={columns}
            dataSource={props.dashboardStore.residentDashboardData}
            summary={(pageData) => {
              let total = 0
              pageData.forEach((item) => {
                total += item.male + item.female
              })
              return (
                <Table.Summary.Row className="bg-total">
                  <Table.Summary.Cell index={1}>Total</Table.Summary.Cell>
                  <Table.Summary.Cell index={1}></Table.Summary.Cell>
                  <Table.Summary.Cell index={1}></Table.Summary.Cell>
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
            style={{ height: 100 }}
            data={data}
            height={250}
            options={{
              maintainAspectRatio: false,
              plugins: {
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
            plugins={[ChartDataLabels]}
          />
        </Col>
      </Row>
    </>
  )
}

export default ResidentDashboard
