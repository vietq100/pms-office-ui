import { useEffect, useState } from 'react'
import { Card, Spin } from 'antd'
import { L } from '@lib/abpUtility'
import feeService from '@services/fee/feeService'
import {
  createBarHorizontalChart,
  createBarHorizontalChartSeries,
  prepareChartHorizontalDataColumnStack
} from '@lib/helperChart'

const Category = {
  Number: 1, // Number of fee
  Amount: 2 // Amount of fee
}

const Status = {
  1: L('FEE_UNPAID'),
  2: L('FEE_PAID')
}

function getDataChart(data: any[], category: number, stackColumnNames) {
  return data.map((item) => ({
    category: item.project.name,
    status: stackColumnNames.map((stackColumnName) => {
      const stackColumnData = (item.summary || []).find(
        (summaryItem) => stackColumnName === Status[summaryItem.statusId]
      )
      return {
        name: stackColumnName,
        value: (category === Category.Number ? stackColumnData?.totalCount : stackColumnData?.totalAmount) || 0
      }
    })
  }))
}

export default function FeeStatementReport({ filters }) {
  let chartTotalCount, chartAmount

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    feeService.getReport(filters).then((data) => {
      if (loading) {
        setLoading(false)
      }
      const stackColumns = getAllColumnFromData(data)

      prepareChartDataNumberFees(data, stackColumns)
      prepareChartDataAmountFees(data, stackColumns)
    })

    return () => {
      if (chartTotalCount) {
        chartTotalCount.dispose()
      }
      if (chartAmount) {
        chartAmount.dispose()
      }
    }
  }, [filters])

  // Loop api data to get all stack columns to compute chart data
  const getAllColumnFromData = (data) => {
    return data.reduce((computedColumns, item) => {
      ;(item.summary || []).forEach((summaryItem) => {
        if (computedColumns.findIndex((computedColumn) => computedColumn === Status[summaryItem.statusId]) === -1) {
          computedColumns.push(Status[summaryItem.statusId])
        }
      })
      return computedColumns
    }, [])
  }

  const prepareChartDataNumberFees = (data, stackColumns) => {
    const computedDataNumberFees = getDataChart(data, Category.Number, stackColumns)
    chartTotalCount = createBarHorizontalChart('fee-chart', 'category', L('FEE_TOTAL_COUNT'), true)

    chartTotalCount.data = prepareChartHorizontalDataColumnStack(computedDataNumberFees)
    computedDataNumberFees &&
      computedDataNumberFees.length &&
      createBarHorizontalChartSeries(chartTotalCount, computedDataNumberFees[0], 'category', true)
  }

  const prepareChartDataAmountFees = (data, stackColumns) => {
    const computedDataAmountFee = getDataChart(data, 2, stackColumns)
    chartAmount = createBarHorizontalChart('fee-chart2', 'category', L('FEE_TOTAL_AMOUNT'), true)
    chartAmount.data = prepareChartHorizontalDataColumnStack(computedDataAmountFee)
    computedDataAmountFee &&
      computedDataAmountFee.length &&
      createBarHorizontalChartSeries(chartAmount, computedDataAmountFee[0], 'category', true)
  }

  if (loading) {
    return (
      <div className="flex center-content" style={{ position: 'fixed', top: '30%', left: '50%' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="flex column">
      <Card title={L('REPORT_FEE_TOTAL_COUNT')}>
        <div id="fee-chart" style={{ width: '100%', height: '500px' }} />
      </Card>
      <Card className="mt-3" title={L('REPORT_FEE_TOTAL_AMOUNT')}>
        <div id="fee-chart2" style={{ width: '100%', height: '500px' }} />
      </Card>
    </div>
  )
}
