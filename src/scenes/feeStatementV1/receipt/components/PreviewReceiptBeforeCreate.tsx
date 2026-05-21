import { Button, Col, Modal, Row, Typography } from 'antd'
import { L, isGrantedAny } from '@lib/abpUtility'
import AppConsts, { appPermissions, dateFormat } from '@lib/appconst'

import { formatCurrency } from '@lib/helper'
import ReactToPrint from 'react-to-print'
import React from 'react'
import dayjs from 'dayjs'
const { authorization } = AppConsts
const { Title } = Typography
const pageStyleA5 = ` 
@page {
  size: a5 landscape;
  margin: 0mm !important;
}

body {
  transform: scale(0.9);
  width: 110%;  
  transform-origin: center;
  font-size: 12px !important;
  padding: 0mm !important;
}`
export const PreviewReceiptBeforeCreate = ({
  isReceipt,
  visible,
  onCancel,
  dataSelect,
  payerInfo,
  sessionStore,
  isSortNew,
  onReceipt
}: any) => {
  const projectLogo = localStorage.getItem(authorization.projectPictureUrl)
  const componentRef = React.useRef(null)
  const [totalPaid, setTotalPaid] = React.useState(0)
  const reactToPrintContent = React.useCallback(() => {
    return componentRef.current
  }, [componentRef.current])
  React.useEffect(() => {
    if (visible) {
      let totalAmount = 0
      isSortNew === true
        ? dataSelect?.sort((a, b) => (new Date(b.package?.startDate) as any) - (new Date(a.package?.startDate) as any))
        : dataSelect?.sort((a, b) => (new Date(a.package?.startDate) as any) - (new Date(b.package?.startDate) as any))
      dataSelect.map((fee) => (totalAmount += Number(fee.paidAmount)))
      setTotalPaid(totalAmount)
    }
  }, [visible])
  const reactToPrintTrigger = React.useCallback(() => {
    return <Button type="primary">{L('PRINT')}</Button>
  }, [])
  return (
    <Modal
      width={'90%'}
      open={visible}
      okText={L('BTN_PRINT')}
      cancelText={L('BTN_CANCEL')}
      onCancel={() => {
        onCancel()
        setTotalPaid(0)
      }}
      footer={[
        <div key="2" className="w-100 d-flex justify-content-end">
          <Button onClick={onCancel}>{isReceipt ? L('BTN_BACK') : L('BTN_CANCEL')}</Button>
          {!isReceipt ? (
            <ReactToPrint
              bodyClass={'p-3'}
              content={reactToPrintContent}
              documentTitle={`${L('PREVIEW_RECEIPT')}`}
              removeAfterPrint
              pageStyle={pageStyleA5}
              trigger={reactToPrintTrigger}
            />
          ) : (
            <Button type="primary" onClick={onReceipt}>
              {L('BTN_RECEIPT')}
            </Button>
          )}
        </div>
      ]}
      okButtonProps={{
        disabled: !isGrantedAny(appPermissions.feeReceipt.create, appPermissions.feeReceipt.update),
        className: !isGrantedAny(appPermissions.feeReceipt.create, appPermissions.feeReceipt.update) ? 'd-none' : ''
      }}>
      <div ref={componentRef}>
        <div id="receipt-detail-preview">
          <div className="w-100 d-flex justify-content-between">
            <img height="100" src="/assets/images/logo-horizontal.png" />
            <div className="w-100 text-center" style={{ marginTop: 50 }}>
              <Title level={5}>{isReceipt ? L('RECEIPT') : L('PREVIEW_RECEIPT')}</Title>
            </div>
            {projectLogo && <img height="100" src={projectLogo} />}
          </div>
          <div className="mt-3 fw-bold">{sessionStore.project.name}</div>
          <div className="d-flex">
            <div className="w-50">
              <div>
                {L('RECEIPT_RECEIVED_NAME')} : {payerInfo?.fullName}
              </div>

              {isReceipt ? (
                <div>
                  {L('RECEIPT_PHONE')} : {payerInfo?.companyName}
                </div>
              ) : (
                <></>
              )}
              <div>
                {L('COMPANY')} : {payerInfo.companyName}
              </div>
            </div>
            {isReceipt ? (
              <div className="w-50">
                <div>
                  {L('RECEIPT_RECEIVED_DATE')} :{dayjs(payerInfo?.incomingDate).format(dateFormat)}
                </div>
                <div>{L('RECEIPT_NUMBER')} : </div>
                {isReceipt ? (
                  <div>
                    {L('RECEIPT_PAYMENT_METHOD')} : {payerInfo?.paymentName}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="w-100">
            <table className="w-100">
              <thead>
                <tr>
                  <th style={{ width: 150 }} className="text-center">
                    {L('RECEIPT_FEE_TYPE_NAME')}
                  </th>
                  <th style={{ width: 300 }} className="text-center">
                    {L('RECEIPT_DESCRIPTION')}
                  </th>
                  <th style={{ width: 150 }} className="text-center">
                    {L('RECEIPT_PERIOD')}
                  </th>
                  <th style={{ width: 200 }} className="text-center">
                    {L('RECEIPT_AMOUNT')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(dataSelect || []).map((fee, index) => (
                  <tr key={index}>
                    <td>
                      <div>{fee.feeType?.name}</div>
                    </td>
                    <td>
                      <div>{fee.description}</div>
                    </td>
                    <td className="text-center">{fee.package?.name}</td>
                    <td className="text-right">{formatCurrency(fee.paidAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isReceipt ? (
            payerInfo.cashAdvanceAmount > 0 ? (
              <div className="mt-3 w-100 text-right">
                <strong>{L('RECEIPT_FEE_RECEIPT_AMOUNT')}</strong>: {formatCurrency(payerInfo.receiptFeeAmount)}
              </div>
            ) : (
              <></>
            )
          ) : (
            <></>
          )}
          {isReceipt ? (
            payerInfo.cashAdvanceAmount > 0 ? (
              <div className="mt-3 w-100 text-right">
                <strong>{L('RECEIPT_CASH_ADVANCE_AMOUNT')}</strong>: {formatCurrency(payerInfo.cashAdvanceAmount)}
              </div>
            ) : (
              <></>
            )
          ) : (
            <></>
          )}
          <div className="mt-3 w-100 text-right">
            <strong>{L('RECEIPT_TOTAL_AMOUNT')}</strong>: {formatCurrency(totalPaid)}
          </div>

          <Row gutter={[16, 0]}>
            <Col span={6}>
              <div className="border-top w-100" />
              <div>{L('RECEIPT_ACCOUNTANT')}:</div>
            </Col>
            <Col span={6}>
              {/* <div className="border-top w-100" /> */}
              {/* <div>{L('RECEIPT_ACCOUNTANT')}:</div> */}
            </Col>
            <Col span={6}>
              <div className="border-top w-100" />
              <div>{L('RECEIPT_BII_BUIDING_MANAGER')}:</div>
            </Col>
            <Col span={6}>
              {/* <div className="border-top w-100" />
              <div>{L('RECEIVED_FROM')}:</div>*/}
            </Col>
          </Row>
        </div>

        <style scoped>{`
         table {
             border-collapse: collapse;
             width: 100%;
           }
          
           td,
           th {
             border: 1px solid #dddddd;
             text-align: left;
             padding: 8px;
           }`}</style>
      </div>
    </Modal>
  )
}
