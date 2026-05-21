import { Button, Checkbox, Modal } from 'antd'
import { L, LNotification, isGrantedAny } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'

import { formatCurrency } from '@lib/helper'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { useEffect, useState } from 'react'

export const ConfirmCreateReceiptModal = ({ visible, onCancel, onOk, feeGroups, isLoadingConfirmSave }: any) => {
  const [agreeToUCashAdvance, setAgreeToUCashAdvance] = useState(false)
  const [feeDetails, setFeeDetails] = useState([])

  useEffect(() => {
    if (!visible) {
      return
    }
    const feeDetails = feeGroups?.reduce((data, group) => {
      const positivePaidAmountFee = (group.feeDetails || []).filter((item) => item.paidAmount > item.debitAmount)
      return [...data, ...positivePaidAmountFee]
    }, [])
    setFeeDetails(feeDetails)
    setAgreeToUCashAdvance(!feeDetails?.length ? true : false)
  }, [visible, feeGroups])

  const onSave = async () => {
    await onOk()
  }
  return (
    <Modal
      open={visible}
      centered
      title={LNotification(
        feeDetails?.length
          ? 'ARE_YOU_AGREE_THE_BELLOW_REMAINING_AMOUNT_WILL_MOVE_TO_CASH_ADVANCE'
          : 'DO_YOU_WANT_TO_CREATE_THIS_RECEIPT'
      )}
      okText={L('BTN_PRINT')}
      cancelText={L('BTN_CANCEL')}
      onCancel={onCancel}
      destroyOnClose
      footer={[
        <div key="2" className="w-100 d-flex justify-content-end">
          <Button onClick={onCancel}>{L('BTN_CANCEL')}</Button>
          <Button onClick={onSave} loading={isLoadingConfirmSave} type="primary" disabled={!agreeToUCashAdvance}>
            {L('BTN_OK')}
          </Button>
        </div>
      ]}
      maskClosable={false}
      okButtonProps={{
        disabled: !isGrantedAny(appPermissions.feeReceipt.create, appPermissions.feeReceipt.update),
        className: !isGrantedAny(appPermissions.feeReceipt.create, appPermissions.feeReceipt.update) ? 'd-none' : ''
      }}>
      {feeDetails?.length > 0 && (
        <>
          <table className="cash-advance-confirm">
            <thead>
              <tr>
                <th className="text-left">{L('FEE_TYPE')}</th>
                <th className="text-right">{L('ADDED_CASH_ADVANCE_AMOUNT')}</th>
              </tr>
            </thead>
            <tbody>
              {feeDetails.map((item: any, index) => (
                <tr key={index}>
                  <td>{item.feeTypeName}</td>
                  <td className="text-right">{formatCurrency(item.paidAmount - item.debitAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Checkbox className="mt-3" onChange={(e: CheckboxChangeEvent) => setAgreeToUCashAdvance(e.target.checked)}>
            {L('AGREE_WITH_CASH_ADVANCE_TERM_OF_USE')}
          </Checkbox>
        </>
      )}
    </Modal>
  )
}
