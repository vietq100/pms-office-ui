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
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { L } from '@lib/abpUtility'
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
const JobReaquestStatusDashboard = (props: Props) => {
  React.useEffect(() => {
    if (props.filter.projectId) {
      props.dashboardStore.getJobRequestStatusDashboard(props.filter).then((res) => {
        setLabels(res.map((item) => item.StatusName))
      })
    }
  }, [props.filter])
  const [labels, setLabels] = React.useState<string[]>([])
  const data = {
    labels,
    datasets: [
      {
        label: L('JOB_REQUEST_STATUS_LABEL_DASHBOARD'),
        backgroundColor: ['rgba(128, 128, 128)', '#00ced1', '#008000', 'rgba(54, 162, 235)', 'rgba(255, 206, 86)'],
        data: labels.map((label) => {
          const res = props.dashboardStore.jobRequestStatusDashboardData.find((data) => data.StatusName === label)
          return res?.TotalCount ?? 0
        })
      }
    ]
  }
  return (
    <>
      <h3>{L('JOB_REQUEST_STATUS_OVERVIEW')}</h3>
      <Row gutter={[8, 8]}>
        <Col sm={{ span: 8, offset: 0 }}>
          <Table
            rowKey={(row) => row.StatusName}
            scroll={{ y: 100 }}
            pagination={false}
            columns={columns}
            dataSource={props.dashboardStore.jobRequestStatusDashboardData}
          />
        </Col>
        <Col sm={{ span: 16, offset: 0 }}>
          <Pie
            style={{ height: 90 }}
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
                  align: 'center',
                  font: {
                    size: 12,
                    weight: 'bold'
                  },

                  labels: {
                    value: {
                      color: '#000000'
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

export default JobReaquestStatusDashboard
