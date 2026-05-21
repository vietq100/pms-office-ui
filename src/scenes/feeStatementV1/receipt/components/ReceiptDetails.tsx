import { L, isGranted } from '@lib/abpUtility'
import AppConsts, { appPermissions, dateFormat } from '@lib/appconst'
import { formatCurrency } from '@lib/helper'
import ReceiptStore from '@stores/fee/receiptStore'
import SessionStore from '@stores/sessionStore'
import Stores from '@stores/storeIdentifier'
import { Button, Col, Row, Spin } from 'antd'
import { Typography } from 'antd'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactToPrint from 'react-to-print'
import NoRole from '@components/ComponentNoRole'
import WrapPageScroll from '@components/WrapPageScroll'
import { portalLayouts } from '@components/Layout/Router/router.config'
import './receipt.less'

const { Title } = Typography
const { authorization } = AppConsts
const pageStyleA5 = `
@page {
  size: a5 landscape;
  margin: 0 !important;
}
body {
  transform: scale(0.9);
  width: 110%;
  transform-origin: center;
  font-size: 12px !important;
  padding: 0mm !important;
}`

interface Props {
  receiptStore?: ReceiptStore
  sessionStore?: SessionStore
}

const ReceiptDetails = observer(({ receiptStore, sessionStore }: Props) => {
  const params: any = useParams()
  const navigate = useNavigate()
  const componentRef = useRef(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isGranted(appPermissions.feeReceipt.detail)) return
    const id = params.id
    if (id) {
      setLoading(true)
      receiptStore?.getDetail(id).finally(() => setLoading(false))
    }
  }, [])

  const reactToPrintContent = useCallback(() => componentRef.current, [componentRef.current])
  const reactToPrintTrigger = useCallback(() => <Button type="primary">{L('PRINT')}</Button>, [])

  const projectLogo = localStorage.getItem(authorization.projectPictureUrl)

  const renderActions = () => (
    <Row>
      <Col sm={{ span: 24, offset: 0 }}>
        <Button
          className="mr-1"
          onClick={() => navigate({ pathname: portalLayouts.ReceiptAndVoucher.path, search: 'tabReceipt' })}
          shape="round">
          {L('BTN_CANCEL')}
        </Button>
      </Col>
    </Row>
  )

  if (!isGranted(appPermissions.feeReceipt.detail)) return <NoRole />

  if (loading)
    return (
      <div className="w-100 text-center">
        <Spin />
      </div>
    )

  const { receiptDetail } = receiptStore!

  return (
    <WrapPageScroll renderActions={renderActions}>
      <div className="w-100 d-flex justify-content-end mb-1">
        <ReactToPrint
          content={reactToPrintContent}
          removeAfterPrint
          documentTitle={`${L('RECEIPT')}_${receiptDetail?.receiptNumber}`}
          pageStyle={pageStyleA5}
          trigger={reactToPrintTrigger}
        />
      </div>
      <div>
        {receiptDetail && (
          <div ref={componentRef} id="receipt-detail">
            <div className="w-100 d-flex justify-content-between">
              {projectLogo && <img height="90" src={projectLogo} />}
              <div className="w-100 text-center">
                <Title level={5}>{L('RECEIPT')}</Title>
              </div>
              <img height="100" src="/assets/images/logo-horizontal.png" />
            </div>

            <div className="mt-3 fw-bold">{sessionStore?.project?.name}</div>

            <div className="d-flex">
              <div className="w-50">
                <div>
                  {L('RECEIPT_RECEIVED_FROM')} : {receiptDetail.feePayer?.fullName}
                </div>
                <div>
                  {L('RECEIPT_PHONE')} : {receiptDetail.feePayer?.phoneNumber}
                </div>
                <div>
                  {L('RECEIPT_UNIT_CODE')} : {receiptDetail.fullUnitCode}
                </div>
              </div>
              <div className="w-50">
                <div>
                  {L('RECEIPT_RECEIVED_DATE')} : {moment(receiptDetail.incomingDate).format(dateFormat)}
                </div>
                <div>
                  {L('RECEIPT_NUMBER')} : {receiptDetail.receiptNumber}
                </div>
                <div>
                  {L('RECEIPT_PAYMENT_METHOD')} : {receiptDetail.paymentChannel?.name}
                </div>
              </div>
            </div>

            <div className="w-100">
              <table className="w-100">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }} className="text-center">
                      {L('RECEIPT_FEE_TYPE_NAME')}
                    </th>
                    <th style={{ width: '25%' }} className="text-center">
                      {L('RECEIPT_DESCRIPTION')}
                    </th>
                    <th style={{ width: '20%' }} className="text-center">
                      {L('RECEIPT_PERIOD')}
                    </th>
                    <th style={{ width: '30%' }} className="text-center">
                      {L('RECEIPT_AMOUNT')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(receiptDetail.feeIncomingDetails || []).map((fee, index) => (
                    <tr key={index}>
                      <td style={{ width: '25%' }}>
                        <p className="text-data">{fee.feeDetail?.feeType?.name}</p>
                      </td>
                      <td style={{ width: '25%' }}>
                        <p className="text-data">{fee.feeDetail?.description}</p>
                      </td>
                      <td style={{ width: '20%' }} className="text-center">
                        <p className="text-data">{fee.feeDetail?.package?.name}</p>
                      </td>
                      <td style={{ width: '30%' }} className="text-right">
                        <p className="text-data">{formatCurrency(fee.paidAmount)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="w-100 text-right">
              <strong>{L('RECEIPT_FEE_RECEIPT_AMOUNT')}</strong>: {formatCurrency(receiptDetail.paidAmount)}
            </div>
            {receiptDetail.cashAdvanceAmount > 0 && (
              <div className="w-100 text-right">
                <strong>{L('RECEIPT_CASH_ADVANCE_AMOUNT')}</strong>: {formatCurrency(receiptDetail.cashAdvanceAmount)}
              </div>
            )}
            {receiptDetail.cashAdvanceAmount > 0 && (
              <div className="w-100 text-right" style={{ height: 60 }}>
                <strong>{L('RECEIPT_TOTAL_AMOUNT')}</strong>: {formatCurrency(receiptDetail.actualPaidAmount ?? 0)}
              </div>
            )}
            <Row gutter={[32, 0]}>
              <Col span={8}>
                <div className="border-top w-100" />
                <div>{L('RECEIPT_SIGN_1')}:</div>
              </Col>
              <Col span={8}>
                <div className="border-top w-100" />
                <div>{L('RECEIPT_SIGN_2')}:</div>
              </Col>
              <Col span={8}>
                <div className="border-top w-100" />
                <div>{L('RECEIPT_SIGN_3')}:</div>
              </Col>
            </Row>
          </div>
        )}
        <style scoped>{`
          table { border-collapse: collapse; }
          td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; }
        `}</style>
      </div>
    </WrapPageScroll>
  )
})

export default inject(Stores.ReceiptStore, Stores.SessionStore)(ReceiptDetails)
