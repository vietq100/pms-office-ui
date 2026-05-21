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
    title: L('ROLE_NAME'),
    dataIndex: 'RoleName',
    key: 'RoleName',
    render: (text) => <h4>{text}</h4>
  },
  {
    title: L('TOTAL'),
    dataIndex: 'TotalCount',
    key: 'TotalCount',
    width: '30%',
    render: (text) => <span>{text}</span>
  }
]

const StaffDashboard = (props: Props) => {
  React.useEffect(() => {
    if (props.filter.projectId) {
      props.dashboardStore.getStaffDashboard(props.filter).then((res) => {
        setLabels(res.map((item) => item.RoleName))
      })
    }
  }, [props.filter])
  const [labels, setLabels] = React.useState<string[]>([])

  const data = {
    labels,
    datasets: [
      {
        label: L('STAFF'),
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
          const res = props.dashboardStore.staffDashboardData.find((data) => data.RoleName === label)
          return res.TotalCount ?? 0
        })
      }
    ]
  }

  return (
    <>
      <h3>{L('STAFF_OVERVIEW')}</h3>
      <Row gutter={[8, 8]}>
        <Col sm={{ span: 5, offset: 0 }}>
          <Table
            rowKey={(row) => row.RoleName}
            scroll={{ y: 150 }}
            pagination={false}
            columns={columns}
            dataSource={props.dashboardStore.staffDashboardData}
          />
        </Col>
        <Col sm={{ span: 18, offset: 0 }}>
          <Bar
            style={{ height: 150 }}
            data={data}
            plugins={[ChartDataLabels]}
            height={300}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
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

export default StaffDashboard
