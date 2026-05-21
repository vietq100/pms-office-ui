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
import { formatCurrency } from '@lib/helper'

type Props = {
  filter: any
  dashboardStore: DashboardStore
}
ChartJS.register(...registerablesJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
const columns = [
  {
    title: L('FEE_TYPE'),
    dataIndex: 'FeeType',
    key: 'FeeType',
    render: (text) => <h4>{formatCurrency(text)}</h4>
  },
  {
    title: L('PAID'),
    dataIndex: 'Paid',
    key: 'Paid',
    render: (text) => <span>{formatCurrency(text)}</span>
  },
  {
    title: L('UNPAID'),
    dataIndex: 'UnPaid',
    key: 'UnPaid',
    render: (text) => <span>{formatCurrency(text)}</span>
  },
  {
    title: L('OVER_PAID'),
    dataIndex: 'OverPaid',
    key: 'OverPaid',
    render: (text) => <span>{formatCurrency(text)}</span>
  }
]
const FeeDashboard = (props: Props) => {
  React.useEffect(() => {
    if (props.filter.projectId) {
      props.dashboardStore.getFeeDashboard(props.filter).then((res) => {
        setLabels(res.map((item) => item.FeeType))
      })
    }
  }, [props.filter])
  const [labels, setLabels] = React.useState<string[]>([])
  const data = {
    labels,
    datasets: [
      {
        label: L('PAID'),
        data: labels.map((label) => {
          const res = props.dashboardStore.feeDashboardData.find((data) => data.FeeType === label)
          return res.Paid ?? 0
        }),
        backgroundColor: '#91C893',
        stack: 'Stack 0'
      },
      {
        label: L('UNPAID'),
        data: labels.map((label) => {
          const res = props.dashboardStore.feeDashboardData.find((data) => data.FeeType === label)
          return res.UnPaid ?? 0
        }),
        backgroundColor: '#4F5886',
        stack: 'Stack 0'
      },
      {
        label: L('OVER_PAID'),
        data: labels.map((label) => {
          const res = props.dashboardStore.feeDashboardData.find((data) => data.FeeType === label)
          return res.OverPaid ?? 0
        }),
        backgroundColor: '#E2C652',
        stack: 'Stack 0'
      }
    ]
  }
  return (
    <>
      <h3>{L('FEES_OVERVIEW')}</h3>
      <Row gutter={[8, 8]}>
        <Col sm={{ span: 12, offset: 0 }}>
          <Table
            rowKey={(row) => row.FeeType}
            scroll={{ y: 120 }}
            pagination={false}
            columns={columns}
            dataSource={props.dashboardStore.feeDashboardData}
            summary={(pageData) => {
              let totalPaid = 0
              let totalUnPaid = 0
              let totalOverPaid = 0
              pageData.forEach((item) => {
                totalPaid += item.Paid
                totalUnPaid += item.UnPaid
                totalOverPaid += item.OverPaid
              })
              return (
                <Table.Summary.Row className="bg-total">
                  <Table.Summary.Cell index={1}>Total</Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Typography.Text>{formatCurrency(totalPaid)}</Typography.Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Typography.Text>{formatCurrency(totalUnPaid)}</Typography.Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Typography.Text>{formatCurrency(totalOverPaid)}</Typography.Text>
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
            plugins={[ChartDataLabels]}
            height={300}
            options={{
              maintainAspectRatio: false,
              plugins: {
                datalabels: {
                  color: 'white',
                  display: function (context) {
                    return (context.dataset.data[context.dataIndex] || 0) > 1000000
                  },
                  font: {
                    size: 10
                  },
                  formatter: function (value) {
                    return '$' + Math.round(value / 1000000) + 'M'
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

export default FeeDashboard
