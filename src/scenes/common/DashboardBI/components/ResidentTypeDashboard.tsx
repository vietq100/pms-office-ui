import { L, LCategory } from '@lib/abpUtility'
import DashboardStore from '@stores/dashboardStore'
import React from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, registerables as registerablesJS } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie } from 'react-chartjs-2'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Table from 'antd/lib/table'
import Typography from 'antd/lib/typography'

type Props = {
  filter: any
  dashboardStore: DashboardStore
}
ChartJS.register(...registerablesJS, ArcElement, Tooltip, Legend)
const columns = [
  {
    title: L('ROLE'),
    dataIndex: 'RoleName',
    key: 'RoleName',
    render: (text) => <span className="fs-6">{LCategory('MEMBERROLE-' + text)}</span>
  },
  {
    title: L('TOTAL'),
    dataIndex: 'TotalCount',
    key: 'TotalCount',
    width: '30%',
    render: (text) => <span>{text}</span>
  }
]
const ResidentTypeDashboard = (props: Props) => {
  React.useEffect(() => {
    if (props.filter.projectId) {
      props.dashboardStore.getResidentTypeDashboard(props.filter).then((res) => {
        setLabels(res.map((item) => LCategory('MEMBERROLE-' + item.RoleName)))
      })
    }
  }, [props.filter])
  const [labels, setLabels] = React.useState<string[]>([])

  const data = {
    labels,
    datasets: [
      {
        data: labels.map((label) => {
          const res = props.dashboardStore.residentTypeDashboardData.find(
            (data) => LCategory('MEMBERROLE-' + data.RoleName) === label
          )

          return res?.TotalCount ?? 0
        }),
        backgroundColor: [
          'rgba(255, 99, 132)',
          'rgba(54, 162, 235)',
          'rgba(255, 206, 86)',
          'rgba(75, 192, 192)',
          'rgba(153, 102, 255)',
          'rgba(255, 159, 64)'
        ],
        borderWidth: 1
      }
    ]
  }

  return (
    <>
      <h3>{L('RESIDENT_TYPE_OVERVIEW')}</h3>
      <Row gutter={[2, 8]}>
        <Col sm={{ span: 9, offset: 0 }}>
          <Table
            rowKey={(row) => row.RoleName}
            scroll={{ y: 150 }}
            pagination={false}
            columns={columns}
            dataSource={props.dashboardStore.residentTypeDashboardData}
            summary={(pageData) => {
              let total = 0
              pageData.forEach((item) => {
                total += item.TotalCount
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
        <Col sm={{ span: 15, offset: 0 }}>
          <Pie
            style={{ height: 100 }}
            data={data}
            plugins={[ChartDataLabels]}
            height={250}
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

export default ResidentTypeDashboard
