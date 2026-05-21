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
import { Chart } from 'react-chartjs-2'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Table from 'antd/lib/table'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { L } from '@lib/abpUtility'
// import { globalPlugins } from '../DashBoardWithChartJS'
ChartJS.register(...registerablesJS, LinearScale, CategoryScale, BarElement, PointElement, LineElement, Legend, Tooltip)

type Props = {
  filter: any
  dashboardStore: DashboardStore
}
const columns = [
  {
    title: L('BUILDING'),
    dataIndex: 'BuildingName',
    key: 'BuildingName',
    render: (text) => <h3>{text}</h3>
  },
  {
    title: L('RESIDENT'),
    dataIndex: 'CountResident',
    key: 'CountResident',
    render: (text) => <span>{text}</span>
  },
  {
    title: L('UNIT'),
    dataIndex: 'CountUnit',
    key: 'CountUnit',
    render: (text) => <span>{text}</span>
  }
]

const ProjectDashboard = (props: Props) => {
  React.useEffect(() => {
    if (props.filter.projectId) {
      props.dashboardStore.getProjectDashboard(props.filter).then((res) => {
        setLabels(res.map((item) => item.BuildingName))
      })
    }
  }, [props.filter])
  const [labels, setLabels] = React.useState<string[]>([])

  const data = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: L('RESIDENT'),
        backgroundColor: '#606892',
        borderColor: '#606892',
        borderWidth: 2,
        fill: false,
        data: labels.map((label) => {
          const res = props.dashboardStore.projectDashboardData.find((data) => data.BuildingName === label)

          return res.CountResident ?? 0
        })
      },
      {
        type: 'bar' as const,
        label: L('UNIT'),
        backgroundColor: '#8AB666',
        data: labels.map((label) => {
          const res = props.dashboardStore.projectDashboardData.find((data) => data.BuildingName === label)
          return res.CountUnit ?? 0
        }),
        borderColor: 'white',
        borderWidth: 2
      }
    ]
  }

  return (
    <>
      <h3>{L('PROJECT_OVERVIEW')}</h3>
      <Row gutter={[16, 0]}>
        <Col sm={{ span: 8, offset: 0 }}>
          <Table
            rowKey={(row) => row.BuildingName}
            scroll={{ y: 150 }}
            pagination={false}
            columns={columns}
            dataSource={props.dashboardStore.projectDashboardData}
          />
        </Col>
        <Col sm={{ span: 16, offset: 0 }}>
          <Chart
            style={{ height: 100 }}
            plugins={[ChartDataLabels]}
            type="bar"
            data={data}
            height={300}
            options={{
              maintainAspectRatio: false,
              plugins: {
                datalabels: {
                  font: {
                    size: 11
                  },
                  anchor: 'end',
                  align: 'end',
                  labels: {
                    value: {
                      color: 'black'
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

export default ProjectDashboard
