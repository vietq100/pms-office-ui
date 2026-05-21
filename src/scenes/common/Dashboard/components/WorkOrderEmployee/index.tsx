import workOrderService from '@services/communication/workOrderService'
import {
  createBarHorizontalChart,
  createBarHorizontalChartSeries,
  prepareChartHorizontalDataColumnStack
} from '@lib/helperChart'
import { L } from '@lib/abpUtility'
import { useState } from 'react'
import { useEffect } from 'react'
import { Card, Table } from 'antd'
import { moduleIds, modulePrefix } from '@lib/appconst'
import DataTable from '@components/DataTable'
import appConsts from '@lib/appconst'

const { align } = appConsts

export default function WorkOrderEmployee({ filters }) {
  let chart: any
  const [loading, setLoading] = useState(false)
  const [columns, setColumns] = useState([])
  const [tableData, setTableData] = useState([] as any)
  const [sumStatus, setSumStatus] = useState([] as any)

  useEffect(() => {
    refreshChart()
    return () => {
      if (chart) {
        chart.dispose()
      }
    }
  }, [filters])

  const refreshChart = async () => {
    if (loading) {
      return
    }

    setLoading(true)
    const data = (await workOrderService.reportByEmployee(filters || {})) as any
    setLoading(false)
    prepareColumnData(data)
    prepareSumStatus(data)
    const numberSeries = data && data.length ? data[0].status?.length : 0
    chart = createBarHorizontalChart('chartWorkOrderEmployee', 'category', L('EMPLOYEE'), true, 30)
    chart.data = prepareChartHorizontalDataColumnStack(data)
    setTableData(chart.data)
    numberSeries && createBarHorizontalChartSeries(chart, data[0], 'category')
  }

  const prepareColumnData = (data) => {
    const columnTemps = [
      {
        title: L(modulePrefix[moduleIds.workOrder] + 'AssignedId'),
        dataIndex: 'category',
        key: 'category',
        width: 80,
        ellipsis: true,
        render: (category) => <>{category}</>
      }
    ] as any
    if (data && data.length) {
      ;(data[0].status || []).map((item) => {
        columnTemps.push({
          title: item.name,
          dataIndex: item.name,
          key: item.name,
          width: 100,
          align: align.right,
          render: (text, row) => (
            <>
              {text} <span className="small">({row[item.name + 'percent']} %)</span>
            </>
          )
        })
      })
      columnTemps.push({
        title: L('TOTAL'),
        dataIndex: 'total',
        key: 'total',
        width: 100,
        align: align.right,
        render: (text) => <>{text}</>
      })
    }
    setColumns(columnTemps as any)
  }

  const prepareSumStatus = (data) => {
    if (!data || !data.length) {
      setSumStatus([])
      return
    }
    const tempData: any = {}

    data.forEach((item, index) => {
      if (index === 0) {
        ;(item.status || []).forEach((status) => (tempData[status.name] = status.value || 0))
      } else {
        ;(item.status || []).forEach((status) => (tempData[status.name] += status.value || 0))
      }
    })

    const sumData: any = []
    let total = 0
    Object.keys(tempData).map((key) => {
      total += tempData[key] || 0
      sumData.push({ value: tempData[key] || 0, percent: 0 })
    })
    sumData.forEach((item) => (item.percent = ((item.value / total) * 100).toFixed(2)))
    sumData.push({ value: total, percent: 100 })
    setSumStatus(sumData)
  }

  const renderSummary = () => {
    return (
      <>
        <Table.Summary.Row>
          <Table.Summary.Cell index={0}>{L('TOTAL')}</Table.Summary.Cell>
          {(sumStatus || []).map((status, index) => {
            return (
              <Table.Summary.Cell key={index} index={index + 1} className="text-right">
                {status.value} <span className="small">({status.percent} %)</span>
              </Table.Summary.Cell>
            )
          })}
        </Table.Summary.Row>
      </>
    )
  }

  return (
    <>
      <Card bordered={false}>
        <div id="chartWorkOrderEmployee" style={{ width: '100%', height: '100%' }}></div>
      </Card>
      <DataTable title={L('WORK_ORDER_LIST')} pagination={false}>
        <Table
          size="middle"
          className="custom-ant-table"
          rowKey={(record) => record.id}
          columns={columns}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '30']
          }}
          dataSource={tableData || []}
          summary={renderSummary}
          scroll={{ y: 300, scrollToFirstRowOnChange: true }}
        />
      </DataTable>
    </>
  )
}
