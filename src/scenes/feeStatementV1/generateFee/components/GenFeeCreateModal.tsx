import { Form, Modal, Row, Col, Button } from 'antd'
import { L, isGrantedAny } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'

import FormSelect from '@components/FormItem/FormSelect'
import FormTextArea from '@components/FormItem/FormTextArea'

import rules from './validation'
import FeeGenerateStore from '@stores/fee/feeGenerateStore'
import { inject, observer } from 'mobx-react'
import FeeStore from '@stores/fee/feeStore'
import Stores from '@stores/storeIdentifier'
import React, { useState } from 'react'
import PackageFeeStore from '@stores/fee/packageFeeStore'
import packageFeeService from '@services/fee/packageFeeService'
import feeTypeService from '@services/fee/feeTypeService'
import { addItemToList } from '@lib/helper'

type Props = {
  visible: boolean
  onCancel: () => void
  feeGenerateStore: FeeGenerateStore
  feeStore: FeeStore
  packageFeeStore?: PackageFeeStore
}

const GenFeeCreateModal = inject(
  Stores.FeeGenerateStore,
  Stores.FeeStore
)(
  observer((props: Props) => {
    React.useEffect(() => {
      let isMounted = true

      const init = async () => {
        if (props.visible) {
          const feePackageCurrent = await feeTypeService.getCurrent()

          await getPackageFee('')
          await getListFeeTypeGen('')

          if (isMounted) {
            form.setFieldsValue({ feePackageId: feePackageCurrent?.id || null })
            setListPackage((prev) => {
              const clone = [...prev]
              addItemToList(clone, feePackageCurrent)
              return clone
            })
          }
        }
      }

      init()

      return () => {
        isMounted = false
      }
    }, [props.visible])
    const [form] = Form.useForm()
    const [listPackage, setListPackage] = useState<any[]>([])
    const [listFeeTypeGen, setListFeeTypeGen] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const getPackageFee = async (value) => {
      const packages = await packageFeeService.filter({
        keyword: value,
        isClosed: false
      })
      setListPackage(packages)
    }
    const getListFeeTypeGen = async (value?) => {
      const listFeeTypeGen = await feeTypeService.getList({ isActive: true, keyword: value })
      setListFeeTypeGen(listFeeTypeGen)
    }

    const handleSubmit = async () => {
      const formValues = await form
        .validateFields()
        .then((values) => {
          return {
            feePackageId: values.feePackageId,
            feeTypeId: values.feeTypeId,
            description: values.description
          }
        })
        .catch((err) => {
          console.error('Validation failed:', err)
          return {}
        })
      setLoading(true)
      await props.feeGenerateStore.create(formValues)
      await form.resetFields()
      setLoading(false)
      props.onCancel()
    }
    const onClose = () => {
      form.resetFields()
      props.onCancel()
    }
    return (
      <Modal
        title={L('GEN_FEE_CREATE')}
        open={props.visible}
        okText={L('BTN_SAVE')}
        onOk={handleSubmit}
        cancelText={L('BTN_CANCEL')}
        onCancel={onClose}
        footer={[
          <>
            <Button
              onClick={() => {
                onClose()
              }}>
              {L('BTN_CANCEL')}
            </Button>
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              {L('OK')}
            </Button>
          </>
        ]}
        destroyOnClose
        maskClosable={false}
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.feeGenerate.create),
          className: !isGrantedAny(appPermissions.feeGenerate.create) ? 'd-none' : ''
        }}>
        <Form layout="vertical" form={form} validateMessages={validateMessages} size="middle">
          <Row gutter={16}>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <FormSelect
                label={L('GEN_FEE_MODAL_FEE_TYPE')}
                selectProps={{
                  onSearch: getListFeeTypeGen
                }}
                rule={rules.feeType}
                name="feeTypeId"
                options={listFeeTypeGen}
              />
            </Col>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <FormSelect
                label={L('GEN_FEE_MODAL_PERIOD')}
                selectProps={{
                  onSearch: getPackageFee
                }}
                rule={rules.period}
                name="feePackageId"
                options={listPackage}
              />
            </Col>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <FormTextArea
                label={L('GEN_FEE_MODAL_PERIOD_DESCRIPTION')}
                name="description"
                rule={[{ max: 2000 }]}
                maxLength={2001}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  })
)

export default GenFeeCreateModal
