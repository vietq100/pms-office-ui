import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons'
import { formatNumber } from '@lib/helper'
import { Button } from 'antd'
import Countdown from 'antd/lib/statistic/Countdown'
import React, { useEffect } from 'react'
import { useLocation } from 'react-router'

const VnPayResultPage = () => {
  const location = useLocation()
  const [data, setData] = React.useState<any>()
  const [transactionStatus, setTransactionStatus] = React.useState<string>('')
  useEffect(() => {
    const dataParams = location.search.slice(1).split('&')
    const newData: any = dataParams.reduce(
      (a, v) => ({
        ...a,
        [v.slice(0, v.indexOf('='))]: v.slice(v.indexOf('=') + 1)
      }),
      {}
    )
    setData(newData)
    if (newData.vnp_TransactionStatus === '24') {
      setTransactionStatus('Đã hủy thanh toán.')
    } else if (newData.vnp_TransactionStatus === '00') {
      setTransactionStatus('Giao dịch thanh toán thành công')
    } else {
      setTransactionStatus('Giao dịch thanh toán không thành công')
    }
  }, [])

  const redirect = () => {
    let url
    if (data?.vnp_TransactionStatus === '00') {
      url = 'http://success.sdk.merchantbackapp'
    } else if (data?.vnp_TransactionStatus === '24') {
      url = 'http://cancel.sdk.merchantbackapp'
    } else {
      url = 'http://fail.sdk.merchantbackapp '
    }
    window.location.href = url
  }
  return (
    <div className="w-100 d-flex flex-column align-items-center justify-content-center ">
      <img src="/assets/images/logo.png" style={{ maxWidth: '140px' }} />

      <h2 className="my-3">Payment Result </h2>
      <div className="my-3">
        <div className="my-3">
          <strong style={{ minWidth: '140px', display: 'inline-block' }}>Transaction No</strong>
          <span>: {data?.vnp_TransactionNo}</span>
        </div>
        <div className="my-3">
          <strong style={{ minWidth: '140px', display: 'inline-block' }}>Total Amount</strong>
          <span>
            :{formatNumber(data?.vnp_Amount)}
            {data?.vnp_TransactionStatus === '00' ? (
              <CheckCircleFilled className="text-success mx-2 mb-1" />
            ) : (
              <CloseCircleFilled className="text-danger mx-2 mb-1" />
            )}
          </span>
        </div>
        <div className="my-3">
          <strong style={{ minWidth: '140px', display: 'inline-block' }}>Paydate</strong>
          <span>
            : {data?.vnp_PayDate?.slice(0, 4)}-{data?.vnp_PayDate?.slice(4, 6)}-{data?.vnp_PayDate?.slice(6, 8)}
            &nbsp;{data?.vnp_PayDate?.slice(8, 10)}:{data?.vnp_PayDate?.slice(10, 12)}
          </span>
        </div>
        <div className="my-3">
          <strong style={{ minWidth: '140px', display: 'inline-block' }}>Order info</strong>
          <span>: {data?.vnp_OrderInfo}</span>
        </div>
        <div className="my-3">
          <strong style={{ minWidth: '140px', display: 'inline-block' }}>Transaction Status</strong>
          <span className={data?.vnp_TransactionStatus === '00' ? 'text-success' : 'text-danger'}>
            : {transactionStatus}
          </span>
        </div>
      </div>
      <Countdown
        valueStyle={{ fontSize: '12px', color: 'grey' }}
        prefix="Auto close after"
        suffix="seconds"
        value={Date.now() + 1000 * 10}
        format="ss"
        onFinish={redirect}
      />
      <Button type="primary" onClick={redirect}>
        Back to application
      </Button>
    </div>
  )
}

export default VnPayResultPage
