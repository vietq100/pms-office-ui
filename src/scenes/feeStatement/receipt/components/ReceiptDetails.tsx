import { L } from '@lib/abpUtility'
import ReceiptStore from '@stores/fee/receiptStore'
import Stores from '@stores/storeIdentifier'
import { Button, Col, Row, Spin } from 'antd'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Typography } from 'antd'
import './receipt.less'
import { formatCurrency } from '@lib/helper'
import moment from 'moment'
import AppConsts, { dateFormat } from '@lib/appconst'
import SessionStore from '@stores/sessionStore'
import { publicLayout } from '@components/Layout/Router/router.config'
import WrapPageScroll from '@components/WrapPageScroll'
const { Title } = Typography
const { authorization } = AppConsts

interface Props {
  receiptStore: ReceiptStore
  sessionStore: SessionStore
}

const ReceiptDetails = inject(
  Stores.ReceiptStore,
  Stores.SessionStore
)(
  observer((props: Props) => {
    const params: any = useParams()
    const [loading, setLoading] = React.useState(false)
    React.useEffect(() => {
      setLoading(true)
      const id = params.id
      if (id) {
        props.receiptStore.getDetail(id).finally(() => setLoading(false))
      }
    }, [])
    const navigate = useNavigate()
    const handlePrint = () => {
      navigate({
        pathname: publicLayout.printReceipt.path.replace(':id', params.id),
        search: JSON.stringify({
          ...props.receiptStore.receiptDetail,
          receivedFrom: props.receiptStore.receiptDetail.feePayer?.fullName,
          email: props.receiptStore.receiptDetail.feePayer?.email,
          phoneNumber: props.receiptStore.receiptDetail.feePayer?.phoneNumber,
          receiptNumber: props.receiptStore.receiptDetail.receiptNumber,
          paymentMethod: props.receiptStore.receiptDetail.paymentChanel?.name,
          feeIncomingDetails: props.receiptStore.receiptDetail.feeIncomingDetails,
          paidAmount: props.receiptStore.receiptDetail.paidAmount,
          userName: props.sessionStore.currentLogin.user.displayName,
          projectName: props.sessionStore.project.name
        })
      })
    }
    const projectLogo = localStorage.getItem(authorization.projectPictureUrl)
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
    return loading ? (
      <div className="w-100 text-center">
        <Spin />
      </div>
    ) : (
      <WrapPageScroll renderActions={renderActions}>
        <div>
          <div className="w-100 pb-3 pt-3 pr-3 d-flex justify-content-end">
            <Button onClick={handlePrint}>{L('PRINT')}</Button>
          </div>
          {props.receiptStore.receiptDetail && (
            <div id="receipt-detail">
              <div className="w-100 d-flex justify-content-between">
                <img height="100" src="/assets/images/logo-horizontal.png" />
                <div className="w-100 text-center" style={{ marginTop: 50 }}>
                  <Title level={5}>{L('RECEIPT')}</Title>
                </div>
                {projectLogo && <img height="100" src={projectLogo} />}
              </div>

              {/* <div className="w-100 text-center">
              <Text>{L('COPY')}</Text>
            </div>
            <div className="w-100 text-center">
              <Text type="secondary">{L('FOR_CUSTOMER')}</Text>
            </div> */}
              <div className="mt-3 fw-bold">{props.sessionStore.project.name}</div>

              <div className="d-flex">
                <div className="w-50">
                  <div>
                    {L('RECEIPT_RECEIVED_FROM')} : {props.receiptStore.receiptDetail.feePayer?.fullName}
                  </div>

                  <div>
                    {L('RECEIPT_PHONE')} : {props.receiptStore.receiptDetail.feePayer?.phoneNumber}
                  </div>
                  <div>
                    {L('RECEIPT_UNIT_CODE')} : {props.receiptStore.receiptDetail.fullUnitCode}
                  </div>
                </div>
                <div className="w-50">
                  <div>
                    {L('RECEIPT_RECEIVED_DATE')} :{' '}
                    {moment(props.receiptStore.receiptDetail.incomingDate).format(dateFormat)}
                  </div>
                  <div>
                    {L('RECEIPT_NUMBER')} : {props.receiptStore.receiptDetail.receiptNumber}
                  </div>
                  <div>
                    {L('RECEIPT_PAYMENT_METHOD')} : {props.receiptStore.receiptDetail.paymentChanel?.name}
                  </div>
                </div>
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
                      {/* <th style={{ width: 150 }} className="text-center">
                    {L('NOTIFICATION_NUMBER')}
                  </th> */}
                      <th style={{ width: 150 }} className="text-center">
                        {L('RECEIPT_PERIOD')}
                      </th>
                      <th style={{ width: 200 }} className="text-center">
                        {L('RECEIPT_AMOUNT')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(props.receiptStore.receiptDetail.feeIncomingDetails || []).map((fee, index) => (
                      <tr key={index}>
                        <td>
                          <div>{fee.feeDetail?.feeType?.name}</div>
                        </td>
                        <td>
                          <div>{fee.feeDetail?.description}</div>
                        </td>
                        {/* <td className="text-center">{fee.feeDetailId}</td> */}
                        <td className="text-center">{fee.feeDetail?.package?.name}</td>
                        <td className="text-right">{formatCurrency(fee.paidAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 w-100 text-right">
                <strong>{L('RECEIPT_TOTAL_AMOUNT')}</strong>:{' '}
                {formatCurrency(props.receiptStore.receiptDetail.paidAmount)}
              </div>
              <div style={{ height: 150 }} />
              <Row gutter={[16, 0]}>
                <Col span={6}>
                  <div className="border-top w-100" />
                  <div>{L('RECEIPT_PM')}:</div>
                </Col>
                <Col span={6}>
                  <div className="border-top w-100" />
                  <div>{L('RECEIPT_ACCOUNTANT')}:</div>
                </Col>
                <Col span={6}>
                  <div className="border-top w-100" />
                  <div>{L('RECEIPT_BII_COLLECTOR')}:</div>
                </Col>
                <Col span={6}>
                  <div className="border-top w-100" />
                  <div>{L('RECEIVED_FROM')}:</div>
                </Col>
              </Row>
              <div className="w-100 pb-3 text-left border-bottom-dashed mt-3">
                {L('PRINTED BY')}: {props.sessionStore.currentLogin.user.displayName}
              </div>
            </div>
          )}
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
      </WrapPageScroll>
    )
  })
)

export default ReceiptDetails
