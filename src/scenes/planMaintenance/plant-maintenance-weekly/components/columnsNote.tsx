import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import { TableColumnGroupType, TableColumnType } from 'antd'
import { ColumnsType } from 'antd/lib/table'

const columnsNote = (actionColumn: TableColumnGroupType<any> | TableColumnType<any>, isEditing: any, listZone) => {
  const data: ColumnsType<any> = [
    {
      title: L('STT'),
      dataIndex: 'id',
      key: 'id',
      width: 20,
      ellipsis: true,
      render: (name, row, index) => <div className="pl-2">{index + 1}</div>
    },
    {
      title: L('ND_JOB'),
      dataIndex: 'jobDescription',
      key: 'jobDescription',
      width: 70,
      ellipsis: true,
      render: (jobDescription) => <div className="pl-2 text-truncate">{jobDescription}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'jobDescription', 'ND_JOB', isEditing, '', true)
    },
    {
      title: L('UNIT_ZONE'),
      dataIndex: 'zoneId',
      key: 'zoneId',
      width: 70,
      ellipsis: true,
      render: (zoneId) => (
        <div className="pl-2 text-truncate">{listZone.find((item) => item?.id == zoneId)?.name ?? '--'}</div>
      ),
      onCell: (record) => buildEditableCell(record, 'select', 'zoneId', 'UNIT_ZONE', isEditing, listZone, false)
    },
    {
      title: L('NOTED'),
      dataIndex: 'note',
      key: 'note',
      width: 70,
      ellipsis: true,
      render: (note) => <div className="pl-2 text-truncate">{note}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'note', 'NOTED', isEditing, '', false)
    }
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}
export default columnsNote
