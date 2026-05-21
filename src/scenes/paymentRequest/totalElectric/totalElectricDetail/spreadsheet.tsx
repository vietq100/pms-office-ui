import * as React from 'react'
import { Button, Col, Row } from 'antd'
import './spreadsheet.less'
import { L } from '@lib/abpUtility'
import { CheckCircleFilled, CloseCircleFilled, EditFilled } from '@ant-design/icons'
import { appStatusColors } from '@lib/appconst'
import FormNumber from '@components/FormItem/FormNumber'
import rules from './validation'
export interface IProps {
  data?: any
  form?: any
}

const Spreadsheet: React.FunctionComponent<IProps> = ({ ...props }) => {
  const form = props.form?.current
  const [rowEdit, setRowEdit] = React.useState(0)
  const [oldData, setOldData] = React.useState({})
  const cancelEditRow = async () => {
    props.form.current.setFieldsValue(oldData)
    setRowEdit(0)
  }

  const handleEditRowValues = (prefix: string) => {
    const from = form?.getFieldValue(`${prefix}FromIndex`) || 0
    const to = form?.getFieldValue(`${prefix}ToIndex`) || 0
    const unitPrice = form?.getFieldValue(`${prefix}UnitPrice`) || 0
    const vat = form?.getFieldValue('vatPercentage') || 0

    const total = Number(to) - Number(from)
    const totalAmount = unitPrice * total
    const totalAmountWithVat = totalAmount + (totalAmount * vat) / 100

    form?.setFieldsValue({
      [`${prefix}Total`]: total,
      [`${prefix}TotalAmount`]: totalAmount,
      [`${prefix}TotalAmountIncludeVAT`]: totalAmountWithVat
    })
  }

  const renderRow = (prefix: string, label: string, rowId: number) => (
    <Row className="table-row" gutter={[16, 8]}>
      <Col span={3}>{label}</Col>
      {['FromIndex', 'ToIndex', 'Total', 'UnitPrice', 'TotalAmount', 'TotalAmountIncludeVAT'].map((field) => (
        <Col span={3} key={field}>
          <FormNumber rule={rules.required} name={`${prefix}${field}`} min={0} disabled={rowEdit !== rowId} />
        </Col>
      ))}
      <Col span={3}>
        {rowEdit !== rowId ? (
          <div className="d-flex justify-content-center w-100">
            <Button
              size="small"
              shape="circle"
              className="mr-1"
              icon={<EditFilled />}
              onClick={() => {
                setRowEdit(rowId)
                handleEditRowValues(prefix)
                setOldData(props.form.current?.getFieldsValue())
              }}
            />
          </div>
        ) : (
          <div className="d-flex justify-content-center w-100">
            <Button
              type="text"
              icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
              onClick={() => {
                setRowEdit(0)
                handleEditRowValues(prefix)
              }}
            />
            <Button
              type="text"
              icon={<CloseCircleFilled style={{ color: appStatusColors.error }} />}
              onClick={() => cancelEditRow()}
            />
          </div>
        )}
      </Col>
    </Row>
  )

  return (
    <div className="table-container">
      <Row className="table-header" gutter={[16, 8]}>
        <Col span={3}>{L('TIME_FRAME')}</Col>
        <Col span={3}>{L('INDEX_OLD')}</Col>
        <Col span={3}>{L('INDEX_TO')}</Col>
        <Col span={3}>{L('METER_QUANTITY')}</Col>
        <Col span={3}>{L('UNIT_PRICE')}</Col>
        <Col span={3}>{L('TOTAL_AMOUNT_NOT_VAT')}</Col>
        <Col span={3}>{L('TOTAL_AMOUNT_VAT')}</Col>
        <Col span={3} className="d-flex justify-content-center w-100">
          {L('ACTION')}
        </Col>
      </Row>
      {renderRow('low', L('LOW_SCORE'), 1)}
      {renderRow('peak', L('HIGH_SOCRE'), 2)}
      {renderRow('normal', L('NORMAL_SCORE'), 3)}
    </div>
  )
}

export default Spreadsheet
