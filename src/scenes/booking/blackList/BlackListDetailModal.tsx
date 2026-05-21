import { Form, Modal, Row, Col } from 'antd'
import { L, isGranted, isGrantedAny } from '@lib/abpUtility'
import { appPermissions, dateTimeFormat } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import rules from './validation'
import React from 'react'
import FormSelect from '@components/FormItem/FormSelect'
import FormTextArea from '@components/FormItem/FormTextArea'
import FormDateRangePicker from '@components/FormItem/FormDateRangePicker'
import amenityService from '@services/booking/amenityService'
import { debounce } from 'lodash'
import handoverService from '@services/handover/handoverService'
import { removeDuplicateObjectInArray } from '@lib/helper'

export const BlackListDetailModal = ({ visible, onCancel, id, amenityStore }: any) => {
  React.useEffect(() => {
    searchUnits('')
    searchAmenity('')
  }, [])
  React.useEffect(() => {
    if (visible && amenityStore?.blackListDetail) {
      form.setFieldsValue(amenityStore?.blackListDetail)
      const res = removeDuplicateObjectInArray([...amenities, ...amenityStore.blackListDetail.amenities], 'id')
      setAmenities(res)
    } else {
      form.resetFields()
    }
  }, [visible])
  const [form] = Form.useForm()
  const handleSubmit = async () => {
    const formValues = await form.validateFields()
    await amenityStore.updateBlackListDetail(formValues)
    onCancel()
  }
  const [amenities, setAmenities] = React.useState<any[]>([])
  const searchAmenity = async (keyword) => {
    const res = await amenityService.getSearchAmenity({ keyword })
    setAmenities(res.items.map((item) => ({ id: item.id, label: item.amenityName })))
  }
  const [units, setUnits] = React.useState<any[]>([])
  const searchUnits = async (keyword) => {
    const res = await handoverService.getListUnit({ keyword })
    setUnits(res)
  }
  return (
    <Modal
      title={id ? L('EDIT_BLOCKING_USER') : L('ADD_BLOCKING_USER')}
      open={visible}
      okText={L('BTN_SAVE')}
      onOk={handleSubmit}
      cancelText={L('BTN_CANCEL')}
      onCancel={onCancel}
      destroyOnClose
      maskClosable={false}
      okButtonProps={{
        disabled: id && !isGranted(appPermissions.amenityBlacklist.update),
        className: !isGrantedAny(appPermissions.amenityBlacklist.create, appPermissions.amenityBlacklist.update)
          ? 'd-none'
          : ''
      }}>
      <Form layout="vertical" form={form} validateMessages={validateMessages} size="middle">
        <Row gutter={16}>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <FormSelect
              label={L('UNIT')}
              rule={rules.required}
              name="unitId"
              options={units}
              selectProps={{
                onSearch: debounce(searchUnits, 300),
                disabled: id ? true : false
              }}
            />
          </Col>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <FormSelect
              label={L('AMENITY')}
              selectProps={{
                mode: 'multiple',
                onSearch: debounce(searchAmenity, 300)
              }}
              rule={rules.required}
              name="amenityIds"
              options={amenities}
            />
          </Col>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <FormDateRangePicker
              dateTimeFormat={dateTimeFormat}
              name="time"
              rule={rules.required}
              label={L('BLOCKING_TIME')}
              dateTimeProps={{ showTime: true }}
            />
          </Col>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <FormTextArea label={L('REASON')} name="reasonNote" rule={rules.reasonNote} />
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
