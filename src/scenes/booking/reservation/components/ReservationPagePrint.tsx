import { L } from '@lib/abpUtility'
import { Button, Col, Modal, Row } from 'antd'
import React from 'react'
import { Typography } from 'antd'
import AppConsts from '@lib/appconst'
import ReactToPrint from 'react-to-print'
import { formatCurrency, renderDate, renderTime } from '@lib/helper'
const { Title } = Typography
const { authorization } = AppConsts
const pageStyle = `@page {
    size: 210mm 148mm;
    }
    @media print {
    @page {  size: a5 landscape;
        margin: 0mm !important;
    }
    @media all {
                    .pagebreak {
                      overflow: visible; 
                    }
                }
            }
        }`
const ReservationPagePrint = ({ detailBooking, visible, onClose }) => {
  const componentRef = React.useRef(null)
  const projectLogo = localStorage.getItem(authorization.projectPictureUrl)

  const height = 842

  React.useEffect(() => {
    getNumberPage()
  }, [])
  const reactToPrintContent = React.useCallback(() => {
    return componentRef.current
  }, [componentRef.current])
  const getNumberPage = () => {
    const number = document.body.scrollHeight / height + 1
    return number
  }
  const reactToPrintTrigger = React.useCallback(() => {
    return <Button type="primary">{L('PRINT')}</Button>
  }, [])
  return (
    detailBooking && (
      <Modal
        open={visible}
        onCancel={onClose}
        className="w-75"
        destroyOnClose
        maskClosable
        footer={
          <div className="text-right">
            <Button onClick={onClose} className="mr-1">
              {L('BTN_CANCEL')}
            </Button>
            <ReactToPrint
              bodyClass={'p-3'}
              content={reactToPrintContent}
              removeAfterPrint
              documentTitle={'baobaobao'}
              pageStyle={pageStyle}
              trigger={reactToPrintTrigger}
            />
          </div>
        }>
        <div>
          <div className="w-100 d-flex justify-content-end"></div>

          <div ref={componentRef} className="p-1">
            <div id="booking-detail">
              <div className="w-100 d-flex justify-content-between">
                <img height="100" src="/assets/images/logo-horizontal.png" />
                <div className="w-100 text-center" style={{ marginTop: 50 }}>
                  <Title level={5}>{L('RESERVATION_PRINT_TITLE')}</Title>
                </div>
                {projectLogo && <img height="100" src={projectLogo ?? ''} />}
              </div>

              <div className="d-flex">
                <div className="w-50">
                  <div>
                    {L('RESERVATION_RESIDENT_DISPLAY_NAME')} : {detailBooking?.displayName}
                  </div>

                  <div>
                    {L('RESERVATION_RESIDENT_PHONE')} : {detailBooking?.phoneNumber}
                  </div>
                  <div>
                    {L('RESERVATION_RESIDENT_EMAIL')} : {detailBooking?.emailAddress}
                  </div>
                  <div>
                    {L('RESERVATION_STATUS')} : {detailBooking?.statusName}
                  </div>
                </div>
                <div className="w-50">
                  <div>
                    {L('RESERVATION_UNIT')} : {detailBooking?.fullUnitCode}
                  </div>
                  <div>
                    {L('RESERVATION_AMENITY')} :{detailBooking?.amenity?.amenityName}
                  </div>
                  <div>
                    {L('RESERVATION_PRINT_TIME')} : {renderTime(detailBooking?.startDate)} -{' '}
                    {renderTime(detailBooking?.endDate)} {renderDate(detailBooking?.startDate)}
                  </div>
                  <div>
                    {L('RESERVATION_PAYMENT_STATUS')} : {detailBooking?.paymentName}
                  </div>
                </div>
              </div>
              <div className="w-100 mb-1">
                {L('RESERVATION_DESCRIPTION')} : {detailBooking?.description}
              </div>

              <div className="w-100">
                <table className="w-100">
                  <thead>
                    <tr>
                      <th style={{ width: 200 }} className="text-center">
                        {L('FEE_FILTER_TYPE')}
                      </th>
                      <th style={{ width: 100 }} className="text-center">
                        {L('FEE_DUE_DATE')}
                      </th>
                      <th style={{ width: 150 }} className="text-center">
                        {L('FEE_BILL_NUMBER')}
                      </th>
                      <th style={{ width: 120 }} className="text-center">
                        {L('FEE_TOTAL_AMOUNT')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detailBooking.feeDetails || []).map((item: any, index) => (
                      <tr key={index}>
                        <td>
                          <div>{item?.feeType?.name}</div>
                        </td>
                        <td>
                          <div className="text-center">{renderDate(item?.dueDate)}</div>
                        </td>
                        <td className="text-center">{item?.billNumber}</td>
                        <td className="text-right">{formatCurrency(item?.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 w-100 text-right"></div>
              <Row gutter={[16, 0]}>
                <Col span={6}>
                  <div className="border-top w-100" />
                  <div>{L('RECEIPT_ACCOUNTANT')}:</div>
                </Col>
                <Col span={6}></Col>
                <Col span={6}>
                  <div className="border-top w-100" />
                  <div>{L('RECEIPT_BII_BUIDING_MANAGER')}:</div>
                </Col>
                <Col span={6}></Col>
              </Row>
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
      </Modal>
    )
  )
}

export default ReservationPagePrint
