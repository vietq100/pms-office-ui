import { L, isGranted } from '@lib/abpUtility'
import VoucherStore from '@stores/fee/voucherStore'
import Stores from '@stores/storeIdentifier'
import Button from 'antd/lib/button'
import { inject, observer } from 'mobx-react'
import React from 'react'
import ReactToPrint from 'react-to-print'
import { formatCurrency } from '@lib/helper'
import moment from 'moment'
import AppConsts, { appPermissions, dateFormat } from '@lib/appconst'
import Typography from 'antd/lib/typography'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import SessionStore from '@stores/sessionStore'
import WrapPageScroll from '@components/WrapPageScroll'
import { useNavigate } from 'react-router-dom'
import NoRole from '@components/ComponentNoRole'
import { portalLayouts } from '@components/Layout/Router/router.config'
const { authorization } = AppConsts
const { Title } = Typography

const pageStyleA5 = ` 
@page {
  size: a5 landscape;
  margin: 0 !important;
}

body {
  transform: scale(0.9);
  width: 110%;  
  transform-origin: top left;
  font-size: 12px !important;
  padding: 0mm !important;
}`

type Props = {
  voucherStore: VoucherStore
  sessionStore: SessionStore
}

const PaymentPrinting = inject(
  Stores.VoucherStore,
  Stores.SessionStore
)(
  observer((props: Props) => {
    const componentRef = React.useRef(null)
    const reactToPrintContent = React.useCallback(() => {
      return componentRef.current
    }, [componentRef.current])
    const reactToPrintTriggerA5 = React.useCallback(() => {
      return <Button type="primary">{L('PRINT')}</Button>
    }, [])

    const projectLogo = localStorage.getItem(authorization.projectPictureUrl)
    const data = props.voucherStore.voucherDetail
    const navigate = useNavigate()
    const renderActions = () => {
      return (
        <Row>
          <Col sm={{ span: 24, offset: 0 }}>
            <Button
              className="mr-1"
              onClick={() =>
                navigate({
                  pathname: portalLayouts.ReceiptAndVoucher.path,
                  search: 'tabVoucher'
                })
              }
              shape="round">
              {L('BTN_CANCEL')}
            </Button>
          </Col>
        </Row>
      )
    }
    return isGranted(appPermissions.feeVoucher.detail) ? (
      <WrapPageScroll renderActions={renderActions}>
        <div className="w-100 d-flex justify-content-end mb-1">
          <ReactToPrint
            bodyClass={'p-3'}
            content={reactToPrintContent}
            documentTitle={`${L('PAYMENT')}_${props.voucherStore.voucherDetail?.receiptNumber}`}
            removeAfterPrint
            pageStyle={pageStyleA5}
            trigger={reactToPrintTriggerA5}
          />
        </div>

        <div ref={componentRef} id="voucher-detail">
          <div className="w-100 d-flex justify-content-between">
            {projectLogo && <img height="90" src={projectLogo} />}
            <div className="w-100 text-center">
              <Title level={5}>{L('PAYMENT_VOUCHER')}</Title>
            </div>

            <img height="100" src="/assets/images/logo-horizontal.png" />
          </div>
          <div className="mt-3 fw-bold">{props.sessionStore.project?.name}</div>
          <div className="d-flex">
            <div className="w-50">
              <div>
                {L('PAYMENT_TO')} : {data?.unit?.fullUnitCode || ''}
              </div>
              <div>
                {L('PAYMENT_NUMBER')} : {data?.receiptNumber || ''}
              </div>
            </div>
            <div className="w-50">
              <div>
                {L('PAYMENT_DATE')} : {moment(data?.creationTime).format(dateFormat)}
              </div>

              <div>
                {L('RECEIPT_PAYMENT_METHOD')} : {data?.paymentChannel?.name || ''}
              </div>
            </div>
          </div>
          <div className="w-100">
            <table className="w-100">
              <tbody>
                <tr>
                  <th style={{ width: '40%' }} className="text-center">
                    <p className="text-data">{L('RECEIPT_DESCRIPTION')}</p>
                  </th>
                  <th style={{ width: '30%' }} className="text-center">
                    <p className="text-data"> {L('PAYABLE_DATE')}</p>
                  </th>
                  <th style={{ width: '30%' }} className="text-center">
                    <p className="text-data"> {L('PAYABLE_AMOUNT')}</p>
                  </th>
                </tr>
                <tr>
                  <td style={{ width: '40%' }}>
                    <p className="text-data">{data.description}</p>
                  </td>
                  <td style={{ width: '30%' }} className="text-center">
                    <p className="text-data">{moment(data.payableDate).format('DD/MM/YYYY')} </p>
                  </td>
                  <td style={{ width: '30%' }} className="text-center">
                    <p className="text-data">{formatCurrency(data.totalAmount)}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-100 text-right" style={{ height: 40 }}>
            <strong className="text-data">{L('RECEIPT_TOTAL_AMOUNT')}</strong>: {formatCurrency(data?.totalAmount)}
          </div>
          <Row gutter={[32, 0]}>
            <Col span={8}>
              <div className="border-top w-100" />
              <div className="text-data">{L('VOUCHER_PRINT_1')}:</div>
            </Col>

            <Col span={8}>
              <div className="border-top w-100" />
              <div className="text-data">{L('VOUCHER_PRINT_2')}:</div>
            </Col>
            <Col span={8}>
              <div className="border-top w-100" />
              <div className="text-data">{L('VOUCHER_PRINT_3')}:</div>
            </Col>
          </Row>
        </div>

        <style scoped>{`
         table {
             border-collapse: collapse;
          
           }
          
           td,
           th {
             border: 1px solid #dddddd;
             text-align: left;
             padding: 8px;
           }`}</style>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  })
)

export default PaymentPrinting
