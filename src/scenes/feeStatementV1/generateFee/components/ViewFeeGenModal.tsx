import { Form, Modal, Row, Col, Button } from 'antd'
import { L, isGrantedAny } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'

import FormSelect from '@components/FormItem/FormSelect'
import FormTextArea from '@components/FormItem/FormTextArea'

import rules from './validation'

import { inject, observer } from 'mobx-react'
import React, { useState } from 'react'

type Props = {
  visible: boolean
  dataView: any
  onCancel: () => void
}

const ViewFeeGenModal = inject()(
  observer((props: Props) => {
    React.useEffect(() => {
      if (props.visible) {
        initValue()
      }
    }, [props.visible])
    const [form] = Form.useForm()
    const [listPackage, setListPackage] = useState<any[]>([])
    const [listFeeTypeGen, setListFeeTypeGen] = useState<any[]>([])
    const initValue = () => {
      setListPackage([{ id: props.dataView?.feePackageId, label: props.dataView?.feePackage?.name }])
      setListFeeTypeGen([{ id: props.dataView?.feeTypeId, label: props.dataView?.feeType?.name }])
      form.setFieldsValue({
        feePackageId: props.dataView?.feePackageId,
        feeTypeId: props.dataView?.feeTypeId,
        description: props.dataView?.description
      })
    }

    const onClose = () => {
      form.resetFields()
      props.onCancel()
    }
    return (
      <Modal
        title={L('GEN_FEE_VIEW')}
        open={props.visible}
        onCancel={onClose}
        footer={[
          <>
            <Button
              onClick={() => {
                onClose()
              }}>
              {L('BTN_BACK')}
            </Button>
          </>
        ]}
        destroyOnClose
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.feeGenerate.create, appPermissions.feeGenerate.update),
          className: !isGrantedAny(appPermissions.feeGenerate.create, appPermissions.feeGenerate.update) ? 'd-none' : ''
        }}>
        <Form layout="vertical" form={form} validateMessages={validateMessages} size="middle">
          <Row gutter={16}>
            {props.dataView?.feeTypeId && (
              <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <FormSelect
                  disabled={true}
                  label={L('GEN_FEE_MODAL_FEE_TYPE')}
                  rule={rules.feeType}
                  name="feeTypeId"
                  options={listFeeTypeGen}
                />
              </Col>
            )}
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <FormSelect
                disabled={true}
                label={L('GEN_FEE_MODAL_PERIOD')}
                rule={rules.period}
                name="feePackageId"
                options={listPackage}
              />
            </Col>

            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <FormTextArea
                disabled={true}
                label={L('GEN_FEE_MODAL_PERIOD_DESCRIPTION')}
                name="description"
                rule={rules.description}
                maxLength={2001}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  })
)

export default ViewFeeGenModal
