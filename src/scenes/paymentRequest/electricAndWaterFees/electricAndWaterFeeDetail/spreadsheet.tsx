import * as React from 'react'
import { Button, Col, Row } from 'antd'
import { L } from '@lib/abpUtility'
import { CheckCircleFilled, CloseCircleFilled, EditFilled } from '@ant-design/icons'
import { appStatusColors } from '@lib/appconst'
import FormNumber from '@components/FormItem/FormNumber'
import { formatNumber } from '@lib/helper'
export interface IProps {
  initData?: any
  form?: any
}

const Spreadsheet: React.FunctionComponent<IProps> = ({ initData, ...props }) => {
  const [rowEdit, setRowEdit] = React.useState(0)
  const [oldData, setOldData] = React.useState({})
  const [data, setData] = React.useState({} as any)

  const cancelEditRow = async () => {
    props.form.current.setFieldsValue(oldData)
    setRowEdit(0)
  }

  const saveRow = async () => {
    const costPaidToSupplier = props.form.current.getFieldValue('costPaidToElectricitySupplierVATPercentage')
    const rentalFee = props.form.current.getFieldValue('rentalFeesVATPercentage')
    const externalFee = props.form.current.getFieldValue('externalFeesVATPercentage')
    const costPaidToInvestor = props.form.current.getFieldValue('costPaidToInvestorVATPercentage')

    const newData = {
      costPaidToElectricitySupplierVATAmount: Math.round(
        (data.costPaidToElectricitySupplier * costPaidToSupplier) / 100
      ),
      costPaidToElectricitySupplierTotalAmountIncludeVAT: Math.round(
        data.costPaidToElectricitySupplier + (data.costPaidToElectricitySupplier * costPaidToSupplier) / 100
      ),
      costPaidToInvestorVATAmount: Math.round((data.costPaidToInvestor * costPaidToInvestor) / 100),
      costPaidToInvestorTotalAmountIncludeVAT: Math.round(
        data.costPaidToInvestor + (data.costPaidToInvestor * costPaidToInvestor) / 100
      ),
      rentalFeesVATAmount: Math.round((data.rentalFees * rentalFee) / 100),
      rentalFeesTotalAmountIncludeVAT: Math.round(data.rentalFees + (data.rentalFees * rentalFee) / 100),
      externalFeesVATAmount: Math.round((data.externalFees * externalFee) / 100),
      externalFeesTotalAmountIncludeVAT: Math.round(data.externalFees + (data.externalFees * externalFee) / 100)
    }
    setData({
      ...data,
      ...newData
    })

    setRowEdit(0)
  }

  React.useEffect(() => {
    console.log(initData)
    setData(initData)
    const oldData = props.form.current.getFieldsValue()
    props.form.current.setFieldsValue({
      ...oldData,
      ...initData
    })
  }, [initData])

  return (
    <div className="table-container">
      <Row className="table-header" gutter={[16, 4]}>
        <Col span={1}>{L('STT')}</Col>
        <Col span={6}>{L('SUBJECT')}</Col>
        <Col span={4}>{L('VALUE_NOT_VAT')}</Col>
        <Col span={3}>{L('VAT_VALUE')}</Col>
        <Col span={3}>{L('VAT_AMOUNT')}</Col>
        <Col span={4}>{L('TO_PRICE_INCLUDE_VAT')}</Col>

        <Col span={3} className="d-flex justify-content-center w-100">
          {L('ACTION')}
        </Col>
      </Row>
      <Row className="table-row" gutter={[16, 4]}>
        <Col span={1}>1</Col>
        <Col span={6}>{data?.costPaidToElectricitySupplierDescription}</Col>
        <Col span={4}>{formatNumber(data?.costPaidToElectricitySupplier)}</Col>
        <Col span={3}>
          <FormNumber name="costPaidToElectricitySupplierVATPercentage" min={0} disabled={rowEdit !== 1} />
        </Col>
        <Col span={3}>{formatNumber(data?.costPaidToElectricitySupplierVATAmount)}</Col>
        <Col span={4}>{formatNumber(data?.costPaidToElectricitySupplierTotalAmountIncludeVAT)}</Col>

        <Col span={3}>
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
                onClick={() => saveRow()}
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
      <Row className="table-row" gutter={[16, 4]}>
        <Col span={1}>2</Col>
        <Col span={6}>{data?.rentalFeesDescription}</Col>
        <Col span={4}>{formatNumber(data?.rentalFees)}</Col>
        <Col span={3}>
          <FormNumber name="rentalFeesVATPercentage" min={0} disabled={rowEdit !== 2} />
        </Col>
        <Col span={3}>{formatNumber(data?.rentalFeesVATAmount)}</Col>
        <Col span={4}>{formatNumber(data?.rentalFeesTotalAmountIncludeVAT)}</Col>

        <Col span={3}>
          {rowEdit !== 2 ? (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<EditFilled />}
                onClick={() => {
                  setRowEdit(2)
                  setOldData(props.form.current?.getFieldsValue())
                }}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                type="text"
                icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
                onClick={() => saveRow()}
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
      <Row className="table-row" gutter={[16, 4]}>
        <Col span={1}>3</Col>
        <Col span={6}>{data?.externalFeesDescription}</Col>
        <Col span={4}>{formatNumber(data?.externalFees)}</Col>
        <Col span={3}>
          <FormNumber name="externalFeesVATPercentage" min={0} disabled={rowEdit !== 3} />
        </Col>
        <Col span={3}>{formatNumber(data?.externalFeesVATAmount)}</Col>
        <Col span={4}>{formatNumber(data?.externalFeesTotalAmountIncludeVAT)}</Col>

        <Col span={3}>
          {rowEdit !== 3 ? (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<EditFilled />}
                onClick={() => {
                  setRowEdit(3)
                  setOldData(props.form.current?.getFieldsValue())
                }}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                type="text"
                icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
                onClick={() => saveRow()}
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
      <Row className="table-row" gutter={[16, 4]}>
        <Col span={1}>4</Col>
        <Col span={6}>{data?.costPaidToInvestorDescription}</Col>
        <Col span={4}>{formatNumber(data?.costPaidToInvestor)}</Col>
        <Col span={3}>
          <FormNumber name="costPaidToInvestorVATPercentage" min={0} disabled={rowEdit !== 4} />
        </Col>
        <Col span={3}>{formatNumber(data?.costPaidToInvestorVATAmount)}</Col>
        <Col span={4}>{formatNumber(data?.costPaidToInvestorTotalAmountIncludeVAT)}</Col>

        <Col span={3}>
          {rowEdit !== 4 ? (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<EditFilled />}
                onClick={() => {
                  setRowEdit(4)
                  setOldData(props.form.current?.getFieldsValue())
                }}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                type="text"
                icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
                onClick={() => saveRow()}
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
    </div>
  )
}

export default Spreadsheet
