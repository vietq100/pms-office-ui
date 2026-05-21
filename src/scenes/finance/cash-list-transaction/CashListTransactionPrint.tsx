import { L, isGranted } from '@lib/abpUtility'
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
import CashAdvanceStore from '@stores/finance/cashAdvanceStore'
import './style.less'

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
  cashAdvanceStore: CashAdvanceStore
  sessionStore: SessionStore
}

const CashAdvanceTransPrinting = inject(
  Stores.CashAdvanceStore,
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
    const data = props.cashAdvanceStore.cashReceiptInfo
    const navigate = useNavigate()
    const renderActions = () => {
      return (
        <Row>
          <Col sm={{ span: 24, offset: 0 }}>
            <Button
              className="mr-1"
              onClick={() =>
                navigate({
                  pathname: portalLayouts.cashAdvance.path,
                  search: 'cashAdvancesTransaction'
                })
              }
              shape="round">
              {L('BTN_CANCEL')}
            </Button>
          </Col>
        </Row>
      )
    }
    return isGranted(appPermissions.CashAdvance.detail) ? (
      <WrapPageScroll renderActions={renderActions}>
        <div className="w-100 d-flex justify-content-end mb-1">
          <ReactToPrint
            bodyClass={'p-3'}
            content={reactToPrintContent}
            documentTitle={`${L('CASH_ADVANCE')}_${props.cashAdvanceStore.cashReceiptInfo?.receiptNumber}`}
            removeAfterPrint
            pageStyle={pageStyleA5}
            trigger={reactToPrintTriggerA5}
          />
        </div>
        <div>
          <div ref={componentRef} id="voucher-detail">
            <div className="w-100 d-flex justify-content-between">
              <img height="90" src="/assets/images/logo-horizontal.png" />
              <div className="w-100 text-center">
                <Title level={5}>{L('CASH_ADVAND_TITLE')}</Title>
              </div>
              {projectLogo && <img height="90" src={projectLogo} />}
            </div>
            <div className="mt-3 fw-bold">{props.sessionStore.project?.name}</div>
            <div className="d-flex">
              <div className="w-50">
                <div>
                  {L('CASH_ADV_DATE')} : {moment(data?.cashReceiptDate).format(dateFormat)}
                </div>
                <div>
                  {L('CASH_ADV_UNIT_CODE')} : {data?.cashAdvance?.unit?.fullUnitCode || ''}
                </div>
              </div>
              <div className="w-50">
                <div>
                  {L('CASH_ADV_NUMBER')} : {data?.receiptNumber || ''}
                </div>
                <div>
                  {L('CASH_ADV_PAYMENT_METHOD')} : {data?.cashChanel?.name || ''}
                </div>
                <div>
                  {L('CASH_ADV_PAYMENT_TYPE')} : {data?.cashTransactionType?.name || ''}
                </div>
              </div>
            </div>
            <div className="w-100">
              <table className="w-100">
                <thead>
                  <tr>
                    <th style={{ width: '33%' }} className="text-center">
                      {L('RECEIPT_FEE_TYPE_NAME')}
                    </th>
                    <th style={{ width: '33%' }} className="text-center">
                      {L('RECEIPT_DESCRIPTION')}
                    </th>

                    <th style={{ width: '33%' }} className="text-center">
                      {L('RECEIPT_AMOUNT')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ width: '33%' }}>
                      <p className="text-data">{data.cashAdvance?.feeType?.name}</p>
                    </td>
                    <td style={{ width: '33%' }}>
                      <p className="text-data">{data?.description}</p>
                    </td>

                    <td style={{ width: '33%' }} className="text-right">
                      <p className="text-data">{formatCurrency(data?.totalAmount)}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-1 w-100 text-right" style={{ height: 70 }}>
              <strong className="text-data">{L('RECEIPT_TOTAL_AMOUNT')}</strong>: {formatCurrency(data?.totalAmount)}
            </div>

            <Row gutter={[16, 0]}>
              <Col span={6}>
                <div className="border-top w-100" />
                <div className="text-data">{L('CASH_ADV_SIGN_1')}:</div>
              </Col>
              <Col span={6}></Col>

              <Col span={6}>
                <div className="border-top w-100" />
                <div className="text-data">{L('CASH_ADV_SIGN_2')}:</div>
              </Col>
              <Col span={6}></Col>
            </Row>

            {/* <div className="w-100 pb-2 text-left border-bottom-dashed text-data">
              {L('PRINTED BY')}: {props.sessionStore.currentLogin.user.displayName}
            </div> */}
          </div>
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
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  })
)

export default CashAdvanceTransPrinting
