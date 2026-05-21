import { L } from '@lib/abpUtility'
import { Col, Row } from 'antd'
import React from 'react'
import { Typography } from 'antd'
import './receipt.less'
import { formatCurrency } from '@lib/helper'
import moment from 'moment'
import AppConsts, { dateFormat } from '@lib/appconst'
import { useLocation } from 'react-router-dom'
const { Title } = Typography
const { authorization } = AppConsts

const ReceiptToPrint = () => {
  const location = useLocation()
  const [data, setData] = React.useState<any>(undefined)
  React.useEffect(() => {
    setData(JSON.parse(decodeURI(location.search).slice(1)))
  }, [location.search])
  const projectLogo = localStorage.getItem(authorization.projectPictureUrl)

  const height = 842

  React.useEffect(() => {
    getNumberPage()
  }, [])

  const getNumberPage = () => {
    const number = document.body.scrollHeight / height + 1
    return number
  }

  return data ? (
    <div id="receipt-print">
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
        <div className="mt-3 fw-bold">{data.projectName}</div>
        <div className="d-flex">
          <div className="w-50 text-data">
            <div>
              {L('RECEIPT_RECEIVED_FROM')} : {data.feePayer?.fullName}
            </div>

            <div>
              {L('RECEIPT_PHONE')} : {data.feePayer?.phoneNumber}
            </div>
            <div>
              {L('RECEIPT_UNIT_CODE')} : {data.fullUnitCode}
            </div>
          </div>
          <div className="w-50 text-data">
            <div>
              {L('RECEIPT_RECEIVED_DATE')} : {moment(data.incomingDate).format(dateFormat)}
            </div>
            <div>
              {L('RECEIPT_NUMBER')} : {data.receiptNumber}
            </div>
            <div>
              {L('RECEIPT_PAYMENT_METHOD')} : {data.paymentChanel?.name}
            </div>
          </div>
        </div>
        <div className="w-100">
          <table className="w-100">
            <thead>
              <tr>
                <th style={{ width: 130 }} className="text-center text-data">
                  {L('RECEIPT_FEE_TYPE_NAME')}
                </th>
                <th style={{ width: 300 }} className="text-center text-data">
                  {L('RECEIPT_DESCRIPTION')}
                </th>
                {/* <th style={{ width: 150 }} className="text-center">
                    {L('NOTIFICATION_NUMBER')}
                  </th> */}
                <th style={{ width: 90 }} className="text-center text-data">
                  {L('RECEIPT_PERIOD')}
                </th>
                <th style={{ width: 100 }} className="text-center text-data">
                  {L('RECEIPT_AMOUNT')}
                </th>
              </tr>
            </thead>
            <tbody>
              {(data.feeIncomingDetails || []).map((fee, index) => (
                <tr key={index}>
                  <td>
                    <div className="text-data text-data">{fee.feeDetail?.feeType?.name}</div>
                  </td>
                  <td>
                    <div className="text-data">{fee.feeDetail.description}</div>
                  </td>
                  {/* <td className="text-center">{fee.feeDetailId}</td> */}
                  <td className="text-center text-data">{fee.feeDetail.package?.name}</td>
                  <td className="text-right text-data">{formatCurrency(fee.paidAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 w-100 text-right">
          <strong>{L('RECEIPT_TOTAL_AMOUNT')}</strong>: {formatCurrency(data.paidAmount)}
        </div>
        <div style={{ height: 30 }} />
        <Row gutter={[16, 0]}>
          <Col span={6}>
            <div className="border-top w-100" />
            <div className="text-data">{L('RECEIPT_PM')}:</div>
          </Col>
          <Col span={6}>
            <div className="border-top w-100" />
            <div className="text-data">{L('RECEIPT_ACCOUNTANT')}:</div>
          </Col>
          <Col span={6}>
            <div className="border-top w-100" />
            <div className="text-data">{L('RECEIPT_BII_COLLECTOR')}:</div>
          </Col>
          <Col span={6}>
            <div className="border-top w-100" />
            <div className="text-data">{L('RECEIVED_FROM')}:</div>
          </Col>
        </Row>
        <div className="w-100 pb-3 text-left border-bottom-dashed mt-3 text-data">
          {L('PRINTED BY')}: {data?.userName}
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
    </div>
  ) : null
}

export default ReceiptToPrint
