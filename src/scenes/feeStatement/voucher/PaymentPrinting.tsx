import { L } from '@lib/abpUtility'
import VoucherStore from '@stores/fee/voucherStore'
import Stores from '@stores/storeIdentifier'
import Button from 'antd/lib/button'
import { inject, observer } from 'mobx-react'
import React from 'react'
import ReactToPrint from 'react-to-print'
import { formatCurrency } from '@lib/helper'
import moment from 'moment'
import AppConsts, { dateFormat } from '@lib/appconst'
import Typography from 'antd/lib/typography'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import SessionStore from '@stores/sessionStore'
import WrapPageScroll from '@components/WrapPageScroll'
import { useNavigate } from 'react-router-dom'
const { authorization } = AppConsts
const { Title } = Typography
type Props = {
  voucherStore: VoucherStore
  sessionStore: SessionStore
  navigate: any
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
    const reactToPrintTrigger = React.useCallback(() => {
      return <Button type="primary">{L('PRINT')}</Button>
    }, [])
    const projectLogo = localStorage.getItem(authorization.projectPictureUrl)
    const data = props.voucherStore.voucherDetail
    const navigate = useNavigate()
    const renderActions = () => {
      return (
        <Row>
          <Col sm={{ span: 24, offset: 0 }}>
            <Button className="mr-1" onClick={() => navigate(-1)} shape="round">
              {L('BTN_CANCEL')}
            </Button>
          </Col>
        </Row>
      )
    }
    return (
      <WrapPageScroll renderActions={renderActions}>
        <div id="voucher-detail">
          <div className="w-100 d-flex justify-content-end">
            <ReactToPrint
              bodyClass={'p-3'}
              content={reactToPrintContent}
              documentTitle={`${L('PAYMENT')}_${props.voucherStore.voucherDetail?.receiptNumber}`}
              removeAfterPrint
              trigger={reactToPrintTrigger}
            />
          </div>
          <div ref={componentRef} className="p-1">
            <div>
              <div className="w-100 d-flex justify-content-between">
                <img height="100" src="/assets/images/logo-horizontal.png" />
                <div className="w-100 text-center" style={{ marginTop: 50 }}>
                  <Title level={5}>{L('PAYMENT_VOUCHER')}</Title>
                </div>
                {projectLogo && <img height="100" src={projectLogo} />}
              </div>

              {/* <div className="w-100 text-center">
              <Text type="secondary">{L('FOR_CUSTOMER')}</Text>
            </div> */}
              {/* <div className="w-100" style={{ marginTop: 20 }}>
              {L('PROJECT_NAME_')}
            </div> */}
              <div className="mt-3 fw-bold">{props.sessionStore.project.name}</div>
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
              <div className="w-120">
                <table className="w-120">
                  <tbody>
                    <tr>
                      <th style={{ width: 180 }} className="text-center">
                        <p className="text-data">{L('RECEIPT_DESCRIPTION')}</p>
                      </th>
                      <th style={{ width: 120 }} className="text-center">
                        <p className="text-data"> {L('PAYABLE_DATE')}</p>
                      </th>
                      <th style={{ width: 90 }} className="text-center">
                        <p className="text-data"> {L('PAYABLE_AMOUNT')}</p>
                      </th>
                    </tr>
                    <tr>
                      <td>
                        <p className="text-data">{data.description}</p>
                      </td>
                      <td className="text-center">
                        <p className="text-data">{moment(data.payableDate).format('DD/MM/YYYY')} </p>
                      </td>
                      <td className="text-right">
                        <p className="text-data">{formatCurrency(data.totalAmount)}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-3 w-100 text-right">
                <strong className="text-data">{L('RECEIPT_TOTAL_AMOUNT')}</strong>: {formatCurrency(data?.totalAmount)}
              </div>
              <div style={{ height: 30 }} />
              <Row gutter={[16, 0]}>
                <Col span={6}>
                  <div className="border-top w-100" />
                  <div className="text-data">{L('PAYMENT_CUSTOM_1')}:</div>
                  <div className="text-data">{L('VOUCHER_SIGN_1:')}</div>
                </Col>
                <Col span={6}>
                  <div className="border-top w-100" />
                  <div className="text-data">{L('PAYMENT_PAYER')}:</div>
                  <div className="text-data">{L('VOUCHER_SIGN_2:')}</div>
                </Col>

                <Col span={6}>
                  <div className="border-top w-100" />
                  <div className="text-data">{L('MONEY_RECEIVER')}:</div>
                  <div className="text-data">{L('VOUCHER_SIGN_3:')}</div>
                </Col>
                <Col span={6}>
                  <div className="border-top w-100" />
                  <div className="text-data">{L('PAYMENT_PAYER_1:')}</div>
                  <div className="text-data">{L('VOUCHER_SIGN_4:')}</div>
                </Col>
              </Row>

              <div className="w-100 pb-3 text-left border-bottom-dashed text-data">
                {L('PRINTED BY')}: {props.sessionStore.currentLogin.user.displayName}
              </div>
            </div>
            <style scoped>{`
          #voucher-detail {
            background-color: white;
            
            
            position: relative;
            width: 100%;
           margin:auto
            display: flex;
            flex-flow: column wrap;
           
          }
          #text-data{
            font-size:12px
          }
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
        </div>
      </WrapPageScroll>
    )
  })
)

export default PaymentPrinting
