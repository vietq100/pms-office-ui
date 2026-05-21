import { Button, Col, Modal, Row, Typography } from 'antd'
import { L, isGrantedAny } from '@lib/abpUtility'
import AppConsts, { appPermissions } from '@lib/appconst'
import { formatCurrency } from '@lib/helper'
import ReactToPrint from 'react-to-print'
import React from 'react'
const { authorization } = AppConsts
const { Title } = Typography

export const PreviewReceipt = ({ visible, onCancel, dataSend, dataShow, sessionStore, onCreate, showFrom }: any) => {
  const projectLogo = localStorage.getItem(authorization.projectPictureUrl)
  const componentRef = React.useRef(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const reactToPrintContent = React.useCallback(() => {
    return componentRef.current
  }, [componentRef.current])
  const onSave = async () => {
    setIsLoading(true)
    await onCreate()
    setIsLoading(false)
  }
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
      }}
      footer={[
        <div key={1} className="w-100 d-flex justify-content-end">
          <Button key={2} onClick={onCancel}>
            {L('BTN_CANCEL')}
          </Button>
          <ReactToPrint
            bodyClass={'p-3'}
            content={reactToPrintContent}
            documentTitle={`${L('PREVIEW_RECEIPT')}`}
            removeAfterPrint
            trigger={reactToPrintTrigger}
          />
          <Button key={3} type="primary" loading={isLoading} onClick={onSave}>
            {L('BTN_SAVE')}
          </Button>
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
              <Title level={5}>{L('PREVIEW_RECEIPT')}</Title>
            </div>
            {projectLogo && <img height="100" src={projectLogo} />}
          </div>
          <div className="mt-3 fw-bold">{sessionStore?.project?.name}</div>
          <div className="d-flex">
            <div className="w-50">
              <div>
                {L('RECEIPT_RECEIVED_NAME')} :
                {showFrom === 'Receipt'
                  ? dataShow?.fullName
                  : dataShow?.listResident?.map(
                      (item: any, index) =>
                        item?.userId === dataSend?.receiptInfo?.feePayer?.residentId && (
                          <label key={index}>{item?.displayName}</label>
                        )
                    )}
              </div>

              <div>
                {L('RECEIPT_UNIT_CODE')} :{' '}
                {showFrom === 'Receipt'
                  ? dataShow?.fullUnitCode
                  : dataShow?.fullUnitCode?.map(
                      (item: any, index) =>
                        item?.id === dataSend?.unitId && <label key={index}>{item?.fullUnitCode}</label>
                    )}
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
                  <th style={{ width: 150 }} className="text-center">
                    {L('RECEIPT_PERIOD')}
                  </th>
                  <th style={{ width: 200 }} className="text-center">
                    {L('RECEIPT_AMOUNT')}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {dataShow?.feeType?.map(
                      (item: any, index) => item?.id === dataSend?.feeTypeId && <div key={index}>{item?.name}</div>
                    )}
                  </td>
                  <td>
                    <div>{dataSend?.description}</div>
                  </td>
                  <td className="text-center">
                    {dataShow?.feePackage?.map(
                      (item: any, index) => item?.id === dataSend?.packageId && <div key={index}>{item?.name}</div>
                    )}
                  </td>
                  <td className="text-right">{formatCurrency(dataSend?.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 w-100 text-right">
            <strong>{L('RECEIPT_TOTAL_AMOUNT')}</strong>: {formatCurrency(dataSend?.totalAmount)}
          </div>

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
