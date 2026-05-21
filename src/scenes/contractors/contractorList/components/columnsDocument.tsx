import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDate } from '@lib/helper'
import { TableColumnGroupType, TableColumnType } from 'antd'
import { ColumnsType } from 'antd/lib/table'
const { align } = AppConsts
const columnsDocument = (
  documentFile,
  actionColumn: TableColumnGroupType<any> | TableColumnType<any>,
  dataDocumenType: any[],
  isEditing: any
) => {
  const data: ColumnsType<any> = [
    {
      title: L('CONTRACTOR_DOCUMENT_NAME'),
      dataIndex: 'documentName',
      key: 'documentName',
      width: 70,
      ellipsis: true,
      render: (documentName) => <div className="pl-2">{documentName}</div>,
      onCell: (record) =>
        buildEditableCell(record, 'text', 'documentName', 'CONTRACTOR_DOCUMENT_NAME', isEditing, '', true)
    },
    {
      title: L('CONTRACTOR_DOCUMENT_TYPE'),
      dataIndex: 'documentType',
      key: 'documentType',
      width: 50,
      align: align.center,
      ellipsis: true,
      render: (documentType) => <>{documentType?.name}</>,
      onCell: (record) =>
        buildEditableCell(record, 'select', 'documentTypeId', 'TYPE', isEditing, dataDocumenType, true)
    },
    {
      title: L('DOCUMENT_EFFECTIVE_DATE'),
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 50,
      align: align.center,
      ellipsis: true,
      render: (effectiveDate) => renderDate(effectiveDate),
      onCell: (record) =>
        buildEditableCell(record, 'date', 'effectiveDate', 'DOCUMENT_EFFECTIVE_DATE', isEditing, '', false)
    },
    {
      title: L('DOCUMENT_EXPIRY_DATE'),
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 50,
      align: align.center,
      ellipsis: true,
      render: (expiryDate) => renderDate(expiryDate),
      onCell: (record) => buildEditableCell(record, 'date', 'expiryDate', '', isEditing, '', false)
    },
    {
      title: L('DOCUMENT_REMARK'),
      dataIndex: 'remarks',
      key: 'remarks',
      width: 50,
      ellipsis: true,
      render: (remarks) => <div className="pl-2">{remarks}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'remarks', '', isEditing, '', false)
    },
    documentFile
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}
export default columnsDocument
