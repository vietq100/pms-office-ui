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
import DataTable from '@components/DataTable'
import appConsts, { moduleIds, modulePrefix } from '@lib/appconst'

const { align } = appConsts

export default function WorkOrderRatingEmployee({ filters }) {
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
    const data = (await workOrderService.reportRatingByProject(filters || {})) as any
    const data4Table = (await workOrderService.reportRatingByEmployee(filters || {})) as any
    setLoading(false)

    prepareColumnData(data4Table)
    prepareSumStatus(data4Table)
    setTableData(data4Table)

    const numberSeries = data && data.length ? data[0].ratings?.length : 0
    chart = createBarHorizontalChart(
      'chartWorkOrderRatingEmployee',
      'category',
      L('WORK_ORDER_RATING_BY_PROJECT_NAME'),
      true,
      30,
      true
    )
    chart.data = prepareChartHorizontalDataColumnStack(data, 'ratings')
    numberSeries && createBarHorizontalChartSeries(chart, data[0], 'category', true, 'ratings')
  }

  const prepareColumnData = (data) => {
    const columnTemps = [
      {
        title: L(modulePrefix[moduleIds.workOrder] + 'AssignedId'),
        dataIndex: 'category',
        key: 'category',
        ellipsis: true,
        render: (category) => <>{category}</>
      }
    ] as any
    if (data && data.length) {
      ;(data[0].ratings || []).map((item) => {
        columnTemps.push({
          title: item.name + '',
          dataIndex: item.name + '',
          key: item.name + '',
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
        ;(item.ratings || []).forEach((item) => (tempData[item.name] = item.value || 0))
      } else {
        ;(item.ratings || []).forEach((item) => (tempData[item.name] += item.value || 0))
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
          {(sumStatus || []).map((item, index) => {
            return (
              <Table.Summary.Cell key={index} index={index + 1} className="text-right">
                {item.value} <span className="small">({item.percent} %)</span>
              </Table.Summary.Cell>
            )
          })}
        </Table.Summary.Row>
      </>
    )
  }

  return (
    <>
      <Card loading={loading} bordered={false}>
        <div id="chartWorkOrderRatingEmployee" style={{ width: '100%', height: '500px' }}></div>
      </Card>
      <DataTable title={L('WORK_ORDER_RATING_LIST')} pagination={false}>
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
