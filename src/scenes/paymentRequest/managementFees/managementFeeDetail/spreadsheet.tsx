import * as React from 'react'
import { Button, Col, DatePicker, Form, Row } from 'antd'
import './spreadsheet.less'
import { L } from '@lib/abpUtility'
import { CheckCircleFilled, CloseCircleFilled, EditFilled } from '@ant-design/icons'
import { appStatusColors, dateFormat } from '@lib/appconst'
import FormNumber from '@components/FormItem/FormNumber'
import rules from './validation'
import FormInput from '@components/FormItem/FormInput'
export interface IProps {
  data?: any
  form?: any
}

const Spreadsheet: React.FunctionComponent<IProps> = ({ ...props }) => {
  const form = props?.form?.current
  const [rowEdit, setRowEdit] = React.useState(0)
  const [oldData, setOldData] = React.useState({})
  const cancelEditRow = async () => {
    props.form.current.setFieldsValue(oldData)
    setRowEdit(0)
  }

  const saveEditRow = async () => {
    const unitSize = form?.getFieldValue('unitSize') || 0
    const unitPrice = form?.getFieldValue('unitPrice') || 0
    const vatPercentage = form?.getFieldValue('vatPercentage') || 0

    const totalAmount = unitSize * unitPrice
    const vatAmount = (totalAmount * vatPercentage) / 100
    const totalAmountIncludeVAT = totalAmount + vatAmount

    form?.setFieldsValue({
      totalAmount,
      vatAmount,
      totalAmountIncludeVAT
    })
    setRowEdit(0)
  }

  return (
    <div className="table-container">
      <Row className="table-header" gutter={[8, 4]}>
        <Col span={1}>{L('STT')}</Col>
        <Col span={3}>{L('INTERPRETATION')}</Col>
        <Col span={2}>{L('START_DATE')}</Col>
        <Col span={2}>{L('END_DATE')}</Col>
        <Col span={2}>{L('MEASURE')}</Col>
        <Col span={2}>{L('AREA_M2')}</Col>
        <Col span={2}>{L('AMOUNT_M2_PER_MONTH')}</Col>
        <Col span={2}>{L('TO_AMOUNT')}</Col>
        <Col span={1}>{L('VAT')}</Col>
        <Col span={2}>{L('VAT_AMOUNT')}</Col>
        <Col span={3}>{L('TOTAL_AMOUNT_INCLUDE_VAT')}</Col>
        <Col span={2} className="d-flex justify-content-center w-100">
          {L('ACTION')}
        </Col>
      </Row>
      <Row className="table-row" gutter={[8, 4]}>
        <Col span={1}>1</Col>
        <Col span={3}>
          <FormInput name="interpretation" disabled={rowEdit !== 1} />
        </Col>
        <Col span={2}>
          <Form.Item name="startOfDate">
            <DatePicker format={dateFormat} disabled style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item name="endOfDate">
            <DatePicker format={dateFormat} disabled style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={2}>
          <FormInput name="unit" disabled={rowEdit !== 1} />
        </Col>
        <Col span={2}>
          <FormNumber rule={rules.required} name="unitSize" min={0} disabled={rowEdit !== 1} />
        </Col>
        <Col span={2}>
          <FormNumber rule={rules.required} name="unitPrice" min={0} disabled={rowEdit !== 1} />
        </Col>
        <Col span={2}>
          <FormNumber rule={rules.required} name="totalAmount" min={0} disabled={rowEdit !== 1} />
        </Col>
        <Col span={1}>
          <FormNumber rule={rules.required} name="vatPercentage" min={0} disabled={rowEdit !== 1} />
        </Col>
        <Col span={2}>
          <FormNumber rule={rules.required} name="vatAmount" min={0} disabled={rowEdit !== 1} />
        </Col>
        <Col span={3}>
          <FormNumber rule={rules.required} name="totalAmountIncludeVAT" min={0} disabled={rowEdit !== 1} />
        </Col>
        <Col span={2}>
          {rowEdit !== 1 ? (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<EditFilled />}
                onClick={() => {
                  setRowEdit(1)
                  setOldData(props.form.current?.getFieldsValue())
                }}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                type="text"
                icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
                onClick={saveEditRow}
              />
              <Button
                type="text"
                icon={<CloseCircleFilled style={{ color: appStatusColors.error }} />}
                onClick={cancelEditRow}
              />
            </div>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default Spreadsheet
