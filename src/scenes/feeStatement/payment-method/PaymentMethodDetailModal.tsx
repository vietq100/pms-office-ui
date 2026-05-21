import FormInput from '@components/FormItem/FormInput'
import FormSelect from '@components/FormItem/FormSelect'
import FormSwitch from '@components/FormItem/FormSwitch'
import FormTextArea from '@components/FormItem/FormTextArea'
import { isGrantedAny, L } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import FeeStore from '@stores/fee/feeStore'
import Form, { useForm } from 'antd/lib/form/Form'
import { Col, Row } from 'antd/lib/grid'
import Modal from 'antd/lib/modal'
import React from 'react'

type Props = {
  feeStore: FeeStore
  visible: boolean
  closeModal: () => void
}

const PaymentMethodDetailModal = (props: Props) => {
  React.useEffect(() => {
    if (props.visible) {
      form.setFieldsValue({ ...props.feeStore.paymentMethodDetail })
    }
  }, [props.visible])
  const onCancel = () => {
    form.resetFields()
    props.closeModal()
  }

  const onCreate = async () => {
    const values = await form.validateFields()
    await props.feeStore.submitPaymentMethodDetail({
      ...values
    })
    form.resetFields()
    props.closeModal()
  }
  const [form] = useForm()
  return (
    <Modal
      open={props.visible}
      cancelText={L('BTN_CANCEL')}
      okText={L('BTN_SAVE')}
      onCancel={onCancel}
      onOk={onCreate}
      title={props.feeStore.paymentMethodDetail?.id ? L('EDIT_PAYMENT_METHOD') : L('CREATE_PAYMENT_METHOD')}
      okButtonProps={{
        disabled: !isGrantedAny(appPermissions.feeStatement.update)
      }}
      width={'75%'}>
      <Form form={form} layout="vertical" validateMessages={validateMessages} size="middle">
        <Row gutter={[16, 0]}>
          <Col sm={{ span: 12, offset: 0 }}>
            <FormInput label={L('CODE')} name="code" rule={[{ required: true }]} />
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <FormSelect
              label={L('PAYMENT_CHANNEL')}
              name="feePaymentChannelId"
              rule={[{ required: true }]}
              options={props.feeStore.paymentChannels}
            />
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <FormInput label={L('ACCOUNT_NUMBER')} name="accountNo" rule={[{ required: true }]} />
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <FormInput label={L('ADDRESS')} name="address" rule={[{ required: true }]} />
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <FormInput label={L('BRANCH_NAME')} name="branchName" rule={[{ required: true }]} />
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <FormInput label={L('BANK_CIF')} name="bankCif" rule={[{ required: true }]} />
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <FormInput label={L('BENEFICIARY_NAME')} name="beneficiaryName" rule={[{ required: true }]} />
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <FormTextArea label={L('DESCRIPTION')} name="description" rule={[{ required: true }]} />
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <FormSwitch label={L('IS_ACTIVE')} name="isActive" />
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default PaymentMethodDetailModal
