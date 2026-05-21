import { L } from '@lib/abpUtility'
import { formatNumber, renderStatusActive, renderStatusEform } from '@lib/helper'
import { columnCreate, columnUpdate } from '@components/DataTable/columns'

const columns = (actionColumn?) => {
  const data = [
    actionColumn,
    {
      title: L('HANDOVER_CHECKLIST_TOTAL'),
      dataIndex: 'totalDefect',
      key: 'totalDefect',
      width: '12%',
      ellipsis: true,
      render: (totalDefect) => <>{formatNumber(totalDefect) ?? 0}</>
    },
    {
      title: L('HANDOVER_CHECKLIST_GOOD'),
      dataIndex: 'totalOfGood',
      key: 'totalOfGood',
      width: ' 8%',
      ellipsis: true,
      render: (totalOfGood) => <>{formatNumber(totalOfGood) ?? 0}</>
    },
    {
      title: L('HANDOVER_CHECKLIST_FAIR'),
      dataIndex: 'totalOfFair',
      key: 'totalOfFair',
      width: ' 8%',
      ellipsis: true,
      render: (totalOfFair) => <>{formatNumber(totalOfFair) ?? 0}</>
    },
    {
      title: L('HANDOVER_CHECKLIST_POOR'),
      dataIndex: 'totalOfPoor',
      key: 'totalOfPoor',
      width: ' 8%',
      ellipsis: true,
      render: (totalOfPoor) => <>{formatNumber(totalOfPoor) ?? 0}</>
    },
    columnCreate,
    columnUpdate,
    {
      title: L('EFORM_QUESTION_STATUS'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '12%',
      render: (isActive, row) => renderStatusEform(row?.submitStatus?.name, row?.submitStatus?.colorCode)
    },
    {
      title: L('EFORM_QUESTION_ISAVTIVE'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '12%',
      render: renderStatusActive
    }
  ]

  return data
}

export default columns
