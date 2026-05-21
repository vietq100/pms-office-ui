import { buildEditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import { calculateDuration, formatNumber, renderDate } from '@lib/helper'
import { TableColumnGroupType, TableColumnType } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import dayjs from 'dayjs'

const columnRentFee = (
  actionColumn: TableColumnGroupType<any> | TableColumnType<any>,
  isEditing: any,
  formValue?: any,
  formAmendment?: any,
  paymentTerm?: number,
  type?: string,
  originalItems?: any[],
  isSync?: boolean
) => {
  const getOriginal = (record: any) =>
    record._priceChanged && originalItems ? originalItems.find((d) => d.id === record.id) : undefined
  const isYearly = paymentTerm === 2
  const amountLabel = isYearly ? 'RENT_ONLY_IN_YEARLY' : 'RENT_ONLY_IN_MONTHLY'
  const inclVatLabel = isYearly ? 'RENT_INCLUDE_VAT_YEARLY' : 'RENT_INCLUDE_VAT'
  const data: ColumnsType<any> = [
    {
      title: L('PLAN_ITEM_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: 120,
      ellipsis: true,
      render: (year) => <div className="pl-2">{year}</div>,
      onCell: (record) => buildEditableCell(record, 'text', 'name', 'PLAN_ITEM_NAME', isEditing, '', true)
    },
    {
      title: L('START_DATE'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: 90,
      ellipsis: true,
      render: (from, record) => {
        const orig = getOriginal(record)
        return (
          <div className="pl-2">
            {renderDate(from)}
            {orig && !dayjs(orig.startDate).isSame(dayjs(from), 'day') && (
              <div style={{ fontSize: 11, color: 'red', textDecoration: 'line-through' }}>
                {renderDate(orig.startDate)}
              </div>
            )}
          </div>
        )
      },
      onCell: isSync
        ? undefined
        : (record) =>
            buildEditableCell(record, 'date', 'startDate', 'RENT_FROM', isEditing, '', true, null, null, {
              startDate: dayjs(
                type === 'management' ? formValue?.startManagementDate : formValue?.startFeeDate
              ).toJSON(),
              endDate: dayjs(formAmendment?.expiryDate ?? formValue?.expiryDate).toJSON()
            })
    },
    {
      title: L('END_DATE'),
      dataIndex: 'endDate',
      key: 'endDate',
      width: 90,
      ellipsis: true,
      render: (to, record) => {
        const orig = getOriginal(record)
        return (
          <div className="pl-2">
            {renderDate(to)}
            {orig && !dayjs(orig.endDate).isSame(dayjs(to), 'day') && (
              <div style={{ fontSize: 11, color: 'red', textDecoration: 'line-through' }}>
                {renderDate(orig.endDate)}
              </div>
            )}
          </div>
        )
      },
      onCell: isSync
        ? undefined
        : (record) =>
            buildEditableCell(record, 'date', 'endDate', 'RENT_TO', isEditing, '', true, null, null, {
              startDate: dayjs(
                type === 'management' ? formValue?.startManagementDate : formValue?.startFeeDate
              ).toJSON(),
              endDate: dayjs(formAmendment?.expiryDate ?? formValue?.expiryDate).toJSON()
            })
    },

    {
      title: L('RENT_MONTHS'),
      dataIndex: 'months',
      key: 'months',
      width: 70,
      ellipsis: true,
      render: (_, record) => {
        let duration: any = {}
        if (record.startDate && record.endDate) {
          const durationTime = calculateDuration(record.startDate, dayjs(record.endDate))

          duration = durationTime
        }
        return (
          <div className="pl-2">
            <span>{formatNumber(duration?.months)}</span>
          </div>
        )
      }
    },
    {
      title: L('RENT_DAYS'),
      dataIndex: 'days',
      key: 'days',
      width: 70,
      ellipsis: true,
      render: (_, record) => {
        let val: any = ''
        if (record.startDate && record.endDate) {
          const durationTime = calculateDuration(record.startDate, dayjs(record.endDate))

          val = durationTime.days
        }
        return <div className="pl-2">{formatNumber(val)}</div>
      }
    },
    {
      title: L(amountLabel),
      dataIndex: 'amount',
      key: 'amount',
      width: 90,
      ellipsis: false,
      render: (amount, record) => {
        const orig = getOriginal(record)
        return (
          <div className="pl-2">
            {formatNumber(amount)}
            {orig && orig.amount !== amount && (
              <div style={{ fontSize: 11, color: 'red', textDecoration: 'line-through' }}>
                {formatNumber(orig.amount)}
              </div>
            )}
          </div>
        )
      },
      onCell: isSync
        ? undefined
        : (record) => buildEditableCell(record, 'number', 'amount', amountLabel, isEditing, '', true)
    },

    {
      title: L('VAT_UNIT_AMOUNT'),
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      width: 90,
      ellipsis: true,
      render: (vatAmount, record) => {
        const orig = getOriginal(record)
        return (
          <div className="pl-2">
            {formatNumber(vatAmount)}
            {orig && orig.vatPercent !== record.vatPercent && (
              <div style={{ fontSize: 11 }}>
                <span style={{ color: 'red', textDecoration: 'line-through' }}> {orig.vatPercent}%</span> →{' '}
                <span style={{ color: 'green' }}>{record.vatPercent}%</span>
              </div>
            )}
          </div>
        )
      },
      onCell: isSync
        ? undefined
        : (record) =>
            buildEditableCell(
              record,
              'select',
              'vatPercent',
              'VAT_PERCENT',
              isEditing,
              [
                { value: 0, label: '0%' },
                { value: 5, label: '5%' },
                { value: 8, label: '8%' },
                { value: 10, label: '10%' }
              ],
              true
            )
    },
    {
      title: L(inclVatLabel),
      dataIndex: 'amountIncludeVat',
      key: 'amountIncludeVat',
      width: 90,
      ellipsis: false,
      render: (amountIncludeVat) => <div className="pl-2">{formatNumber(amountIncludeVat)}</div>
    },

    {
      title: L('TOTAL_LA_AMOUNT_EXCL_VAT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 90,
      ellipsis: false,
      render: (totalAmount) => <div className="pl-2">{formatNumber(totalAmount)}</div>
    },
    {
      title: L('TOTAL_LA_AMOUNT_INCLUDE_VAT'),
      dataIndex: 'totalAmountIncludeVat',
      key: 'totalAmountIncludeVat',
      width: 90,
      ellipsis: false,
      render: (totalAmount) => <div className="pl-2">{formatNumber(totalAmount)}</div>
    }
  ]
  if (actionColumn) {
    data.push(actionColumn)
  }
  return data
}
export default columnRentFee
